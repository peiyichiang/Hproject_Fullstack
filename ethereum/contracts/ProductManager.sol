pragma solidity ^0.5.4;
/*
deploy parameters: none
*/
import "./Ownable.sol";
import "./SafeMath.sol";

contract ProductManager is Ownable {
    using SafeMath for uint256;

    // ERC721SPLC erc721SPLC;
    // CrowdFunding crowdFunding;
    uint public pairId;
    mapping(uint256 => CtrtPair) public idToCtrtPair;//ID to contract pair

    struct CtrtPair {
        address addrCrowdFundingCtrt;
        address addrControllerCtrt;
        address addrTokenCtrt;
        address addrIncomeManagementCtrt;
    }

    function addNewCtrtPair(
        address _addrCrowdFundingCtrt, address _addrControllerCtrt,
        address _addrTokenCtrt, address _addrIncomeManagementCtrt)
        external onlyAdmin {
        pairId = pairId.add(1);
        idToCtrtPair[pairId] = CtrtPair(_addrCrowdFundingCtrt, _addrControllerCtrt, _addrTokenCtrt, _addrIncomeManagementCtrt);
    }
/*
    function generateToken(uint pairId, string calldata _uri) external onlyAdmin {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        erc721SPLC.mintSerialNFT(_uri);
    }
    // function setNewSafeVault(uint pairId, address _newSafeVault) 
    // external onlyAdmin {
    //     erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
    //     erc721SPLC.setNewSafeVault(_newSafeVault);
    // }

    
    function balanceOf(uint pairId, address _owner) public returns (uint256) {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return erc721SPLC.balanceOf(_owner);
    }

    function ownerOf(uint pairId, uint256 _tokenId) public returns (address) {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return erc721SPLC.ownerOf(_tokenId);
    }
    function safeTransferFrom(
        uint pairId, address _from, address _to, uint256 _tokenId, bytes memory _data) public onlyAdmin{
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        erc721SPLC.safeTransferFrom(_from, _to, _tokenId, _data);
    }
    //safeTransferFrom(address _from, address _to, uint256 _tokenId) external;
    function safeTransferFrom(
        uint pairId, address _from, address _to, uint256 _tokenId) public onlyAdmin {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        erc721SPLC.safeTransferFrom(_from, _to, _tokenId);
    }
    //transferFrom(address _from, address _to, uint256 _tokenId) external;
    function transferFrom(
        uint pairId, address _from, address _to, uint256 _tokenId) public onlyAdmin {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        erc721SPLC.transferFrom(_from, _to, _tokenId);
    }
    


//approve(address _approved, uint256 _tokenId) external;
    function approve(
        uint pairId, address _approved, uint256 _tokenId) public onlyAdmin {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        erc721SPLC.approve(_approved, _tokenId);
    }

//setApprovalForAll(address _operator, bool _approved) external;
    function setApprovalForAll(
        uint pairId, address _operator, bool _approved) public onlyAdmin {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        erc721SPLC.setApprovalForAll(_operator, _approved);
    }
//getApproved(uint256 _tokenId) external view returns (address);
    function getApproved(
        uint pairId, uint256 _tokenId) 
        external returns (address) {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return erc721SPLC.getApproved(_tokenId);
    }
//isApprovedForAll(address _owner, address _operator) external view returns (bool);
    function isApprovedForAll(
        uint pairId, address _owner, address _operator) 
        external returns (bool) {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return erc721SPLC.isApprovedForAll(_owner, _operator);
    }
*/

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

    // function transferOwnership(uint pairId, uint managementIdx, address addrNew) public {
    //     erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
    //     erc721SPLC.setManagement(managementIdx, addrNew);
    // }
/*
    function name(uint pairId) public returns (string memory) {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return erc721SPLC.name();
    }
    function symbol(uint pairId) public returns (string memory) {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return erc721SPLC.symbol();
    }
    function tokenURI(uint pairId, uint256 _tokenId) public returns (string memory) {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return erc721SPLC.tokenURI(_tokenId);
    }
    function totalSupply(uint pairId) public returns (uint) {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return erc721SPLC.totalSupply();
    }
    function tokenOfOwnerByIndex(uint pairId, address _owner, uint256 _index) public returns (uint) {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return erc721SPLC.tokenOfOwnerByIndex(_owner,_index);
    }


// get_ownerToIds(address _owner) external view returns (uint[]) {
    function get_ownerToIds(uint pairId, address _owner) public returns(uint[] memory) {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return erc721SPLC.get_ownerToIds(_owner);
    }

// getNFT(uint _id) external view returns (string, string, string, string, uint) {
    function getNFT(uint pairId, uint _tokenId) public returns (string memory, string memory, 
    string memory, string memory, uint){
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return erc721SPLC.getNFT(_tokenId);
    }
    
    function getCtrtDetails(uint pairId) public returns (
        bool, uint, uint, uint,
        uint, uint, string memory, 
        uint, string memory, bool, address,
        uint, uint) {
        erc721SPLC = ERC721SPLC(address(uint160(idToCtrtPair[pairId].tokenCtrt)));
        return erc721SPLC.getCtrtDetails();
    }

    
    function Invest(uint _tokencount) public checkAmount(_tokencount);

    function ProjectState() external view returns(string memory _return);
    function Progress() external view returns(uint);
    */
    /*
    function Invest(uint pairId, uint _tokencount) public {
        crowdFunding = CrowdFunding(idToCtrtPair[pairId].crowdFundingCtrt);
        return crowdFunding.Invest(_tokencount);
    }
    function ProjectState(uint pairId) public returns(string  memory _return){
        crowdFunding = CrowdFunding(idToCtrtPair[pairId].crowdFundingCtrt);
        return crowdFunding.ProjectState();
    }

    function Progress(uint pairId) public returns(uint){
        crowdFunding = CrowdFunding(idToCtrtPair[pairId].crowdFundingCtrt);
        return crowdFunding.Progress();
    }
    */

}