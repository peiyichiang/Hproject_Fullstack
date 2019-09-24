pragma solidity ^0.5.4;
/*
deploy parameters: none
*/
import "./SafeMath.sol";

interface HCAT_TokenReceiver_interface_inSettlement {
    function HCAT_TokenReceiver(address _eoa, address _from, uint256 _tokenId) external pure returns(bytes4);
}

interface RegistryInterface_atSettlement {
    function isAssetbookApproved(address assetbookAddr) external view returns (bool);
    function isFundingApproved(
        address assetbookAddr, uint buyAmount, uint balance, uint fundingType) external view returns (bool isOkBuyAmount, bool isOkBalanceNew, uint authLevel, uint maxBuyAmount, uint maxBalance);
}//RegistryInterface_atSettlement(addrRegistry).isAddrApproved(_to);

interface ProductManager_Interface_HCAT{
    function isSettlementContract(address _addrSettlement) external view returns(bool);
}// ProductManager_Interface_HCAT(addrProductManager).isSettlementContract[_to]

contract Settlement {
    using SafeMath for uint256;
    using AddressUtils for address;

    address public addrRegistry;
    address public addrProductManager;
    bytes4 constant HCAT_TOKEN_RECEIVER_HASH = 0x18b6fc3b;
    bytes4 constant SETTLEMENT_HASH = 0x713ad5d8;
    // Equals to `bytes4(keccak256(abi.encodePacked("settlementTokenReceiver(address,address,uint256)")))`

    constructor (address _addrRegistry, address _addrProductManager) public {
        addrRegistry = _addrRegistry;
        addrProductManager = _addrProductManager;
    }

    function settlementTokenReceiver(address _eoa, address _from, uint256 tokenId) external view returns(bytes4) {
        require(_eoa != address(0), "_eoa address should not be zero");
        require(_from == address(this), "_from address should be this contract");
        require(tokenId > 0, "tokenId should be greater than zero");
        return SETTLEMENT_HASH;
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