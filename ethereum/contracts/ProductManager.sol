pragma solidity ^0.5.4;
/*
deploy parameters: none
*/
import "./SafeMath.sol";
interface HeliumITF{
    function checkAdmin(address _eoa) external view returns(bool _isAdmin);
}
contract ProductManager {
    using SafeMath for uint256;
    address public HeliumAddr;
    
    uint public groupCindex;
    mapping(bytes32 => CtrtGroup) public symbolToCtrtGroup;
    mapping(uint => bytes32) public idxToSymbol;

    struct CtrtGroup {
        uint index;
        address CrowdFundingCtrt;
        address TokenControllerCtrt;
        address TokenCtrt;
        address IncomeManagerCtrt;
    }
    constructor(address _HeliumAddr) public {
        HeliumAddr = _HeliumAddr;
    }

    function setHeliumAddr(address _HeliumAddr) external onlyAdmin{
        HeliumAddr = _HeliumAddr;
    }
    modifier onlyAdmin() {
        require(HeliumITF(HeliumAddr).checkAdmin(msg.sender), "only  Helium_Admin is allowed to call this function");
        _;
    }
    function checkAdmin() external view returns (bool){
        return (HeliumITF(HeliumAddr).checkAdmin(msg.sender));
    }

    function addNewCtrtGroup(bytes32 symbol,
        address addrCrowdFundingCtrt, address addrTokenControllerCtrt,
        address addrTokenCtrt, address addrIncomeManagerCtrt)
        external onlyAdmin {
        groupCindex = groupCindex.add(1);
        idxToSymbol[groupCindex] = symbol;
        symbolToCtrtGroup[symbol] = CtrtGroup(groupCindex, addrCrowdFundingCtrt, addrTokenControllerCtrt, addrTokenCtrt, addrIncomeManagerCtrt);
    }

    function getCtrtGroup(bytes32 symbol) view external returns(uint groupIndex, address addrCrowdFundingCtrt, address addrTokenControllerCtrt, address addrTokenCtrt, address addrIncomeManagerCtrt){
        CtrtGroup memory ctrtGroup = symbolToCtrtGroup[symbol];
        return (ctrtGroup.index, ctrtGroup.CrowdFundingCtrt, ctrtGroup.TokenControllerCtrt, ctrtGroup.TokenCtrt, ctrtGroup.IncomeManagerCtrt);
    }

    //function() external payable { revert("should not send any ether directly"); }

}