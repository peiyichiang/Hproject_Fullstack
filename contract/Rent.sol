pragma solidity ^0.5.3;
//pragma experimental ABIEncoderV2;
import "./Ownable.sol";

contract Htoken {
    function getTokenOwners(uint idStart, uint idCount) external returns(address[] memory) {}
}
contract Rent is Ownable {
    using SafeMath for uint256;
    //using AddressUtils for address??
    //re-entry attack: prevented by noReentrancy
    uint public releaseDate;//basis of time reference
    address public tokenCtrt;
    uint public nextScheduleIndex = 1;//index of the next scheduled date for rent payment

    address public platformAuditor;
    address public platformBackend;
    address public timeServer;
    uint public dateNow;//20190301
    uint public startingDate = 20190122;
    uint public nextScheduleIndexToRun;

    mapping(uint256 => uint256) public dateToScheduleIndex;
    mapping(uint256 => RentSchedule) public idxToRentSchedule;
    mapping(address => address) public tokenToFMXA;
    
    // cash flow: FMX -> platform -> investors
    struct RentSchedule {
        uint paymentDate;//the date to send rent, used as mapping key
        uint paymentAmount;//given by FMXA, sending rent from platform to investors
        bool isApproved;//by PA
        bool isRentPaid;//confirmed after platform's bank confirming rent has been sent
        uint8 errorCode;//0 to 255
        bool isErrorResolved;
    }
    constructor(uint _releaseDate, address _tokenCtrt, address _platformAuditor, address _platformBackend, address _timeServer) public {
        releaseDate = _releaseDate;//20190301
        tokenCtrt = _tokenCtrt;
        platformAuditor = _platformAuditor;
        platformBackend = _platformBackend;
        timeServer = _timeServer;
    }
    modifier onlyPlatformAuditor() {
        require(msg.sender == platformAuditor, "only platformAuditor can call this function");
        _;
    }
    modifier onlyPlatformBackend() {
        require(msg.sender == platformBackend, "only platformBackend can call this function");
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
    function checkRentRelease(uint _dateToday) external view returns (bool) {
        require(timeServer == msg.sender, "sender is not the time server");

        return (idxToRentSchedule[dateToScheduleIndex[_dateToday]].isApproved && !idxToRentSchedule[dateToScheduleIndex[_dateToday]].isRentPaid);
    }

    function makeRentSchedule(uint _paymentDate, uint _paymentAmount) external noReentrancy{
        require(tokenToFMXA[tokenCtrt] == msg.sender, "sender is not the admin for this token");
        RentSchedule memory newRentSchedule = RentSchedule({
            paymentDate: _paymentDate,
            paymentAmount: _paymentAmount,
            isApproved: false,
            isRentPaid: false,
            errorCode: 0,
            isErrorResolved: false
        });//20190301
        dateToScheduleIndex[_paymentDate] = nextScheduleIndex;
        idxToRentSchedule[nextScheduleIndex] = newRentSchedule;
        nextScheduleIndex = nextScheduleIndex.add(1);
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
        RentSchedule memory rs = idxToRentSchedule[idx];
        return (rs.paymentDate, rs.paymentAmount, rs.isApproved, rs.isRentPaid, rs.errorCode, rs.isErrorResolved);
    }
    // function getRentPaymentScheduleList(uint[] calldata _paymentDates) external view returns (RentSchedule[] memory) {
    //     // require(rentStartDate + rentCount - 1 < nextScheduleIndex, "rentStartDate is too big for rentCount");
    //     RentSchedule[] memory rentSchedule;
    //     for(uint i = 0; i < _paymentDates.length; i = i.add(1)) {
    //         rentSchedule.push(idxToRentSchedule[dateToScheduleIndex[_paymentDates[i]]]);
    //     }
    //     return rentSchedule;
    // }

    function decideOnRentSchedule(uint _paymentDate, bool boolValue) external onlyPlatformAuditor noReentrancy{
        idxToRentSchedule[dateToScheduleIndex[_paymentDate]].isApproved = boolValue;
    }
    function changeFMXA(address _tokenCtrt, address addrFMXA) external onlyPlatformAuditor noReentrancy{
        tokenToFMXA[_tokenCtrt] = addrFMXA;
    }
    function reportOnRentPayment(uint _paymentDate, bool boolValue, uint8 _errorCode) external onlyPlatformBackend noReentrancy{
        idxToRentSchedule[dateToScheduleIndex[_paymentDate]].isRentPaid = boolValue;
        if (_errorCode != 0) {
            idxToRentSchedule[dateToScheduleIndex[_paymentDate]].errorCode = _errorCode;
        }
    }
    function reportOnErrResolution(uint _paymentDate, bool boolValue) external onlyPlatformBackend noReentrancy{
        idxToRentSchedule[dateToScheduleIndex[_paymentDate]].isErrorResolved = boolValue;
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