pragma solidity ^0.5.4;
/*
deploy parameters: none
*/
import "./SafeMath.sol";

interface HCAT_TokenReceiver_Interface_SMC {
    function tokenReceiver(address _from, address _to, uint256 _tokenId) external pure returns(bytes4);
}

interface Registry_Interface_SMC {
    function isAssetbookApproved(address assetbookAddr) external view returns (bool);
    function isFundingApproved(
        address assetbookAddr, uint buyAmount, uint balance, uint fundingType) external view returns (bool isOkBuyAmount, bool isOkBalanceNew, uint authLevel, uint maxBuyAmount, uint maxBalance);
}//Registry_Interface_SMC(addrRegistry).isAddrApproved(_to);

interface ProductManager_Interface_SMC{
    function isSettlementApproved(address _addrSettlement) external view returns(bool);
}// ProductManager_Interface_SMC(addrProductManager).isSettlementApproved[_to]



contract Settlement {
    using SafeMath for uint256;
    using AddressUtils for address;

    address public addrRegistry;
    address public addrProductManager;
    address public addrHelium;

    // Equals to `bytes4(keccak256(abi.encodePacked("settlementTokenReceiver(address,address,uint256)")))`

    constructor (address _addrRegistry,
    address _addrProductManager, address _addrHelium) public {
        addrRegistry = _addrRegistry;
        addrProductManager = _addrProductManager;
        addrHelium = _addrHelium;
    }
    function checkDeploymentConditions(
        address _addrRegistry, address _addrProductManager, address _addrHelium
      ) public view returns(bool[] memory boolArray) {
        boolArray = new bool[](3);
        boolArray[0] = _addrRegistry.isContract();
        boolArray[1] = _addrProductManager.isContract();
        boolArray[2] = _addrHelium.isContract();
    }
    function getSettlementDetails() public view returns(
        address addrRegistry_,
        address addrProductManager_, address addrHelium_) {
        addrRegistry_ = addrRegistry;
        addrProductManager_ = addrProductManager;
        addrHelium_ = addrHelium;
    }

    bytes4 constant TOKEN_RECEIVER_HASH = 0x79830ac6;
    // Equals to `bytes4(keccak256(abi.encodePacked("tokenReceiver(address,address,uint256)")))`
    function tokenReceiver(address _from, address _to, uint256 _tokenId) external pure returns(bytes4) {
        require(_from != address(0), "from address should not be zero");// _from address is contract address if minting tokens
        require(_to != address(0), "original EOA should not be zero");
        require(_tokenId > 0, "tokenId should be greater than zero");
        return TOKEN_RECEIVER_HASH;
    }

    function sendTokenFromSettlement(address _from, address _to, uint tokenId) external {
    }
}

//--------------------==
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) }
        // solium-disable-line security/no-inline-assembly
        return size > 0;
    }


}