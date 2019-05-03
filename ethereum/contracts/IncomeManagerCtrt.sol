pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
import "./SafeMath.sol";

interface HeliumITF{
    function checkCustomerService(address _eoa) external view returns(bool _isCustomerService);
    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor);
    function checkAdmin(address _eoa) external view returns(bool _isAdmin);
}

contract IncomeManagerCtrt {
    using SafeMath for uint256;
    address public tokenCtrt;//the token address
    address public supervisor;//the supervisor
    uint public dateTimeMin = 201901220900;// the minimum dataTime allowed
    address public HeliumAddr;

    uint public schCindex;//last submitted index and total count of current schedules, and also the index count. It starts from 1 to 80. SPLC life time has a total of 80 schedules
    mapping(uint256 => uint256) public dateToIdx;//date to schedule index
    mapping(uint256 => Schedule) public idxToSchedule;//schedule index to Schedule
    
    // cash flow: FMX -> platform -> investors
    // records of parameters stored in each schedule
    struct Schedule {
        uint forecastedPayableTime;//the date to send income, used as mapping key
        uint forecastedPayableAmount;//given by FMXA, sending income from platform to investors
        uint actualPaymentTime;//the date when the platform actually sent payment
        uint actualPaymentAmount;//the amount the platform paid the asset owner
        bool isApproved;//by ProductSupervisor
        uint8 errorCode;//0 to 255
        bool isErrorResolved;//default = true
    }

    // 201902191700, "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902191745
    constructor(address _tokenCtrt, address _supervisor, address _HeliumAddr) public {
        tokenCtrt = _tokenCtrt;
        supervisor = _supervisor;//can be EOA or Helium contract
        HeliumAddr = _HeliumAddr;
    }
    function setHeliumAddr(address _HeliumAddr) external onlySupervisor{
        HeliumAddr = _HeliumAddr;
    }
    modifier onlySupervisor(){
        require(HeliumITF(HeliumAddr).checkPlatformSupervisor(msg.sender), "only customerService is allowed to call this function");
        _;
    }
    // function changeSupervisor(address newSupervisor) external {
    //     require(msg.sender == admin, "only admin is allowed");
    //     supervisor = newSupervisor;
    // }

    //check if the inputTime has income schedule that is ready to be released
    function isScheduleGoodForRelease(uint inputTime) external view returns (bool) {
        Schedule memory icSch = idxToSchedule[dateToIdx[inputTime]];
        return (icSch.isApproved && icSch.forecastedPayableTime > dateTimeMin && icSch.forecastedPayableAmount > 0 && icSch.actualPaymentTime == 0 && icSch.actualPaymentAmount == 0);
    }

    event AddSchedule(uint indexed schIndex, uint indexed forecastedPayableTime, uint forecastedPayableAmount);
    function addSchedule(uint forecastedPayableTime, uint forecastedPayableAmount) external onlySupervisor {
        require(forecastedPayableTime > dateTimeMin, "forecastedPayableTime has to be in the format of yyyymmddhhmm");
        if (schCindex > 0) {
          require(idxToSchedule[schCindex].forecastedPayableTime < forecastedPayableTime, "previous forecastedPayableTime should be < forecastedPayableTime");
        }

        schCindex = schCindex.add(1);
        idxToSchedule[schCindex].forecastedPayableTime = forecastedPayableTime;
        idxToSchedule[schCindex].forecastedPayableAmount = forecastedPayableAmount;
        dateToIdx[forecastedPayableTime] = schCindex;
        emit AddSchedule(schCindex, forecastedPayableTime, forecastedPayableAmount);
    }

    function AddScheduleBatch(uint[] calldata forecastedPayableTimes, uint[] calldata forecastedPayableAmounts) external onlySupervisor {
        uint amount_ = forecastedPayableTimes.length;
        require(amount_ == forecastedPayableAmounts.length, "forecastedPayableTimes must be of the same size of forecastedPayableAmounts");
        require(amount_ > 0, "input array length must > 0");

        require(forecastedPayableTimes[0] > dateTimeMin, "forecastedPayableTime[0] has to be in yyyymmddhhmm");
        for(uint i = 0; i < amount_; i = i.add(1)){
            
            if (schCindex > 0) {
              require(idxToSchedule[schCindex].forecastedPayableTime < forecastedPayableTimes[i], "previous forecastedPayableTime should be < forecastedPayableTime[i]");
            }

            schCindex = schCindex.add(1);
            idxToSchedule[schCindex].forecastedPayableTime = forecastedPayableTimes[i];
            idxToSchedule[schCindex].forecastedPayableAmount = forecastedPayableAmounts[i];
            dateToIdx[forecastedPayableTimes[i]] = schCindex;
            emit AddSchedule(schCindex, forecastedPayableTimes[i], forecastedPayableAmounts[i]);
        }
    }

    event EditIncomeSchedule(uint indexed schIndex, uint indexed forecastedPayableTime, uint forecastedPayableAmount);
    function editIncomeSchedule(uint _schIndex, uint forecastedPayableTime, uint forecastedPayableAmount) external onlySupervisor {
        uint schIndex;
        if(_schIndex > dateTimeMin){
            schIndex = getSchIndex(_schIndex);
        } else {
            schIndex = _schIndex;
        }

        uint forecastedPayableTimeOld = idxToSchedule[schIndex].forecastedPayableTime;
        delete dateToIdx[forecastedPayableTimeOld];
        
        require(idxToSchedule[schIndex].actualPaymentTime == 0 && idxToSchedule[schIndex].actualPaymentAmount == 0, "cannot edit already paid schedule");

        idxToSchedule[schIndex].forecastedPayableTime = forecastedPayableTime;
        idxToSchedule[schIndex].forecastedPayableAmount = forecastedPayableAmount;
        idxToSchedule[schIndex].isApproved = false;

        emit EditIncomeSchedule(schCindex, forecastedPayableTime, forecastedPayableAmount);
    }


    function getIncomeSchedule(uint _schIndex) external view returns (uint forecastedPayableTime, uint forecastedPayableAmount, uint actualPaymentTime, uint actualPaymentAmount, bool isApproved, uint8 errorCode, bool isErrorResolved) {
        uint schIndex;
        if(_schIndex > dateTimeMin){
            schIndex = getSchIndex(_schIndex);
        } else {
            schIndex = _schIndex;
        }

        Schedule memory icSch = idxToSchedule[schIndex];

        forecastedPayableTime = icSch.forecastedPayableTime;
        forecastedPayableAmount = icSch.forecastedPayableAmount;
        actualPaymentTime = icSch.actualPaymentTime;
        actualPaymentAmount = icSch.actualPaymentAmount;
        isApproved = icSch.isApproved;
        errorCode = icSch.errorCode;
        isErrorResolved = icSch.isErrorResolved;
    }

    function getIncomeScheduleList(uint _schIndex, uint amount) external view returns (uint[] memory forecastedPayableTimes, uint[] memory forecastedPayableAmounts, uint[] memory actualPaymentTimes, uint[] memory actualPaymentAmounts, bool[] memory isApproveda, uint8[] memory errorCodes, bool[] memory isErrorResolveda) {

        uint schIndex;
        if(_schIndex > dateTimeMin){
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

        isApproveda = new bool[](amount_);
        errorCodes = new uint8[](amount_);
        isErrorResolveda = new bool[](amount_);

        for(uint i = 0; i < amount_; i = i.add(1)){
            Schedule memory icSch = idxToSchedule[i.add(indexStart_)];
            forecastedPayableTimes[i] = icSch.forecastedPayableTime;
            forecastedPayableAmounts[i] = icSch.forecastedPayableAmount;
            actualPaymentTimes[i] = icSch.actualPaymentTime;
            actualPaymentAmounts[i] = icSch.actualPaymentAmount;

            isApproveda[i] = icSch.isApproved;
            errorCodes[i] = icSch.errorCode;
            isErrorResolveda[i] = icSch.isErrorResolved;
        }

    }

    function getSchIndex(uint schTime) public view returns (uint rsIndex) {
        require(schTime != 0, "schTime cannot be 0");
        rsIndex = dateToIdx[schTime];
    }

    function removeIncomeSchedule(uint _schIndex) external onlySupervisor {
        uint schIndex;
        if(_schIndex > dateTimeMin){
            schIndex = getSchIndex(_schIndex);
        } else {
            schIndex = _schIndex;
        }
        require(idxToSchedule[schIndex].actualPaymentTime == 0 || idxToSchedule[schIndex].actualPaymentAmount == 0, "Cannot remove already paid schedule!");
        delete idxToSchedule[schIndex].forecastedPayableTime;
        delete idxToSchedule[schIndex].forecastedPayableAmount;
        delete idxToSchedule[schIndex].isApproved;
        emit RemoveIncomeSchedule(schIndex);
    }
    event RemoveIncomeSchedule(uint indexed schIndex);


    /*設定isApproved */
    function imApprove(uint _schIndex, bool boolValue) external onlySupervisor {
        uint schIndex;
        if(_schIndex > dateTimeMin){
            schIndex = getSchIndex(_schIndex);
        } else {
            schIndex = _schIndex;
        }

        idxToSchedule[schIndex].isApproved = boolValue;
    }


    /**設定 isIncomePaid，如果有錯誤發生，設定errorCode */
    function setPaymentReleaseResults(uint _schIndex, uint actualPaymentTime, uint actualPaymentAmount, uint8 errorCode) external onlySupervisor {

        uint schIndex;
        if(_schIndex > dateTimeMin){
            schIndex = getSchIndex(_schIndex);
        } else {
            schIndex = _schIndex;
        }

        require(idxToSchedule[schIndex].isApproved, "such schedule must have been approved first");
        idxToSchedule[schIndex].actualPaymentTime = actualPaymentTime;
        idxToSchedule[schIndex].actualPaymentAmount = actualPaymentAmount;

        if (errorCode != 0) {
            idxToSchedule[schIndex].errorCode = errorCode;
        }
        emit SetPaymentReleaseResults(actualPaymentTime, actualPaymentAmount, errorCode);
    }
    event SetPaymentReleaseResults(uint indexed actualPaymentTime, uint actualPaymentAmount, uint8 errorCode);

    /**設定isErrorResolved */
    function setErrResolution(uint _schIndex, bool boolValue) external onlySupervisor {
        uint schIndex;
        if(_schIndex > dateTimeMin){
            schIndex = getSchIndex(_schIndex);
        } else {
            schIndex = _schIndex;
        }
        idxToSchedule[schIndex].isErrorResolved = boolValue;
    }

    //function() external payable { revert("should not send any ether directly"); }

}

    // function getIncomeScheduleListSpecific(uint[] calldata indices) external view returns (uint[] actualPaymentTimes, uint[] actualPaymentAmounts, bool[] isApproveda, bool[] isIncomePaida, uint8[] errorCodes, bool[] isErrorResolveda) {

    //     Schedule[] memory schedule;
    //     for(uint i = 0; i < indices.length; i = i.add(1)) {
    //         uint rsIndex = getSchIndex(schIndex, forecastedPayableTime);
    //         Schedule memory icSch = idxToSchedule[rsIndex];
    //         schedule[i] = idxToSchedule[dateToIdx[indices[i]]];

    //     }
    //     return schedule;
    // }