pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
//deploy parameters: "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902191745
import "./Ownable.sol";
import "./SafeMath.sol";

//re-entry attack: prevented by noReentrancy
contract IncomeManagement is Ownable {
    using SafeMath for uint256;
    address public tokenCtrt;

    address public PA_Ctrt;//Platform Auditor
    address public FMXA_Ctrt;//Fund Manager Auditor
    address public platformCtrt;
    uint public dateTimeMin = 201901220900;

    uint public schCindex;//index of the current scheduled, 1 to 80. SPLC life time總共80期
    mapping(uint256 => IncomeSchedule) public idxToSchedule;//schedule index to incomeSchedule
    mapping(uint256 => uint256) public dateToIdx;//date to schedule index
    
    // cash flow: FMX -> platform -> investors
    struct IncomeSchedule {
        uint payableDate;//the date to send income, used as mapping key
        uint payableAmount;//given by FMXA, sending income from platform to investors
        uint paymentDate;//the date when the platform actually sent payment
        uint paymentAmount;//the amount the platform paid the asset owner
        bool isApproved;//by PA
        uint8 errorCode;//0 to 255
        bool isErrorResolved;//default = true
    }

    // 201902191700, "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902191745
    constructor(address _tokenCtrt, 
        address _PA_Ctrt, address _FMXA_Ctrt, address _platformCtrt,
        address[] memory management) public {
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
    modifier onlyPA() {//PlatformAuditor
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
    function isScheduleGoodForRelease(uint _dateTimeNow) external view returns (bool) {
        require(platformCtrt == msg.sender, "sender is not the platformCtrt");
        IncomeSchedule memory icSch = idxToSchedule[dateToIdx[_dateTimeNow]];
        return (icSch.isApproved && icSch.payableDate > dateTimeMin && icSch.payableAmount > 0 && icSch.paymentDate == 0 && icSch.paymentAmount == 0);
    }

    event AddSchedule(uint indexed _index, uint indexed _payableDate, uint _payableAmount);
    function AddSchedule(uint _payableDate, uint _payableAmount) external noReentrancy onlyFMXA {
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

    function AddScheduleBatch(uint _payableDates, uint _payableAmounts) external noReentrancy onlyFMXA {
        require(_payableDates.length == _payableAmounts, "payableDates must be of the same size of payableAmounts");

        for(uint i = 0; i < amount_; i.add(1)){
            require(_payableDate[i] > dateTimeMin, "_payableDate[i] has to be in yyyymmddhhmm");
            if (schCindex > 0) {
              require(idxToSchedule[schCindex].payableDate < _payableDate[i], "previous payableDate should be < _payableDate[i]");
            }

            schCindex = schCindex.add(1);
            idxToSchedule[schCindex].payableDate = _payableDate[i];
            idxToSchedule[schCindex].payableAmount = _payableAmount[i];
            dateToIdx[_payableDate[i]] = schCindex;
            emit AddSchedule(schCindex, _payableDate[i], _payableAmount[i]);
        }
    }
    /*struct IncomeSchedule {
        uint payableDate;//the date to send income, used as mapping key
        uint payableAmount;//given by FMXA, sending income from platform to investors
        uint paymentDate;//the date when the platform actually sent payment
        uint paymentAmount;//the amount the platform paid the asset owner
        bool isApproved;//by PA
        uint8 errorCode;//0 to 255
        bool isErrorResolved;//default = true
    }*/

    event EditIncomeSchedule(uint indexed _index, uint indexed _payableDate, uint _payableAmount);
    function editIncomeSchedule(uint _index, uint _payableDate, uint _payableAmount) external noReentrancy onlyFMXA {
        uint rsIndex = checkIndexPaymentDate(_index, _payableDate);

        require(dateToIdx[_payableDate] > 0, "this _payableDate must have been added already");
        require(idxToSchedule[rsIndex].isIncomePaid == false, "cannot edit already paid schedule");

        idxToSchedule[rsIndex].payableDate = _payableDate;
        idxToSchedule[rsIndex].payableAmount = _payableAmount;
        idxToSchedule[rsIndex].isApproved = false;

        emit EditIncomeSchedule(schCindex, _payableDate, _payableAmount);
    }

    /*struct IncomeSchedule {
        uint payableDate;//the date to send income, used as mapping key
        uint payableAmount;//given by FMXA, sending income from platform to investors
        uint paymentDate;//the date when the platform actually sent payment
        uint paymentAmount;//the amount the platform paid the asset owner
        bool isApproved;//by PA
        uint8 errorCode;//0 to 255
        bool isErrorResolved;//default = true
    }*/

    function getIncomeSchedule(uint _index, uint _payableDate) external view returns (uint paymentDate, uint payableAmount, bool isApproved, bool isIncomePaid, uint8 errorCode, bool isErrorResolved) {
        uint rsIndex = checkIndexPaymentDate(_index, _payableDate);
        IncomeSchedule memory icSch = idxToSchedule[rsIndex];

        return (icSch.paymentDate, icSch.payableAmount, icSch.isApproved, icSch.isIncomePaid, icSch.errorCode, icSch.isErrorResolved);
    }

    function getIncomeScheduleList(uint indexStart, uint amount) external view returns (uint[] memory paymentDates, uint[] memory payableAmounts, bool[] memory isApproveda, bool[] memory isIncomePaida, uint8[] memory errorCodes, bool[] memory isErrorResolveda) {
        require(indexStart > 0, "indexStart must be > 0");
        uint amount_;
        if (amount < 1 || amount > schCindex.sub(indexStart).add(1)) {
            //all get all schedules
            amount_ = schCindex.sub(indexStart).add(1);
        } else {
            amount_ = amount;
        }

        paymentDates = new uint[](amount_);
        payableAmounts = new uint[](amount_);
        isApproveda = new bool[](amount_);
        isIncomePaida = new bool[](amount_);
        errorCodes = new uint8[](amount_);
        isErrorResolveda = new bool[](amount_);

        for(uint i = 0; i < amount_; i.add(1)){
            IncomeSchedule memory icSch = idxToSchedule[i.add(indexStart)];
            paymentDates[i] = icSch.paymentDate;
            payableAmounts[i] = icSch.payableAmount;
            isApproveda[i] = icSch.isApproved;
            isIncomePaida[i] = icSch.isIncomePaid;
            errorCodes[i] = icSch.errorCode;
            isErrorResolveda[i] = icSch.isErrorResolved;
        }

    }
    /*struct IncomeSchedule {
        uint payableDate;//the date to send income, used as mapping key
        uint payableAmount;//given by FMXA, sending income from platform to investors
        uint paymentDate;//the date when the platform actually sent payment
        uint paymentAmount;//the amount the platform paid the asset owner
        bool isApproved;//by PA
        uint8 errorCode;//0 to 255
        bool isErrorResolved;//default = true
    }*/

    // function getIncomeScheduleListSpecific(uint[] calldata indices) external view returns (uint[] paymentDates, uint[] paymentAmounts, bool[] isApproveda, bool[] isIncomePaida, uint8[] errorCodes, bool[] isErrorResolveda) {

    //     IncomeSchedule[] memory incomeSchedule;
    //     for(uint i = 0; i < indices.length; i = i.add(1)) {
    //         uint rsIndex = checkIndexPaymentDate(_index, _payableDate);
    //         IncomeSchedule memory icSch = idxToSchedule[rsIndex];
    //         incomeSchedule[i] = idxToSchedule[dateToIdx[indices[i]]];

    //     }
    //     return incomeSchedule;
    // }

    function checkIndexPaymentDate(uint _index, uint _payableDate) internal view returns (uint rsIndex) {
        if (_index == 0) {
            rsIndex = dateToIdx[_payableDate];
        } else {
            require(_payableDate == 0, "either _index or _payableDate is 0");
            rsIndex = _index;
        }
    }

    event RemoveIncomeSchedule(uint indexed _index);
    function removeIncomeSchedule(uint _index, uint _payableDate) external noReentrancy onlyFMXA {
        uint rsIndex = checkIndexPaymentDate(_index, _payableDate);

        if(!idxToSchedule[rsIndex].isIncomePaid) {
            delete idxToSchedule[rsIndex].payableDate;
            delete idxToSchedule[rsIndex].payableAmount;
            delete idxToSchedule[rsIndex].isApproved;
        }
        emit RemoveIncomeSchedule(rsIndex);
    }


    /*設定isApproved */
    function setIsApproved(uint _index, uint _payableDate, bool boolValue) external onlyPA noReentrancy {
        uint rsIndex = checkIndexPaymentDate(_index, _payableDate);
        idxToSchedule[rsIndex].isApproved = boolValue;
    }

    event ChangeFMXA(address indexed _FMXA_old, address indexed _FMXA_new);
    function changeFMXA(address FMXA_Ctrt_new) external onlyPA noReentrancy {
        emit ChangeFMXA(FMXA_Ctrt, FMXA_Ctrt_new);
        FMXA_Ctrt = FMXA_Ctrt_new;
    }
    /*struct IncomeSchedule {
        uint payableDate;//the date to send income, used as mapping key
        uint payableAmount;//given by FMXA, sending income from platform to investors
        uint paymentDate;//the date when the platform actually sent payment
        uint paymentAmount;//the amount the platform paid the asset owner
        bool isApproved;//by PA
        uint8 errorCode;//0 to 255
        bool isErrorResolved;//default = true
    }*/

    /**設定 isIncomePaid，如果有錯誤發生，設定errorCode */
    event SetPaymentReleaseResults(uint indexed _payableDate, bool boolValue, uint8 _errorCode);
    function setPaymentReleaseResults(uint _index, uint _payableDate, uint _payableAmount, uint8 _errorCode) external noReentrancy {

        require(msg.sender == platformCtrt, "only platformCtrt can call this function");

        uint rsIndex = checkIndexPaymentDate(_index, _payableDate);
        idxToSchedule[rsIndex].payableDate = _payableDate;
        idxToSchedule[rsIndex].payableAmount = _payableAmount;

        if (_errorCode != 0) {
            idxToSchedule[rsIndex].errorCode = _errorCode;
        }
        emit SetPaymentReleaseResults(_payableDate, boolValue, _errorCode);
    }

    /**設定isErrorResolved */
    function setErrResolution(uint _index, uint _payableDate, bool boolValue) external  noReentrancy{
        require(msg.sender == platformCtrt, "only platformCtrt can call this function");

        uint rsIndex = checkIndexPaymentDate(_index, _payableDate);
        idxToSchedule[rsIndex].isErrorResolved = boolValue;
    }
}
