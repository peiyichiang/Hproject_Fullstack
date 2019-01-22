pragma solidity ^0.5.2;

contract Ownable {
    address public owner;
    address public ownerNew;
    address public chairman;
    address public director;
    address public manager;
    address public admin;
    address public addrNew;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    uint public ownerVote, chairmanVote, directorVote, managerVote, adminVote;
    constructor() public {
        owner = msg.sender;
        chairman = msg.sender;
        director = msg.sender;
        manager = msg.sender;
        admin = msg.sender;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can call this function");
        _;
    }
    event changeManagement(address indexed addrOld, address indexed addrNew, uint personIdx);

    function ownerSign() public {
        require(msg.sender == owner, "restricted to owner");
        ownerVote = 1;
    }
    function chairmanSign() public {
        require(msg.sender == chairman, "restricted to chairman");
        chairmanVote = 1;
    }
    function directorSign() public isThirdparty {
        require(msg.sender == director, "restricted to director");
        directorVote = 1;
    }
    function managerSign() public isThirdparty {
        require(msg.sender == manager, "restricted to manager");
        managerVote = 1;
    }
    function adminSign() public isThirdparty {
        require(msg.sender == admin, "restricted to admin");
        adminVote = 1;
    }
    modifier isMultiSig(){
        require(ownerVote + chairmanVote + directorVote + managerVote + adminVote >= 3, "isMultiSig failed");
        _;
    }
    function resetSignStatus() internal {
        ownerVote = 0;
        chairmanVote = 0;
        directorVote = 0;
        managerVote = 0;
        adminVote = 0;
    }
    function changeManagement(uint managementIdx, address addrNew) public isMultiSig {
        require(msg.sender == owner || msg.sender == chairman || msg.sender == director  || msg.sender == manager || msg.sender == admin, "only management team can access");
        require(managementIdx > 0 && managementIdx < 6, "managementIdx is out of range");
        require(addrNew != address(0), "new address cannot be zero");
        if (managementIdx == 1) {
            owner = addrNew;
            emit changeManagement(owner, addrNew, managementIdx);
        } else if (managementIdx == 2) {
            chairman = addrNew;
            emit changeManagement(chairman, addrNew, managementIdx);
        } else if (managementIdx == 3) {
            director = addrNew;
            emit changeManagement(director, addrNew, managementIdx);
        } else if (managementIdx == 4) {
            manager = addrNew;
            emit changeManagement(manager, addrNew, managementIdx);
        } else if (managementIdx == 5) {
            admin = addrNew;
            emit changeManagement(admin, addrNew, managementIdx);
        } else (require(false, "not valid option");)
        resetSignStatus();
    }
    function getVotes() public view returns(uint,uint,uint,uint,uint){
        return (ownerVote, chairmanVote, directorVote, managerVote, adminVote);
    }
}
contract Htoken {
    function getTokenOwners(uint idStart, uint idCount) external returns(address[]) {}
}
contract Rent is Ownable {
    using SafeMath for uint256;
    //using AddressUtils for address??
    //re-entry attack??
    uint public releaseDate;//basis of time reference
    address public tokenCtrt;
    uint public nextScheduleIndex = 1;//index of the next scheduled date for rent payment

    address public platformAuditor;
    address public platformBackend;
    address public timeServer;
    uint public dateNow;//20190301
    uint public startingDate = 20190122;
    uint public nextScheduleIndexToRun;

    mapping(uint256 => RentSchedule) public dateToRentSchedule;
    mapping(address => address) public tokenToFMXA;
    
    // cash flow: FMX -> platform -> investors
    struct RentSchedule {
        uint paymentDate;//the date to send rent
        uint paymentAmount;//given by FMXA, sending rent from platform to investors
        bool isApproved;//by PA
        bool isRentPaid;//confirmed after platform's bank confirming rent has been sent
        uint8 errorCode;//0 to 255
        bool isErrorResolved;
    }
    constructor(uint _releaseDate, address _tokenCtrt, address _platformAuditor, address _platformBackend) public {
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
    function checkRentRelease(uint _dateToday) external pure returns (bool) {
        require(timeServer == msg.sender, "sender is not the time server");
        return (dateToRentSchedule[_dateToday].isApproved && !dateToRentSchedule[_dateToday].isRentPaid);
    }

    function makeRentSchedule(uint _paymentDate, uint _paymentAmount) external {
        require(tokenToFMXA[tokenCtrt] == msg.sender, "sender is not the admin for this token");
        RentSchedule newRentSchedule = RentSchedule({
            paymentDate: _paymentDate,
            paymentAmount: _paymentAmount,
            isApproved: false,
            isRentPaid: false,
            errorCode: 0,
            isErrorResolved: false,
        });//20190301
        dateToRentSchedule[nextScheduleIndex] = newRentSchedule;
        nextScheduleIndex = nextScheduleIndex.add(1);
    }
    function getRentPaymentSchedule(uint _paymentDate) external view returns (RentSchedule) {
        return dateToRentSchedule[_paymentDate];
    }
    function getRentPaymentScheduleList(uint[] _paymentDates) external view returns (RentSchedule[]) {
        // require(rentStartDate + rentCount - 1 < nextScheduleIndex, "rentStartDate is too big for rentCount");
        RentSchedule[] memory rentSchedule;
        for(uint i = 0; i < paymentDates.length; i = i.add(1)) {
            rentSchedule.push(dateToRentSchedule[_paymentDates[i]]);
        }
        return rentSchedule;
    }

    function decideOnRentSchedule(uint _paymentDate, bool boolValue) external onlyPlatformAuditor {
        dateToRentSchedule[_paymentDate].isApproved = boolValue;
    }
    function changeFMXA(address _tokenCtrt, address addrFMXA) external onlyPlatformAuditor {
        tokenToFMXA[_tokenCtrt] = addrFMXA;
    }
    function reportOnRentPayment(uint _paymentDate, bool boolValue, uint8 _errorCode) external onlyPlatformBackend {
        dateToRentSchedule[_paymentDate].isRentPaid = boolValue;
        if (_errorCode != 0) {
            dateToRentSchedule[_paymentDate].errorCode = _errorCode;
        }
    }
    function reportOnErrResolution(uint _paymentDate, bool boolValue) external onlyPlatformBackend {
        dateToRentSchedule[_paymentDate].isErrorResolved = boolValue;
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