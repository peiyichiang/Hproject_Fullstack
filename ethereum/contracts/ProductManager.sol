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
    address public addrHelium;
    mapping (address => bool) public isSettlementContract;

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
    constructor(address _addrHelium) public {
        addrHelium = _addrHelium;
    }

    // function isSettlementContractFunction(address _addrSettlement) external view returns (bool) {
    //     return isSettlementContract[_addrSettlement];
    // }
    function setAddrSettlement(address _addrSettlement, bool boolValue) external onlyAdmin{
        isSettlementContract[_addrSettlement] = boolValue;
    }

    function setAddrHelium(address _addrHelium) external onlyAdmin{
        addrHelium = _addrHelium;
    }
    modifier onlyAdmin() {
        require(HeliumITF(addrHelium).checkAdmin(msg.sender), "only  Helium_Admin is allowed to call this function");
        _;
    }
    function checkAdminFromPMC() external view returns (bool){
        return (HeliumITF(addrHelium).checkAdmin(msg.sender));
    }

    function addNewCtrtGroup(
        bytes32 symbol, address addrCrowdFundingCtrt,
        address addrTokenControllerCtrt,
        address addrTokenCtrt, address addrIncomeManagerCtrt)
        external onlyAdmin {
        groupCindex = groupCindex.add(1);
        idxToSymbol[groupCindex] = symbol;
        symbolToCtrtGroup[symbol] = CtrtGroup(groupCindex, addrCrowdFundingCtrt, addrTokenControllerCtrt, addrTokenCtrt, addrIncomeManagerCtrt);
    }

    function getCtrtGroup(bytes32 symbol) external view
    returns(uint groupIndex, address addrCrowdFundingCtrt,
    address addrTokenControllerCtrt, address addrTokenCtrt,
    address addrIncomeManagerCtrt){
        CtrtGroup memory ctrtGroup = symbolToCtrtGroup[symbol];
        return (ctrtGroup.index, ctrtGroup.CrowdFundingCtrt, ctrtGroup.TokenControllerCtrt, ctrtGroup.TokenCtrt, ctrtGroup.IncomeManagerCtrt);
    }

    //function() external payable { revert("should not send any ether directly"); }

}