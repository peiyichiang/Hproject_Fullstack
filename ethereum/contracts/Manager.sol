pragma solidity ^0.5.3;
/*
contract NFTokenSPLC {
    event MintSerialNFT(uint tokenId, string nftName, string nftSymbol, string pricingCurrency, string uri, uint initialAssetPricing);
    function mintSerialNFT(string _uri) external;
    event BurnNFT(address _owner, uint _tokenId, address msgsender);
    function burnNFT(address _owner, uint256 _tokenId) external;
    event SetNewSafeVault(address _SafeVault, address _SafeVaultNew);
    function setNewSafeVault(address _newSafeVault) external;
    function setNewSafeVault() external;
    function disablePreDelivery() external;
    function setLockUpPeriod(
        uint _LockUpPeriod_inMins, uint _LockUpPeriod_inWeeks) 
        external;
    function setTokenMintTime(uint _tokenMintTime) external;
    function setTokenStatus(bool _tokenStatus) external;
    //ERC721
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data) external;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external;
    function transferFrom(address _from, address _to, uint256 _tokenId) external;
    function approve(address _approved, uint256 _tokenId) external;
    function setApprovalForAll(address _operator, bool _approved) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);

    //ERC165
    function supportsInterface(bytes4 _interfaceID) external view returns (bool);
    //ERC721Metadata
    function name() external view returns (string _name);
    function symbol() external view returns (string _symbol);
    function tokenURI(uint256 _tokenId) external view returns (string);
    //ERC721Enumerable
    function totalSupply() external view returns (uint256);
    function tokenByIndex(uint256 _index) external view returns (uint256);
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256);
}

*/
import "./Ownable.sol";
import "./Crowdsale.sol";
import "./ERC721_SPLC5.sol";

contract ERC721_SPLC_Manager is Ownable {
    using SafeMath for uint256;

    NFTokenSPLC htoken;//
    CrowdSale crowdSale;
    uint public nextPairId = 1;
    mapping(uint256 => CtrtPair) public idToCtrtPair;//ID to contract pair
    struct CtrtPair {
        address crowdSaleCtrt;
        address tokenCtrt;
    }
    function generateNewCtrtPair(
        address _crowdSaleCtrt, address _tokenCtrt) external onlyAdmin {
        idToCtrtPair[nextPairId] = CtrtPair(_crowdSaleCtrt, _tokenCtrt);
        nextPairId = nextPairId.add(1);
    }

    function generateToken(uint pairId, string calldata _uri) external onlyAdmin {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        htoken.mintSerialNFT(_uri);
    }
    function setNewSafeVault(uint pairId, address _newSafeVault) 
    external onlyAdmin {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        htoken.setNewSafeVault(_newSafeVault);
    }
/*  //ERC721
    event MintSerialNFT(uint tokenId, string nftName, string nftSymbol, string pricingCurrency, string uri, uint initialAssetPricing);
    function mintSerialNFT(string _uri) external;
    event BurnNFT(address _owner, uint _tokenId, address msgsender);
    function burnNFT(address _owner, uint256 _tokenId) external;
    event SetNewSafeVault(address _SafeVault, address _SafeVaultNew);
    function setNewSafeVault(address _newSafeVault) external;
    function setNewSafeVault() external;
    function disablePreDelivery() external;
    function setLockUpPeriod(
        uint _LockUpPeriod_inMins, uint _LockUpPeriod_inWeeks) 
        external;
    function setTokenMintTime(uint _tokenMintTime) external;
    function setTokenStatus(bool _tokenStatus) external;
 */

    function balanceOf(uint pairId, address _owner) public returns (uint256) {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return htoken.balanceOf(_owner);
    }

    function ownerOf(uint pairId, uint256 _tokenId) public returns (address) {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return htoken.ownerOf(_tokenId);
    }

    function safeTransferFrom(
        uint pairId, address _from, address _to, uint256 _tokenId, bytes memory _data) public onlyAdmin{
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        htoken.safeTransferFrom(_from, _to, _tokenId, _data);
    }
//safeTransferFrom(address _from, address _to, uint256 _tokenId) external;
    function safeTransferFrom(
        uint pairId, address _from, address _to, uint256 _tokenId) public onlyAdmin {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        htoken.safeTransferFrom(_from, _to, _tokenId);
    }
//transferFrom(address _from, address _to, uint256 _tokenId) external;
    function transferFrom(
        uint pairId, address _from, address _to, uint256 _tokenId) public onlyAdmin {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        htoken.transferFrom(_from, _to, _tokenId);
    }

//approve(address _approved, uint256 _tokenId) external;
    function approve(
        uint pairId, address _approved, uint256 _tokenId) public onlyAdmin {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        htoken.approve(_approved, _tokenId);
    }

//setApprovalForAll(address _operator, bool _approved) external;
    function setApprovalForAll(
        uint pairId, address _operator, bool _approved) public onlyAdmin {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        htoken.setApprovalForAll(_operator, _approved);
    }

//getApproved(uint256 _tokenId) external view returns (address);
    function getApproved(
        uint pairId, uint256 _tokenId) 
        external returns (address) {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return htoken.getApproved(_tokenId);
    }

//isApprovedForAll(address _owner, address _operator) external view returns (bool);
    function isApprovedForAll(
        uint pairId, address _owner, address _operator) 
        external returns (bool) {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return htoken.isApprovedForAll(_owner, _operator);
    }


    /**
    //ERC721
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data) external;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external;
    function transferFrom(address _from, address _to, uint256 _tokenId) external;
    function approve(address _approved, uint256 _tokenId) external;
    function setApprovalForAll(address _operator, bool _approved) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);

    //ERC165
    function supportsInterface(bytes4 _interfaceID) external view returns (bool);
    //ERC721Metadata
    function name() external view returns (string _name);
    function symbol() external view returns (string _symbol);
    function tokenURI(uint256 _tokenId) external view returns (string);
    //ERC721Enumerable
    function totalSupply() external view returns (uint256);
    function tokenByIndex(uint256 _index) external view returns (uint256);
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256);
     */

    function transferOwnership(uint pairId, uint managementIdx, address addrNew) public {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        htoken.setManagement(managementIdx, addrNew);
    }

    function name(uint pairId) public returns (string memory) {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return htoken.name();
    }
    function symbol(uint pairId) public returns (string memory) {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return htoken.symbol();
    }
    function tokenURI(uint pairId, uint256 _tokenId) public returns (string memory) {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return htoken.tokenURI(_tokenId);
    }
    function totalSupply(uint pairId) public returns (uint) {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return htoken.totalSupply();
    }
    function tokenOfOwnerByIndex(uint pairId, address _owner, uint256 _index) public returns (uint) {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return htoken.tokenOfOwnerByIndex(_owner,_index);
    }


// get_ownerToIds(address _owner) external view returns (uint[]) {
    function get_ownerToIds(uint pairId, address _owner) public returns(uint[] memory) {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return htoken.get_ownerToIds(_owner);
    }

// getNFT(uint _id) external view returns (string, string, string, string, uint) {
    function getNFT(uint pairId, uint _tokenId) public returns (string memory, string memory, 
    string memory, string memory, uint){
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return htoken.getNFT(_tokenId);
    }
    
    function getCtrtDetails(uint pairId) public returns (
        bool, uint, uint, uint,
        uint, uint, string memory, 
        uint, string memory, bool, address,
        uint, uint) {
        htoken = NFTokenSPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return htoken.getCtrtDetails();
    }

    /*
    function Invest(uint _tokencount) public checkAmount(_tokencount);
    function ProjectState() public view returns(string _return);
    function Progress() public view returns(uint);
    */
    function Invest(uint pairId, uint _tokencount) public {
        crowdSale = CrowdSale(idToCtrtPair[pairId].crowdSaleCtrt);
        return crowdSale.Invest(_tokencount);
    }
    function ProjectState(uint pairId) public returns(string  memory _return){
        crowdSale = CrowdSale(idToCtrtPair[pairId].crowdSaleCtrt);
        return crowdSale.ProjectState();
    }
    function Progress(uint pairId) public returns(uint){
        crowdSale = CrowdSale(idToCtrtPair[pairId].crowdSaleCtrt);
        return crowdSale.Progress();
    }

}