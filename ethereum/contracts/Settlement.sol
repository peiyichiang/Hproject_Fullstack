pragma solidity ^0.5.4;
/*
deploy parameters: none
*/
import "./SafeMath.sol";
interface Helium_Interface_SMC{
    function checkAdmin(address _eoa) external view returns(bool _isAdmin);
    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor);
}

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

interface HCAT721_Interface_SMC {
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function getAccountIds(address user, uint idxS, uint idxE) external;

    function allowance(address user, address operator) external view returns (uint remaining);
    function tokenApprove(address operator, uint amount) external;

    function name() external view returns (bytes32 _name);
    function symbol() external view returns (bytes32 _symbol);
    function getTokenOwners(uint idStart, uint idCount) external view returns(address[] memory);
    function safeTransferFromBatch(address _from, address _to, uint amount, uint price, uint serverTime) external;
    function checkSafeTransferFromBatch(
        address _from, address _to, uint amount, uint price, uint serverTime) external view returns(bool[] memory boolArray);
    function getFirstFromAddrTokenId(address _from) external view returns(uint tokenId_);
    function sendTokenToSettlementById(address _from, address _to, uint _tokenId) external;
    function sendTokenFromSettlementById(address _from, address _to, uint _tokenId) external;
    function isMsgSenderGood(uint _tokenId, address _from) external view returns(bool, address, address);
}

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
    function getSettlementDetails() public view returns(address, address, address) {
        return (addrRegistry, addrProductManager, addrHelium);
    }

    bytes4 constant TOKEN_RECEIVER_HASH = 0x79830ac6;
    // Equals to `bytes4(keccak256(abi.encodePacked("tokenReceiver(address,address,uint256)")))`
    function tokenReceiver(address _from, address _to, uint256 _tokenId) external pure returns(bytes4) {
        require(_from != address(0), "from address should not be zero");// _from address is contract address if minting tokens
        require(_to != address(0), "original EOA should not be zero");
        require(_tokenId > 0, "tokenId should be greater than zero");
        return TOKEN_RECEIVER_HASH;
    }

    function sendTokenFromSettlementById(address _from, address _to, uint _tokenId, address assetAddr_) external {
        require(checkPlatformSupervisor(), "only platformSupervisor is allowed");
        address from_;
        if(_from == address(0)){
            from_ = address(this);
        } else {
            from_ = _from;
        }
        require(_to != address(0), "_to should not be zero");
        require(_tokenId > 0, "tokenId should be greater than zero");

        HCAT721_Interface_SMC(assetAddr_).sendTokenFromSettlementById(from_, _to, _tokenId);
    }

    function checkSendTokenFromSettlementById(address _from, address _to, uint _tokenId, address assetAddr_)
    external view returns(bool, address, address) {
        require(_to != address(0), "_to should not be zero");
        (bool isValid, address tokenIdOwner, address msgSender) = HCAT721_Interface_SMC(assetAddr_).isMsgSenderGood(_tokenId, _from);
        return (isValid, tokenIdOwner, msgSender);
    }

    function checkAdmin() public view returns (bool){
        return (Helium_Interface_SMC(addrHelium).checkAdmin(msg.sender));
    }
    function checkPlatformSupervisor() public view returns (bool){
        return (Helium_Interface_SMC(addrHelium).checkPlatformSupervisor(msg.sender));
    }
    modifier onlyAdmin() {
        require(checkAdmin(), "only Helium_Admin is allowed");
        _;
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