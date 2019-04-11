pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
//deploy parameters: "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902191745
import "./Ownable.sol";
import "./SafeMath.sol";

//re-entry attack: prevented by noReentrancy
contract IncomeManagement is Ownable {
    using SafeMath for uint256;
    uint public TimeAnchor;//basis of time reference, format: 201903010900
    address public tokenCtrt;
    uint public scheduleIndex;//index of the next scheduled date for income payment

    address public PA_Ctrt;//Platform Auditor
    address public FMXA_Ctrt;//Fund Manager Auditor
    address public platformCtrt;
    //uint public dateNow;//201903010900
    uint public startingDate = 201901220900;

    mapping(uint256 => uint256) public dateToScheduleIndex;//date to scheduleIndex
    mapping(uint256 => IncomeSchedule) public schedules;//scheduleIndex to incomeSchedule

    // cash flow: FMX -> platform -> investors
    struct IncomeSchedule {
        uint paymentDate;//the date to send income, used as mapping key
        uint paymentAmount;//given by FMXA, sending income from platform to investors
        bool isApproved;//by PA
        bool isIncomePaid;//confirmed after platform's bank confirming income has been sent
        uint8 errorCode;//0 to 255
        bool isErrorResolved;//default = true
    }

    // 201902191700, "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902191745
    constructor(uint _TimeAnchor, address _tokenCtrt, 
        address _PA_Ctrt, address _FMXA_Ctrt, address _platformCtrt,
        address[] memory management) public {
        require(_TimeAnchor > 99999999999, "_TimeAnchor has to be in the format of yyyymmddhhmm");
        TimeAnchor = _TimeAnchor;//201903010900
        tokenCtrt = _tokenCtrt;
        PA_Ctrt = _PA_Ctrt;
        FMXA_Ctrt = _FMXA_Ctrt;
        platformCtrt = _platformCtrt;

        require(management.length > 4, "management.length should be > 4");
        owner = management[4];
        chairman = management[3];
        director = management[2];
        manager = management[1];
        admin = management[0];
    }
    modifier onlyPA() {
        require(msg.sender == PA_Ctrt, "only PA_Ctrt can call this function");
        _;
    }
    modifier onlyFMXA() {
        require(msg.sender == FMXA_Ctrt, "only FMXA_Ctrt can call this function");
        _;
    }
    /*
    -->每季底FMX結帳後FMXA通知平台該期應該發放的租金是多少-->PlatformBD-->PlatformA審核, 確認.
    -->平台發出訊息給user, 即將於x月底發放租金至指定帳戶, 請user確認.
    -->發放租金資訊鏈接bank-->回報訊息.
    -->異常處理.
    -->二級市場交易時, 租金分配規則制定.
    -->外部還要寫一隻BE程式專門與銀行對接收/ 付款資訊.

    發行日(RD)之後, 每一季發放租金, 外部預先把期數定義好(SPLC life time總共80期), 去ERC721合約中撈持幣user資料(及持有時間長短), time server檢查要發放租金前通知FM, 平台, 
    -->match product time line以及後台功能.
    */

    //check income ready to release
    function isIncomeReadyForRelease(uint _dateToday) external view returns (bool) {
        require(platformCtrt == msg.sender, "sender is not the time server");

        return (schedules[dateToScheduleIndex[_dateToday]].isApproved && !schedules[dateToScheduleIndex[_dateToday]].isIncomePaid);
    }

    event NewIncomeSchedule(uint indexed _index, uint indexed _paymentDate, uint _paymentAmount);
    function makeIncomeSchedule(uint _paymentDate, uint _paymentAmount) external noReentrancy onlyFMXA {
        require(_paymentDate > 99999999999, "_paymentDate has to be in the format of yyyymmddhhmm");
        scheduleIndex = scheduleIndex.add(1);
        IncomeSchedule memory newIncomeSchedule = IncomeSchedule({
            paymentDate: _paymentDate,
            paymentAmount: _paymentAmount,
            isApproved: false,
            isIncomePaid: false,
            errorCode: 0,
            isErrorResolved: false
        });//20190301
        dateToScheduleIndex[_paymentDate] = scheduleIndex;
        schedules[scheduleIndex] = newIncomeSchedule;
        emit NewIncomeSchedule(scheduleIndex, _paymentDate, _paymentAmount);
    }

    event EditIncomeSchedule(uint indexed _index, uint indexed _paymentDate, uint _paymentAmount);
    function editIncomeSchedule(uint _index, uint _paymentDate, uint _paymentAmount) external noReentrancy onlyFMXA {
        uint rsIndex;
        if (_index == 0) {
            rsIndex = dateToScheduleIndex[_paymentDate];
        } else {rsIndex = _index;}
        schedules[rsIndex].paymentDate = _paymentDate;
        schedules[rsIndex].paymentAmount = _paymentAmount;
        emit EditIncomeSchedule(scheduleIndex, _paymentDate, _paymentAmount);
    }
    /**
        uint paymentDate;//the date to send income
        uint paymentAmount;//given by FMXA, sending income from platform to investors
        bool isApproved;//by PA
        bool isIncomePaid;//confirmed after platform's bank confirming income has been sent
        uint8 errorCode;//0 to 255
        bool isErrorResolved;
     */
    function getIncomePaymentSchedule(uint _paymentDate) external view returns (uint,uint,bool,bool,uint8,bool) {
        uint idx = dateToScheduleIndex[_paymentDate];
        IncomeSchedule memory rs = schedules[idx];
        return (rs.paymentDate, rs.paymentAmount, rs.isApproved, rs.isIncomePaid, rs.errorCode, rs.isErrorResolved);
    }
    event RemoveIncomeSchedule(uint indexed _index);
    function removeIncomeSchedule(uint _index, uint _paymentDate) external noReentrancy onlyFMXA {
        uint rsIndex;
        if (_index == 0) {
            rsIndex = dateToScheduleIndex[_paymentDate];
        } else {rsIndex = _index;}

        if(!schedules[rsIndex].isApproved && !schedules[rsIndex].isIncomePaid) {
            schedules[rsIndex].paymentDate = 0;
            schedules[rsIndex].paymentAmount = 0;
        }
        emit RemoveIncomeSchedule(rsIndex);
    }

    // function getIncomePaymentScheduleList(uint[] calldata _paymentDates) external view returns (IncomeSchedule[] memory) {
    //     // require(incomeStartDate + incomeCount - 1 < scheduleIndex, "incomeStartDate is too big for incomeCount");
    //     IncomeSchedule[] memory incomeSchedule;
    //     for(uint i = 0; i < _paymentDates.length; i = i.add(1)) {
    //         incomeSchedule[i] = schedules[dateToScheduleIndex[_paymentDates[i]]];
    //     }
    //     return incomeSchedule;
    // }

    /**設定isApproved */
    function setIsApproved(uint _paymentDate, bool boolValue) external onlyPA noReentrancy{
        schedules[dateToScheduleIndex[_paymentDate]].isApproved = boolValue;
    }

    event ChangeFMXA(address indexed _FMXA_old, address indexed _FMXA_new);
    function changeFMXA(address FMXA_Ctrt_new) external onlyPA noReentrancy{
        emit ChangeFMXA(FMXA_Ctrt, FMXA_Ctrt_new);
        FMXA_Ctrt = FMXA_Ctrt_new;
    }
    /**設定 isIncomePaid，如果有錯誤發生，設定errorCode */
    event SetPaymentReleaseResults(uint indexed _paymentDate, bool boolValue, uint8 _errorCode);
    function setPaymentReleaseResults(uint _paymentDate, bool boolValue, uint8 _errorCode) external onlyPA noReentrancy{
        schedules[dateToScheduleIndex[_paymentDate]].isIncomePaid = boolValue;
        if (_errorCode != 0) {
            schedules[dateToScheduleIndex[_paymentDate]].errorCode = _errorCode;
        }
        emit SetPaymentReleaseResults(_paymentDate, boolValue, _errorCode);
    }

    /**設定isErrorResolved */
    function setErrResolution(uint _paymentDate, bool boolValue) external onlyPA noReentrancy{
        schedules[dateToScheduleIndex[_paymentDate]].isErrorResolved = boolValue;
    }
}
