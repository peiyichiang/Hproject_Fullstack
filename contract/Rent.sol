pragma solidity ^0.5.3;
//pragma experimental ABIEncoderV2;
import "./Ownable.sol";

contract Htoken {
    function getTokenOwners(uint idStart, uint idCount) external returns(address[] memory) {}
}

//re-entry attack: prevented by noReentrancy
contract Rent is Ownable {
    using SafeMath for uint256;
    uint public releaseDate;//basis of time reference
    address public tokenCtrt;
    uint public scheduleIndex;//index of the next scheduled date for rent payment

    address public PA_Ctrt;//
    address public FMXA_Ctrt;//FMXA
    address public platformCtrt;
    //uint public dateNow;//201903010000
    uint public startingDate = 20190122;

    mapping(uint256 => uint256) public dateToScheduleIndex;//date to scheduleIndex
    mapping(uint256 => RentSchedule) public schedules;//scheduleIndex to rentSchedule
    
    // cash flow: FMX -> platform -> investors
    struct RentSchedule {
        uint paymentDate;//the date to send rent, used as mapping key
        uint paymentAmount;//given by FMXA, sending rent from platform to investors
        bool isApproved;//by PA
        bool isRentPaid;//confirmed after platform's bank confirming rent has been sent
        uint8 errorCode;//0 to 255
        bool isErrorResolved;//default = true
    }
    constructor(uint _releaseDate, address _tokenCtrt, address _PA_Ctrt, address _FMXA_Ctrt, address _platformCtrt) public {
        require(_releaseDate > 99999999999, "_releaseDate has to be in the format of yyyymmddhhmm");
        releaseDate = _releaseDate;//201903010000
        tokenCtrt = _tokenCtrt;
        PA_Ctrt = _PA_Ctrt;
        FMXA_Ctrt = _FMXA_Ctrt;
        platformCtrt = _platformCtrt;
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

    //check rent ready to release
    function isRentReadyForRelease(uint _dateToday) external view returns (bool) {
        require(platformCtrt == msg.sender, "sender is not the time server");

        return (schedules[dateToScheduleIndex[_dateToday]].isApproved && !schedules[dateToScheduleIndex[_dateToday]].isRentPaid);
    }

    event NewRentSchedule(uint indexed _index, uint indexed _paymentDate, uint _paymentAmount);
    function makeRentSchedule(uint _paymentDate, uint _paymentAmount) external noReentrancy onlyFMXA {
        require(_paymentDate > 99999999999, "_paymentDate has to be in the format of yyyymmddhhmm");
        scheduleIndex = scheduleIndex.add(1);
        RentSchedule memory newRentSchedule = RentSchedule({
            paymentDate: _paymentDate,
            paymentAmount: _paymentAmount,
            isApproved: false,
            isRentPaid: false,
            errorCode: 0,
            isErrorResolved: false
        });//20190301
        dateToScheduleIndex[_paymentDate] = scheduleIndex;
        schedules[scheduleIndex] = newRentSchedule;
        emit NewRentSchedule(scheduleIndex, _paymentDate, _paymentAmount);
    }

    event EditRentSchedule(uint indexed _index, uint indexed _paymentDate, uint _paymentAmount);
    function editRentSchedule(uint _index, uint _paymentDate, uint _paymentAmount) external noReentrancy onlyFMXA {
        uint rsIndex;
        if (_index == 0) {
            rsIndex = dateToScheduleIndex[_paymentDate];
        } else {rsIndex = _index;}
        schedules[rsIndex].paymentDate = _paymentDate;
        schedules[rsIndex].paymentAmount = _paymentAmount;
        emit EditRentSchedule(scheduleIndex, _paymentDate, _paymentAmount);
    }
    /**
        uint paymentDate;//the date to send rent
        uint paymentAmount;//given by FMXA, sending rent from platform to investors
        bool isApproved;//by PA
        bool isRentPaid;//confirmed after platform's bank confirming rent has been sent
        uint8 errorCode;//0 to 255
        bool isErrorResolved;
     */
    function getRentPaymentSchedule(uint _paymentDate) external view returns (uint,uint,bool,bool,uint8,bool) {
        uint idx = dateToScheduleIndex[_paymentDate];
        RentSchedule memory rs = schedules[idx];
        return (rs.paymentDate, rs.paymentAmount, rs.isApproved, rs.isRentPaid, rs.errorCode, rs.isErrorResolved);
    }
    event RemoveRentSchedule(uint indexed _index);
    function removeRentSchedule(uint _index, uint _paymentDate) external noReentrancy onlyFMXA {
        uint rsIndex;
        if (_index == 0) {
            rsIndex = dateToScheduleIndex[_paymentDate];
        } else {rsIndex = _index;}

        if(!schedules[rsIndex].isApproved && !schedules[rsIndex].isRentPaid) {
            schedules[rsIndex].paymentDate = 0;
            schedules[rsIndex].paymentAmount = 0;
        }
        emit RemoveRentSchedule(rsIndex);
    }
    // function getRentPaymentScheduleList(uint[] calldata _paymentDates) external view returns (RentSchedule[] memory) {
    //     // require(rentStartDate + rentCount - 1 < scheduleIndex, "rentStartDate is too big for rentCount");
    //     RentSchedule[] memory rentSchedule;
    //     for(uint i = 0; i < _paymentDates.length; i = i.add(1)) {
    //         rentSchedule.push(schedules[dateToScheduleIndex[_paymentDates[i]]]);
    //     }
    //     return rentSchedule;
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
    /**設定isRentPaid，如果有錯誤發生，設定errorCode */
    event SetPaymentReleaseResults(uint indexed _paymentDate, bool boolValue, uint8 _errorCode);
    function setPaymentReleaseResults(uint _paymentDate, bool boolValue, uint8 _errorCode) external onlyPA noReentrancy{
        schedules[dateToScheduleIndex[_paymentDate]].isRentPaid = boolValue;
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
library SafeMath {
    function mul(uint256 _a, uint256 _b) internal pure returns (uint256) {
        if (_a == 0) {
            return 0;
        }
        uint256 c = _a * _b;
        require(c / _a == _b, "safeMath mul failed");
        return c;
    }
    function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
        uint256 c = _a / _b;
        // require(b > 0); // Solidity automatically throws when dividing by 0
        // require(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }
    function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
        require(_b <= _a, "safeMath sub failed");
        return _a - _b;
    }
    function add(uint256 _a, uint256 _b) internal pure returns (uint256) {
        uint256 c = _a + _b;
        require(c >= _a, "safeMath add failed");
        return c;
    }
}