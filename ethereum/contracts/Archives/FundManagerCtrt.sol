pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
//deploy parameters: "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902191745
import "./SafeMath.sol";//not used i++ is assumed not to be too big
import "./Ownable.sol";
interface IncomeManagementCtrt_FundManager {
    function addSchedule(uint _payableDate, uint _payableAmount) external;
    function AddScheduleBatch(uint[] calldata _payableDates, uint[] calldata _payableAmounts) external;
}

//"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 201903061045

contract FundManagerCtrt is Ownable {
    using SafeMath for uint256;
    //using AddressUtils for address;
    address public fundManager;
    mapping(uint => address) idxToIMCtrts;
    uint public cindex;//count and index for incomeManagementCtrts
    mapping(address => uint) IMCtrtsToidx;

    //"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201903061045
    constructor(address _fundManager, address[] memory management) public{
        fundManager = _fundManager;
        require(management.length > 4, "management.length should be > 4");
        owner = management[4];
        chairman = management[3];
        director = management[2];
        manager = management[1];
        admin = management[0];
    }
    modifier onlyFundManager(){
        require(msg.sender == fundManager, "only fundManager is allowed");
        _;
    }

    function addIncomeManagementCtrt(address _incomeManagementCtrt) external onlyFundManager {
        require(_incomeManagementCtrt != address(0), "_incomeManagementCtrt cannot be 0x0");
        require(IMCtrtsToidx[_incomeManagementCtrt] == 0, "_incomeManagementCtrt has already been added");
        cindex = cindex.add(1);
        idxToIMCtrts[cindex] = _incomeManagementCtrt;
        IMCtrtsToidx[_incomeManagementCtrt] = cindex;
    }
    function getIncomeManagementCtrts(uint indexStart, uint amount) 
        external view returns(address[] memory IMCtrtArray) {
        uint amount_; uint indexStart_;
        if(indexStart == 0 && amount == 0) {
          indexStart_ = 1;
          amount_ = cindex;

        } else {
            indexStart_ = indexStart;
            require(amount > 0, "amount must be > 0");
            require(indexStart > 0, "indexStart must be > 0");
            if(indexStart.add(amount).sub(1) > cindex) {
              amount_ = cindex.sub(indexStart).add(1);
            } else {
              amount_ = amount;
            }
        }
        IMCtrtArray = new address[](amount_);

        for(uint i = 0; i < amount_; i = i.add(1)) {
            IMCtrtArray[i] = idxToIMCtrts[i.add(indexStart_)];
        }
    }

    event SetIncomeManagementCtrt(uint index, address indexed _incomeManagementCtrt);
    function setIncomeManagementCtrt(uint index, address _incomeManagementCtrt) external onlyFundManager {
        delete IMCtrtsToidx[idxToIMCtrts[index]];
        idxToIMCtrts[index] = _incomeManagementCtrt;
        IMCtrtsToidx[_incomeManagementCtrt] = index;
        emit SetIncomeManagementCtrt(index, _incomeManagementCtrt);
    }

    event DeleteIncomeManagementCtrt(address indexed _incomeManagementCtrt);
    function deleteIncomeManagementCtrt(address _incomeManagementCtrt) external onlyFundManager {
        delete idxToIMCtrts[IMCtrtsToidx[_incomeManagementCtrt]];
        emit DeleteIncomeManagementCtrt(_incomeManagementCtrt);
    }

    function setIsApproved(address _incomeManagementCtrt, uint IMC_CtrtIndex, uint IMC_IncomeIndex, uint _payableDate, bool boolValue) external onlyFundManager {
        address IMC_addr;
        if (_incomeManagementCtrt == address(0)) {
          require(IMC_CtrtIndex > 0, "_incomeManagementCtrt and IMC_CtrtIndex cannot both be 0");
          IMC_addr = idxToIMCtrts[IMC_CtrtIndex];
        }
        IncomeManagementCtrt_FundManager icMgmtCtrt = IncomeManagementCtrt_FundManager(address(uint160(IMC_addr)));
        icMgmtCtrt.setIsApproved(IMC_IncomeIndex, _payableDate, boolValue);
    }

    function changeFMC(address _incomeManagementCtrt, uint IMC_CtrtIndex, address fundManagerCtrt_new) external onlyFundManager {
        address IMC_addr;
        if (_incomeManagementCtrt == address(0)) {
          require(IMC_CtrtIndex > 0, "_incomeManagementCtrt and IMC_CtrtIndex cannot both be 0");
          IMC_addr = idxToIMCtrts[IMC_CtrtIndex];
        }

        IncomeManagementCtrt_FundManager icMgmtCtrt = IncomeManagementCtrt_FundManager(address(uint160(IMC_addr)));
        icMgmtCtrt.changeFMC(fundManagerCtrt_new);
    }
}
