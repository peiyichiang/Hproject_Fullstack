pragma solidity ^0.5.4;
/*
deploy parameters: none
*/
import "./SafeMath.sol";
interface Helium_Interface_PMC{
    function checkAdmin(address _eoa) external view returns(bool _isAdmin);
    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor);
}
contract ProductManager {
    using AddressUtils for address;
    using SafeMath for uint256;
    address public addrHelium;
    mapping (address => bool) public isSettlementApproved;

    uint public groupCindex;
    mapping(bytes32 => CtrtGroup) public symbolToCtrtGroup;
    mapping(uint => bytes32) public idxToSymbol;

    struct CtrtGroup {
        address CrowdFundingCtrt;
        address TokenControllerCtrt;
        address TokenCtrt;
        address IncomeManagerCtrt;
    }
    constructor(address _addrHelium) public {
        addrHelium = _addrHelium;
    }
    function checkDeploymentConditions(
        address _addrHelium
    ) public view returns(bool[] memory boolArray) {
        boolArray = new bool[](1);
        boolArray[0] = _addrHelium.isContract();
    }
    function getProductManagerDetails() public view returns(
        uint groupCindex_, address addrHelium_) {
        groupCindex_ = groupCindex;
        addrHelium_ = addrHelium;
    }
    // function isSettlementContractFunction(address _addrSettlement) external view returns (bool) {
    //     return isSettlementApproved[_addrSettlement];
    // }
    function setAddrSettlement(address _addrSettlement, bool boolValue) external onlyAdmin{
        isSettlementApproved[_addrSettlement] = boolValue;
    }

    function setAddrHelium(address _addrHelium) external onlyAdmin{
        addrHelium = _addrHelium;
    }
    modifier onlyAdmin() {
        require(checkAdmin(), "only Helium_Admin is allowed");
        _;
    }
    function checkAdmin() public view returns (bool){
        return (Helium_Interface_PMC(addrHelium).checkAdmin(msg.sender));
    }
    function checkPlatformSupervisor() public view returns (bool){
        return (Helium_Interface_PMC(addrHelium).checkPlatformSupervisor(msg.sender));
    }

    function addNewCtrtGroup(
        bytes32 symbol, address addrCrowdFundingCtrt,
        address addrTokenControllerCtrt,
        address addrTokenCtrt, address addrIncomeManagerCtrt)
        external onlyAdmin{
        groupCindex = groupCindex.add(1);
        idxToSymbol[groupCindex] = symbol;
        symbolToCtrtGroup[symbol] = CtrtGroup(addrCrowdFundingCtrt, addrTokenControllerCtrt, addrTokenCtrt, addrIncomeManagerCtrt);
    }

    function getCtrtGroup(bytes32 symbol) external view
    returns(address addrCrowdFundingCtrt,
    address addrTokenControllerCtrt, address addrTokenCtrt,
    address addrIncomeManagerCtrt){
        CtrtGroup memory ctrtGroup = symbolToCtrtGroup[symbol];
        return (ctrtGroup.CrowdFundingCtrt, ctrtGroup.TokenControllerCtrt, ctrtGroup.TokenCtrt, ctrtGroup.IncomeManagerCtrt);
    }
    //function() external payable { revert("should not send any ether directly"); }
}
//--------------------==
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) }
        return size > 0;
    }
}