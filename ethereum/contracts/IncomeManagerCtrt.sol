pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
import "./Ownable.sol";
import "./SafeMath.sol";

contract IncomeManagerCtrt is Ownable {
    using SafeMath for uint256;
    address public tokenCtrt;
    address public supervisor;
    uint public dateTimeMin = 201901220900;

    uint public schCindex;//index of current schedule, 1 to 80. SPLC life time總共80期
    mapping(uint256 => Schedule) public idxToSchedule;//schedule index to Schedule
    mapping(uint256 => uint256) public dateToIdx;//date to schedule index
    
    // cash flow: FMX -> platform -> investors
    struct Schedule {
        uint payableDate;//the date to send income, used as mapping key
        uint payableAmount;//given by FMXA, sending income from platform to investors
        uint paymentDate;//the date when the platform actually sent payment
        uint paymentAmount;//the amount the platform paid the asset owner
        bool isApproved;//by ProductSupervisor
        uint8 errorCode;//0 to 255
        bool isErrorResolved;//default = true
    }

    // 201902191700, "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902191745
    constructor(address _tokenCtrt, address _supervisor,
        address[] memory managementTeam) public {
        tokenCtrt = _tokenCtrt;
        supervisor = _supervisor;//can be EOA or contract

        require(managementTeam.length > 4, "managementTeam.length should be > 4");
        owner = managementTeam[4];
        chairman = managementTeam[3];
        director = managementTeam[2];
        manager = managementTeam[1];
        admin = managementTeam[0];
    }
    modifier restricted(){
        require(msg.sender == supervisor, "only supervisor is allowed");
        _;
    }

    //check income ready to release
    function isScheduleGoodForRelease(uint _dateTimeNow) external view returns (bool) {
        Schedule memory icSch = idxToSchedule[dateToIdx[_dateTimeNow]];
        return (icSch.isApproved && icSch.payableDate > dateTimeMin && icSch.payableAmount > 0 && icSch.paymentDate == 0 && icSch.paymentAmount == 0);
    }

    event AddSchedule(uint indexed _index, uint indexed _payableDate, uint _payableAmount);
    function addSchedule(uint _payableDate, uint _payableAmount) external restricted {
        require(_payableDate > dateTimeMin, "_payableDate has to be in the format of yyyymmddhhmm");
        if (schCindex > 0) {
          require(idxToSchedule[schCindex].payableDate < _payableDate, "previous payableDate should be < _payableDate");
        }

        schCindex = schCindex.add(1);
        idxToSchedule[schCindex].payableDate = _payableDate;
        idxToSchedule[schCindex].payableAmount = _payableAmount;
        dateToIdx[_payableDate] = schCindex;
        emit AddSchedule(schCindex, _payableDate, _payableAmount);
    }

    function AddScheduleBatch(uint[] calldata _payableDates, uint[] calldata _payableAmounts) external restricted {
        uint amount_ = _payableDates.length;
        require(amount_ == _payableAmounts.length, "payableDates must be of the same size of payableAmounts");
        require(amount_ > 0, "input array length must > 0");

        require(_payableDates[0] > dateTimeMin, "_payableDate[0] has to be in yyyymmddhhmm");
        for(uint i = 0; i < amount_; i = i.add(1)){
            
            if (schCindex > 0) {
              require(idxToSchedule[schCindex].payableDate < _payableDates[i], "previous payableDate should be < _payableDate[i]");
            }

            schCindex = schCindex.add(1);
            idxToSchedule[schCindex].payableDate = _payableDates[i];
            idxToSchedule[schCindex].payableAmount = _payableAmounts[i];
            dateToIdx[_payableDates[i]] = schCindex;
            emit AddSchedule(schCindex, _payableDates[i], _payableAmounts[i]);
        }
    }

    event EditIncomeSchedule(uint indexed _index, uint indexed _payableDate, uint _payableAmount);
    function editIncomeSchedule(uint _index, uint _payableDate, uint _payableAmount) external restricted {
        uint payableDateOld = idxToSchedule[_index].payableDate;
        delete dateToIdx[payableDateOld];
        
        require(idxToSchedule[_index].paymentDate == 0 && idxToSchedule[_index].paymentAmount == 0, "cannot edit already paid schedule");

        idxToSchedule[_index].payableDate = _payableDate;
        idxToSchedule[_index].payableAmount = _payableAmount;
        idxToSchedule[_index].isApproved = false;

        emit EditIncomeSchedule(schCindex, _payableDate, _payableAmount);
    }


    function getIncomeSchedule(uint _index, uint _payableDate) external view returns (uint payableDate, uint payableAmount, uint paymentDate, uint paymentAmount, bool isApproved, uint8 errorCode, bool isErrorResolved) {
        uint rsIndex = getSchIndex(_index, _payableDate);
        Schedule memory icSch = idxToSchedule[rsIndex];

        payableDate = icSch.payableDate;
        payableAmount = icSch.payableAmount;
        paymentDate = icSch.paymentDate;
        paymentAmount = icSch.paymentAmount;
        isApproved = icSch.isApproved;
        errorCode = icSch.errorCode;
        isErrorResolved = icSch.isErrorResolved;
    }

    function getIncomeScheduleList(uint indexStart, uint amount) external view returns (uint[] memory payableDates, uint[] memory payableAmounts, uint[] memory paymentDates, uint[] memory paymentAmounts, bool[] memory isApproveda, uint8[] memory errorCodes, bool[] memory isErrorResolveda) {

        uint amount_; uint indexStart_;
        if(indexStart == 0) {//all get all schedules
            indexStart_ = 1;
            amount_ = schCindex;

        } else if (amount < 1 || amount > schCindex.sub(indexStart).add(1)) {
            //all get all remaining schedules
            indexStart_ = indexStart;
            amount_ = schCindex.sub(indexStart_).add(1);

        } else {
            indexStart_ = indexStart;
            amount_ = amount;
        }

        payableDates = new uint[](amount_);
        payableAmounts = new uint[](amount_);
        paymentDates = new uint[](amount_);
        paymentAmounts = new uint[](amount_);

        isApproveda = new bool[](amount_);
        errorCodes = new uint8[](amount_);
        isErrorResolveda = new bool[](amount_);

        for(uint i = 0; i < amount_; i = i.add(1)){
            Schedule memory icSch = idxToSchedule[i.add(indexStart_)];
            payableDates[i] = icSch.payableDate;
            payableAmounts[i] = icSch.payableAmount;
            paymentDates[i] = icSch.paymentDate;
            paymentAmounts[i] = icSch.paymentAmount;

            isApproveda[i] = icSch.isApproved;
            errorCodes[i] = icSch.errorCode;
            isErrorResolveda[i] = icSch.isErrorResolved;
        }

    }

    function getSchIndex(uint _index, uint _payableDate) public view returns (uint rsIndex) {
        if (_index == 0) {
            require(_payableDate != 0, "Both _index or _payableDate are 0. Error");
            rsIndex = dateToIdx[_payableDate];
        } else {
            rsIndex = _index;
        }
    }

    event RemoveIncomeSchedule(uint indexed _index);
    function removeIncomeSchedule(uint _index, uint _payableDate) external restricted {
        uint rsIndex = getSchIndex(_index, _payableDate);

        require(idxToSchedule[rsIndex].paymentDate == 0 || idxToSchedule[rsIndex].paymentAmount == 0, "Cannot remove already paid schedule!");
        delete idxToSchedule[rsIndex].payableDate;
        delete idxToSchedule[rsIndex].payableAmount;
        delete idxToSchedule[rsIndex].isApproved;
        emit RemoveIncomeSchedule(rsIndex);
    }


    /*設定isApproved */
    function setIsApproved(uint _index, uint _payableDate, bool boolValue) external restricted {
        uint rsIndex = getSchIndex(_index, _payableDate);
        idxToSchedule[rsIndex].isApproved = boolValue;
    }


    /**設定 isIncomePaid，如果有錯誤發生，設定errorCode */
    event SetPaymentReleaseResults(uint indexed _paymentDate, uint _paymentAmount, uint8 _errorCode);
    function setPaymentReleaseResults(uint _index, uint _paymentDate, uint _paymentAmount, uint8 _errorCode) external restricted {

        uint rsIndex = getSchIndex(_index, _paymentDate);
        require(idxToSchedule[rsIndex].isApproved, "such schedule must have been approved first");
        idxToSchedule[rsIndex].paymentDate = _paymentDate;
        idxToSchedule[rsIndex].paymentAmount = _paymentAmount;

        if (_errorCode != 0) {
            idxToSchedule[rsIndex].errorCode = _errorCode;
        }
        emit SetPaymentReleaseResults(_paymentDate, _paymentAmount, _errorCode);
    }

    /**設定isErrorResolved */
    function setErrResolution(uint _index, uint _paymentDate, bool boolValue) external restricted {

        uint rsIndex = getSchIndex(_index, _paymentDate);
        idxToSchedule[rsIndex].isErrorResolved = boolValue;
    }



    // function getIncomeScheduleListSpecific(uint[] calldata indices) external view returns (uint[] paymentDates, uint[] paymentAmounts, bool[] isApproveda, bool[] isIncomePaida, uint8[] errorCodes, bool[] isErrorResolveda) {

    //     Schedule[] memory schedule;
    //     for(uint i = 0; i < indices.length; i = i.add(1)) {
    //         uint rsIndex = getSchIndex(_index, _payableDate);
    //         Schedule memory icSch = idxToSchedule[rsIndex];
    //         schedule[i] = idxToSchedule[dateToIdx[indices[i]]];

    //     }
    //     return schedule;
    // }
}
