pragma solidity ^0.5.4;

import "./SafeMath.sol";//not used i++ is assumed not to be too big
import "./Ownable.sol";
interface IncomeManagerCtrt_PlatformSupervisor {
    function setIsApproved(uint _index, uint _payableDate, bool boolValue) external;
    function changeFMC(address FMXA_Ctrt_new) external;
}

//"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 201903061045

contract PlatformSupervisorCtrt is Ownable {
    using SafeMath for uint256;
    //using AddressUtils for address;
    address public platformSupervisor;
    mapping(uint => address) idxToIMCtrts;
    uint public cindex;//count and index for IncomeManagerCtrts
    mapping(address => uint) IMCtrtsToidx;

    //"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201903061045
    constructor(address _platformSupervisor, address[] memory management) public{
        platformSupervisor = _platformSupervisor;
        require(management.length > 4, "management.length should be > 4");
        owner = management[4];
        chairman = management[3];
        director = management[2];
        manager = management[1];
        admin = management[0];
    }
    modifier onlyPlatformSupervisor(){
        require(msg.sender == platformSupervisor, "only platformSupervisor is allowed");
        _;
    }

    function addIncomeManagerCtrt(address _IncomeManagerCtrt) external onlyPlatformSupervisor {
        require(_IncomeManagerCtrt != address(0), "_IncomeManagerCtrt cannot be 0x0");
        require(IMCtrtsToidx[_IncomeManagerCtrt] == 0, "_IncomeManagerCtrt has already been added");
        cindex = cindex.add(1);
        idxToIMCtrts[cindex] = _IncomeManagerCtrt;
        IMCtrtsToidx[_IncomeManagerCtrt] = cindex;
    }
    function getIncomeManagerCtrts(uint indexStart, uint amount) 
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

    event SetIncomeManagerCtrt(uint index, address indexed _IncomeManagerCtrt);
    function setIncomeManagerCtrt(uint index, address _IncomeManagerCtrt) external onlyPlatformSupervisor {
        delete IMCtrtsToidx[idxToIMCtrts[index]];
        idxToIMCtrts[index] = _IncomeManagerCtrt;
        IMCtrtsToidx[_IncomeManagerCtrt] = index;
        emit SetIncomeManagerCtrt(index, _IncomeManagerCtrt);
    }

    event DeleteIncomeManagerCtrt(address indexed _IncomeManagerCtrt);
    function deleteIncomeManagerCtrt(address _IncomeManagerCtrt) external onlyPlatformSupervisor {
        delete idxToIMCtrts[IMCtrtsToidx[_IncomeManagerCtrt]];
        emit DeleteIncomeManagerCtrt(_IncomeManagerCtrt);
    }

    function setIsApproved(address _IncomeManagerCtrt, uint IMC_CtrtIndex, uint IMC_IncomeIndex, uint _payableDate, bool boolValue) external onlyPlatformSupervisor {
        address IMC_addr;
        if (_IncomeManagerCtrt == address(0)) {
          require(IMC_CtrtIndex > 0, "_IncomeManagerCtrt and IMC_CtrtIndex cannot both be 0");
          IMC_addr = idxToIMCtrts[IMC_CtrtIndex];
        }
        IncomeManagerCtrt_PlatformSupervisor icMgmtCtrt = IncomeManagerCtrt_PlatformSupervisor(address(uint160(IMC_addr)));
        icMgmtCtrt.setIsApproved(IMC_IncomeIndex, _payableDate, boolValue);
    }

    function changeFMC(address _IncomeManagerCtrt, uint IMC_CtrtIndex, address fundManagerCtrt_new) external onlyPlatformSupervisor {
        address IMC_addr;
        if (_IncomeManagerCtrt == address(0)) {
          require(IMC_CtrtIndex > 0, "_IncomeManagerCtrt and IMC_CtrtIndex cannot both be 0");
          IMC_addr = idxToIMCtrts[IMC_CtrtIndex];
        }

        IncomeManagerCtrt_PlatformSupervisor icMgmtCtrt = IncomeManagerCtrt_PlatformSupervisor(address(uint160(IMC_addr)));
        icMgmtCtrt.changeFMC(fundManagerCtrt_new);
    }
}
