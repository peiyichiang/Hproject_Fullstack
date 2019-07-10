pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
import "./SafeMath.sol";

interface HeliumITF_IM{
    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor);
}

contract IncomeManagerCtrt {
    using SafeMath for uint256;
    using AddressUtils for address;

    address public tokenCtrt;//the token address
    uint public TimeOfDeployment;// the minimum dataTime allowed
    address public addrHelium;

    uint public schCindex;//last submitted index and total count of current schedules, and also the index count. It starts from 1 to 80. SPLC life time has a total of 80 schedules
    mapping(uint256 => uint256) public dateToIdx;//date to schedule index
    mapping(uint256 => Schedule) public idxToSchedule;//schedule index to Schedule
    
    // cash flow: FMX -> platform -> investors
    // forecasted: rough estimate, given when csv is uploaded by FM
    // actual: actual here does not mean actual, but it means accurate estimated information
    struct Schedule {
        uint forecastedPayableTime;//used as mapping key
        uint forecastedPayableAmount;
        uint actualPaymentTime;
        uint actualPaymentAmount;
        uint8 errorCode;//0 to 255
        bool isErrorResolved;//default = true
        //bool isPaid;
    }
    uint public paymentCount;

    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902191745
    constructor(address _tokenCtrt, address _addrHelium, uint _TimeOfDeployment) public {
        tokenCtrt = _tokenCtrt;
        addrHelium = _addrHelium;
        TimeOfDeployment = _TimeOfDeployment;
    }
    function checkDeploymentConditions(
        address _tokenCtrt, address _addrHelium, uint _TimeOfDeployment
      ) public view returns(bool[] memory boolArray) {
        boolArray = new bool[](3);
        boolArray[0] = _tokenCtrt.isContract();
        boolArray[1] = _addrHelium.isContract();
        boolArray[2] = _TimeOfDeployment > 201905281400;
    }

    function checkPlatformSupervisor() external view returns (bool){
        return (HeliumITF_IM(addrHelium).checkPlatformSupervisor(msg.sender));
    }
    function setAddrHelium(address _addrHelium) external onlyPlatformSupervisor {
        addrHelium = _addrHelium;
    }
    modifier onlyPlatformSupervisor(){
        require(HeliumITF_IM(addrHelium).checkPlatformSupervisor(msg.sender), "only customerService is allowed to call this function");
        _;
    }

    function getSchIndex(uint schDateTime) public view returns (uint rsIndex) {
        require(schDateTime != 0, "schDateTime cannot be 0");
        rsIndex = dateToIdx[schDateTime];
    }
    function setNextSchedulePaid() external onlyPlatformSupervisor {
        paymentCount = paymentCount.add(1);
        idxToSchedule[paymentCount].isPaid = true;
    }


    event AddForecastedSchedule(uint indexed schIndex, uint indexed forecastedPayableTime, uint forecastedPayableAmount);
    function addForecastedSchedule(uint forecastedPayableTime, uint forecastedPayableAmount) external onlyPlatformSupervisor {
        require(forecastedPayableTime > TimeOfDeployment, "forecastedPayableTime has to be in the format of yyyymmddhhmm");
        schCindex = schCindex.add(1);
        require(idxToSchedule[schCindex.sub(1)].forecastedPayableTime < forecastedPayableTime, "previous forecastedPayableTime should be < forecastedPayableTime[idx]");

        idxToSchedule[schCindex].forecastedPayableTime = forecastedPayableTime;
        idxToSchedule[schCindex].forecastedPayableAmount = forecastedPayableAmount;
        dateToIdx[forecastedPayableTime] = schCindex;
        emit AddForecastedSchedule(schCindex, forecastedPayableTime, forecastedPayableAmount);
    }

    function checkAddForecastedScheduleBatch1(uint[] calldata forecastedPayableTimes, uint[] calldata forecastedPayableAmounts) external view returns(bool isSameLength, bool isLengthGreaterThanZero, bool isPlatformSupervisor) {
        uint length = forecastedPayableTimes.length;
        isSameLength = length == forecastedPayableAmounts.length;
        isLengthGreaterThanZero = length > 0;
        isPlatformSupervisor = HeliumITF_IM(addrHelium).checkPlatformSupervisor(msg.sender);
    }

    function checkAddForecastedScheduleBatch2(uint[] calldata forecastedPayableTimes) external view returns(bool[] memory boolArray2) {
        uint length = forecastedPayableTimes.length;
        boolArray2 = new bool[](length);

        for(uint idx = 0; idx < length; idx = idx.add(1)){
            if (idx == 0) {
                boolArray2[idx] = forecastedPayableTimes[0] > TimeOfDeployment;

            } else if (idx > 0) {
                boolArray2[idx] = forecastedPayableTimes[idx] > forecastedPayableTimes[idx.sub(1)];
            }
        }
    }
    function checkAddForecastedScheduleBatch(uint[] calldata forecastedPayableTimes, uint[] calldata forecastedPayableAmounts) external view returns(bool[] memory boolArray, bool[] memory boolArray2) {
        uint length = forecastedPayableTimes.length;
        boolArray = new bool[](3);
        boolArray2 = new bool[](length);

        boolArray[0] = length == forecastedPayableAmounts.length;
        boolArray[1] = length > 0;
        boolArray[2] = HeliumITF_IM(addrHelium).checkPlatformSupervisor(msg.sender);

        for(uint idx = 0; idx < length; idx = idx.add(1)){
            if (idx == 0) {
                boolArray2[idx] = forecastedPayableTimes[0] > TimeOfDeployment;

            } else if (idx > 0) {
                boolArray2[idx] = forecastedPayableTimes[idx] > forecastedPayableTimes[idx.sub(1)];
            }
        }
    }

    function addForecastedScheduleBatch(uint[] calldata forecastedPayableTimes, uint[] calldata forecastedPayableAmounts) external onlyPlatformSupervisor {
        uint length = forecastedPayableTimes.length;
        require(length == forecastedPayableAmounts.length, "forecastedPayableTimes must be of the same size of forecastedPayableAmounts");
        require(length > 0, "input array length must > 0");

        for(uint idx = 0; idx < length; idx = idx.add(1)){
            schCindex = schCindex.add(1);
            if (idx == 0) {
              require(forecastedPayableTimes[0] > TimeOfDeployment, "forecastedPayableTime[0] has to be > TimeOfDeployment");

            } else if (idx > 0) {
              require(forecastedPayableTimes[idx] > forecastedPayableTimes[idx.sub(1)], "forecastedPayableTime[idx] should be > forecastedPayableTime[idx.sub(1)]");
            }
            idxToSchedule[schCindex].forecastedPayableTime = forecastedPayableTimes[idx];
            idxToSchedule[schCindex].forecastedPayableAmount = forecastedPayableAmounts[idx];
            dateToIdx[forecastedPayableTimes[idx]] = schCindex;
            emit AddForecastedSchedule(schCindex, forecastedPayableTimes[idx], forecastedPayableAmounts[idx]);
        }
    }

    function checkEditActualSchedule(uint _schIndex) external view returns(bool[] memory boolArray) {
        boolArray = new bool[](1);
        uint schIndex;
        if(_schIndex > TimeOfDeployment){
            schIndex = getSchIndex(_schIndex);
        } else {
            schIndex = _schIndex;
        }
        boolArray[0] = HeliumITF_IM(addrHelium).checkPlatformSupervisor(msg.sender);
    }

    event EditActualSchedule(uint indexed schIndex, uint indexed actualPaymentTime, uint actualPaymentAmount);
    function editActualSchedule(uint _schIndex, uint actualPaymentTime, uint actualPaymentAmount) external onlyPlatformSupervisor {
        uint schIndex;
        if(_schIndex > TimeOfDeployment){
            schIndex = getSchIndex(_schIndex);
        } else {
            schIndex = _schIndex;
        }

        idxToSchedule[schIndex].actualPaymentTime = actualPaymentTime;
        idxToSchedule[schIndex].actualPaymentAmount = actualPaymentAmount;
        emit EditActualSchedule(schCindex, actualPaymentTime, actualPaymentAmount);
    }


    function getIncomeSchedule(uint _schIndex) external view returns (uint forecastedPayableTime, uint forecastedPayableAmount, uint actualPaymentTime, uint actualPaymentAmount, uint8 errorCode, bool isErrorResolved) {
        uint schIndex;
        if(_schIndex > TimeOfDeployment){
            schIndex = getSchIndex(_schIndex);
        } else {
            schIndex = _schIndex;
        }

        Schedule memory icSch = idxToSchedule[schIndex];

        forecastedPayableTime = icSch.forecastedPayableTime;
        forecastedPayableAmount = icSch.forecastedPayableAmount;
        actualPaymentTime = icSch.actualPaymentTime;
        actualPaymentAmount = icSch.actualPaymentAmount;
        errorCode = icSch.errorCode;
        isErrorResolved = icSch.isErrorResolved;
        //isPaid = icSch.isPaid;
    }

    function getIncomeScheduleList(uint _schIndex, uint amount) external view returns (uint[] memory forecastedPayableTimes, uint[] memory forecastedPayableAmounts, uint[] memory actualPaymentTimes, uint[] memory actualPaymentAmounts, uint8[] memory errorCodes, bool[] memory isErrorResolvedList) {

        uint schIndex;
        if(_schIndex > TimeOfDeployment){
            schIndex = getSchIndex(_schIndex);
        } else {
            schIndex = _schIndex;
        }

        uint amount_; uint indexStart_;
        if(schIndex == 0) {//all get all schedules
            indexStart_ = 1;
            amount_ = schCindex;

        } else if (amount < 1 || amount > schCindex.sub(schIndex).add(1)) {
            //all get all remaining schedules
            indexStart_ = schIndex;
            amount_ = schCindex.sub(indexStart_).add(1);

        } else {
            indexStart_ = schIndex;
            amount_ = amount;
        }

        forecastedPayableTimes = new uint[](amount_);
        forecastedPayableAmounts = new uint[](amount_);
        actualPaymentTimes = new uint[](amount_);
        actualPaymentAmounts = new uint[](amount_);

        errorCodes = new uint8[](amount_);
        isErrorResolvedList = new bool[](amount_);

        for(uint i = 0; i < amount_; i = i.add(1)){
            Schedule memory icSch = idxToSchedule[i.add(indexStart_)];
            forecastedPayableTimes[i] = icSch.forecastedPayableTime;
            forecastedPayableAmounts[i] = icSch.forecastedPayableAmount;
            actualPaymentTimes[i] = icSch.actualPaymentTime;
            actualPaymentAmounts[i] = icSch.actualPaymentAmount;

            errorCodes[i] = icSch.errorCode;
            isErrorResolvedList[i] = icSch.isErrorResolved;
        }
    }
    /**
        uint forecastedPayableTime;//used as mapping key
        uint forecastedPayableAmount;
        uint actualPaymentTime;
        uint actualPaymentAmount;
        uint8 errorCode;//0 to 255
        bool isErrorResolved;//default = true
        //bool isPaid;
    */

    function setErrResolution(uint _schIndex, bool isErrorResolved, uint8 errorCode) external onlyPlatformSupervisor {
        uint schIndex;
        if(_schIndex > TimeOfDeployment){
            schIndex = getSchIndex(_schIndex);
        } else {
            schIndex = _schIndex;
        }
        idxToSchedule[schIndex].isErrorResolved = isErrorResolved;
        idxToSchedule[schIndex].errorCode = errorCode;
    }
    //function() external payable { revert("should not send any ether directly"); }

}
    // function removeIncomeSchedule(uint _schIndex) external onlyPlatformSupervisor {
    //     uint schIndex;
    //     if(_schIndex > TimeOfDeployment){
    //         schIndex = getSchIndex(_schIndex);
    //     } else {
    //         schIndex = _schIndex;
    //     }
    //     require(idxToSchedule[schIndex].actualPaymentTime == 0 || idxToSchedule[schIndex].actualPaymentAmount == 0, "Cannot remove already paid schedule!");
    //     delete idxToSchedule[schIndex].forecastedPayableTime;
    //     delete idxToSchedule[schIndex].forecastedPayableAmount;
    //     emit RemoveIncomeSchedule(schIndex);
    // }
    // event RemoveIncomeSchedule(uint indexed schIndex);

    // function getIncomeScheduleListSpecific(uint[] calldata indices) external view returns (uint[] actualPaymentTimes, uint[] actualPaymentAmounts, bool[] isIncomePaida, uint8[] errorCodes, bool[] isErrorResolvedList) {

    //     Schedule[] memory schedule;
    //     for(uint i = 0; i < indices.length; i = i.add(1)) {
    //         uint rsIndex = getSchIndex(schIndex, forecastedPayableTime);
    //         Schedule memory icSch = idxToSchedule[rsIndex];
    //         schedule[i] = idxToSchedule[dateToIdx[indices[i]]];

    //     }
    //     return schedule;
    // }
    
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) } // solium-disable-line security/no-inline-assembly
        return size > 0;
    }
}
