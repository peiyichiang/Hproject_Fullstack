import "./Ownable.sol";

//https://github.com/0xcert/ethereum-erc721/blob/master/contracts/tokens/ERC721.sol

interface ERC721TokenReceiver {
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external returns(bytes4);
}

//supportsInterface[0x01ffc9a7] will be true, must not set element 0xffffffff to true!!!!!
interface ERC165 {
  function supportsInterface(bytes4 _interfaceID) external view returns (bool);
}
contract SupportsInterface is ERC165 {
    mapping(bytes4 => bool) internal supportedInterfaces;
    constructor() public {
        supportedInterfaces[0x01ffc9a7] = true; // ERC165, must not set element 0xffffffff to true!!!!!
    }
    function supportsInterface(bytes4 _interfaceID) external view returns (bool) {
        return supportedInterfaces[_interfaceID];
    }
}


//=> Add our own get_ownerToIds()
//==================
contract NFTokenSPLC is Ownable, SupportsInterface {
    using SafeMath for uint256;
    using AddressUtils for address;

    mapping(uint256 => address) internal idToOwner;//NFT ID to owner
    mapping(uint256 => address) internal idToApprovals;//NFT ID to approved address
    mapping(address => uint256) internal ownerToNFTokenCount;//owner address to count of his tokens
    //approve
    mapping(address => mapping (address => bool)) internal ownerToOperators;

    bytes4 constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;
    mapping(uint256 => uint256) internal idToOwnerIndexPlus1;
    //ID to index in owner tokens list; 0 is reserved for not in list!
    mapping(address => uint256[]) internal ownerToIds;//owner to list of owned NFT IDs.

    bool public tokenStatus = true;
    mapping(uint256 => Asset) internal idToAsset;//NFT ID to token assets
    struct Asset {
        string name;// NCCU site No.1(2018)
        string symbol;//NCCU1801... 4 characters + yy for year + ss serial number
        string currency;// NTD or USD or ...
        string uri;//token specific information
        uint pricing;// pricing in the "currency" type above
    }

    uint public nextTokenId = 1;//next token id, NOT from 0!!!
    uint public siteSizeInKW;// 300kw
    uint public maxTotalSupply;// total allowed tokens for this contract. 790 Assets
    uint public totalSupplyValidToken;//total generated tokens - destroyed tokens
    uint public initialAssetPricing;// 17000
    string public pricingCurrency;// for the initialAssetPricing: NTD or USD
    uint public IRR20yrx100;// 470 represents 4.7; // IRR 20 years rental x100 (per year 年);
    string public ValidDate;// 01312038 ... mmddyyyy, last day for the contract to be valid
    bool public isPreDelivery = true;// IsPreDelivery indicates if it is before token delivery time(launch).
    //If true, we can change those variables before the token launch time: SafeVault, LockUpPeriod, tokenMintTime
    address public SafeVault;//the default address for sending all newly minted tokens to.
    address public SafeVaultNew;

    uint256 public tokenMintTime = 1;// the time when the token is minted
    uint public LockUpPeriod = 5 minutes;// 5 minutes, only used once after ICO
    //bool public isAfterLockup;

    function getCtrtDetails() public view returns (
        bool, uint, uint, uint,
        uint, uint, string memory, 
        uint, string memory, bool, address,
        uint, uint){
        return (
            tokenStatus, nextTokenId, siteSizeInKW, maxTotalSupply,
        totalSupplyValidToken, initialAssetPricing, pricingCurrency,
        IRR20yrx100, ValidDate, isPreDelivery, SafeVault, 
        tokenMintTime, LockUpPeriod);
    }

    //==================Metadata
    string internal nftName;//descriptive name for a collection of NFTs
    string internal nftSymbol;//abbreviated name for NFTokens
    //mapping (uint256 => string) internal idToUri;//NFT ID to metadata uri

    function name() external view returns (string memory _name) {
        _name = nftName;
    }
    function symbol() external view returns (string memory _symbol) {
        _symbol = nftSymbol;
    }
    function tokenURI(uint256 _tokenId) external validNFToken(_tokenId) view returns (string memory) {
        return idToAsset[_tokenId].uri;//idToUri[_tokenId];
    }
    constructor(string memory _nftName, string memory _nftSymbol, uint _siteSizeInKW, uint _maxTotalSupply, 
        uint _initialAssetPricing, string memory _pricingCurrency,
        uint _IRR20yrx100, string memory _validDate) public {
        nftName = _nftName;
        nftSymbol = _nftSymbol;
        siteSizeInKW = _siteSizeInKW;
        maxTotalSupply = _maxTotalSupply;
        initialAssetPricing = _initialAssetPricing;
        pricingCurrency = _pricingCurrency;
        IRR20yrx100 = _IRR20yrx100;
        ValidDate = _validDate;
        SafeVault = owner;
        supportedInterfaces[0x80ac58cd] = true;// ERC721
        supportedInterfaces[0x5b5e139f] = true;// ERC721Metadata
        supportedInterfaces[0x780e9d63] = true;// ERC721Enumerable
    }
    modifier checkTfStatus() {
        //will block all token tranfers either before the lockup time, 
        //or until a time when SPLC's power plant contract is finished
        require(now >= tokenMintTime.add(LockUpPeriod), "still in the lockup period");
        require(tokenStatus,"token status is false: locked up");
        _;
    }
    function get_now() public view returns (uint){
        return now;//check current time. Useful for 2038 unix time overflow
    }
    function get_lockupUntil() public view returns (uint){
        return tokenMintTime.add(LockUpPeriod);
    }
    function getNFT(uint _id) external view returns (string memory, string memory, string memory, string memory, uint) {
        return (idToAsset[_id].name, idToAsset[_id].symbol,
        idToAsset[_id].currency, idToAsset[_id].uri, idToAsset[_id].pricing);
    }
    function get_ownerToIds(address _owner) external view returns (uint[] memory) {
        return ownerToIds[_owner];
    }
    function get_idToOwnerIndexPlus1(uint _tokenId) public view returns (uint){
        return idToOwnerIndexPlus1[_tokenId];
    }
    //-------------------==Enumerable
    function totalSupply() external view returns (uint256) {
        return totalSupplyValidToken;//edit
    }

    //-------------------==End of Enumerable interface

    event MintSerialNFT(uint tokenId, string nftName, string nftSymbol, string pricingCurrency, string uri, uint initialAssetPricing);
    function mintSerialNFT(string calldata _uri) external onlyAdmin {
        require(nextTokenId <= maxTotalSupply, "max allowed token amount has been reached");
        //nextTokenId -1 +1 <= maxTotalSupply
        idToAsset[nextTokenId] = Asset(nftName, nftSymbol, pricingCurrency, _uri, initialAssetPricing);

        //uint256 length = tokens.push(_tokenId);//Enumerable
        //idToIndex[nextTokenId] = length;//.sub(1);//Enumerable, starting form 1

        _mint(SafeVault, nextTokenId);
        //_setTokenUri(nextTokenId, _uri);
        emit MintSerialNFT(nextTokenId, nftName, nftSymbol, pricingCurrency, _uri, initialAssetPricing);
        totalSupplyValidToken = totalSupplyValidToken.add(1);
        nextTokenId = nextTokenId.add(1);
    }
    event BurnNFT(address _owner, uint _tokenId, address msgsender);
    function burnNFT(address _owner, uint256 _tokenId) external onlyAdmin {
        delete idToAsset[_tokenId];
        _burn(_owner, _tokenId);
        totalSupplyValidToken = totalSupplyValidToken.sub(1);
        emit BurnNFT(_owner, _tokenId, msg.sender);
    }

    event SetNewSafeVault(address _SafeVault, address _SafeVaultNew);
    function setNewSafeVault(address _newSafeVault) external onlyAdmin {
        SafeVaultNew = _newSafeVault;
    }
    function setNewSafeVault() external {
        require(isPreDelivery, "still in pre_delivery");
        require(SafeVaultNew == msg.sender, "only SafeVaultNew can call this function");
        emit SetNewSafeVault(SafeVault, SafeVaultNew);
        SafeVault = SafeVaultNew;
    }
    function disablePreDelivery() external onlyAdmin {
        isPreDelivery = false;
    }
    function setLockUpPeriod(
        uint _LockUpPeriod_inMins, uint _LockUpPeriod_inWeeks) 
        external onlyAdmin {
        require(isPreDelivery, "still in pre_delivery");
        LockUpPeriod = (_LockUpPeriod_inMins * 1 minutes).add(_LockUpPeriod_inWeeks * 1 weeks);
    }
    function setTokenMintTime(uint _tokenMintTime) external onlyAdmin {
        require(isPreDelivery, "still in pre_delivery");
        tokenMintTime = _tokenMintTime;
    }
    function setTokenStatus(bool _tokenStatus) external onlyAdmin {
        tokenStatus = _tokenStatus;
    }
    
    function() external payable { revert("should not send any ether directly"); } //should not send any ether directly


    //====================Copied code
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    modifier canOperate(uint256 _tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(
            tokenOwner == msg.sender || ownerToOperators[tokenOwner][msg.sender],
            "tokenOwner should be either msg.sender or is an approved operator");
        _;
    }

    modifier canTransfer(uint256 _tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(
            tokenOwner == msg.sender || getApproved(_tokenId) == msg.sender || ownerToOperators[tokenOwner][msg.sender], "msg.sender should be tokenOwner, an approved, or a token operator");
        _;
    }

    modifier validNFToken(uint256 _tokenId) {
        require(idToOwner[_tokenId] != address(0), "owner should not be 0x0");
        _;
    }

    function balanceOf(address _owner) external view returns (uint256) {
        require(_owner != address(0), "_owner should not be 0x0");
        return ownerToNFTokenCount[_owner];
    }

    function ownerOf(uint256 _tokenId) 
        external view returns (address _owner) {
        _owner = idToOwner[_tokenId];
        require(_owner != address(0), "_owner should not be 0x0");
    }

    function safeTransferFrom(
        address _from, address _to, uint256 _tokenId, bytes calldata _data) 
        external checkTfStatus {
        _safeTransferFrom(_from, _to, _tokenId, _data);
    }

    function safeTransferFrom(
        address _from, address _to, uint256 _tokenId) external 
        checkTfStatus {
        _safeTransferFrom(_from, _to, _tokenId, "");
    }

    function transferFrom(
        address _from, address _to, uint256 _tokenId) external 
        checkTfStatus
        canTransfer(_tokenId) validNFToken(_tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(tokenOwner == _from, "tokenOwner should be equal to _from");
        require(_to != address(0), "_to should not be 0x0");
        _transfer(_to, _tokenId);
    }

    function approve(address _approved, uint256 _tokenId) external
        canOperate(_tokenId) validNFToken(_tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(_approved != tokenOwner, "_approved should not be tokenOwner");
        // require(
        //     !(getApproved(_tokenId) == address(0) && _approved == address(0)), 
        //     "approved address and _approved should not be 0x0");

        idToApprovals[_tokenId] = _approved;
        emit Approval(tokenOwner, _approved, _tokenId);
    }

    function setApprovalForAll(address _operator, bool _approved) 
        external {
        require(_operator != address(0), "_operator should not be 0x0");
        ownerToOperators[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    function getApproved(uint256 _tokenId) public view
        validNFToken(_tokenId) returns (address) {
        return idToApprovals[_tokenId];
    }

    function isApprovedForAll(address _owner, address _operator) 
        external view returns (bool) {
        require(_owner != address(0), "_owner should not be 0x0");
        require(_operator != address(0), "_operator should not be 0x0");
        return ownerToOperators[_owner][_operator];
    }

    function _safeTransferFrom(
        address _from, address _to, uint256 _tokenId, bytes memory _data)
        internal canTransfer(_tokenId) validNFToken(_tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(tokenOwner == _from, "tokenOwner should be _from");
        require(_to != address(0), "_to should not be 0x0");

        _transfer(_to, _tokenId);

        if (_to.isContract()) {
            bytes4 retval = ERC721TokenReceiver(_to).onERC721Received(
                msg.sender, _from, _tokenId, _data);
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        }
    }

    function _transfer(address _to, uint256 _tokenId) private {
        address from = idToOwner[_tokenId];
        clearApproval(_tokenId);
        removeNFToken(from, _tokenId, 1);
        addNFToken(_to, _tokenId);

        emit Transfer(from, _to, _tokenId);
    }

    function _mint(address _to, uint256 _tokenId) internal {
        require(_to != address(0), "_to should not be 0x0");
        require(_tokenId != 0, "_tokenId should not be 0");
        require(idToOwner[_tokenId] == address(0), "owner of this id should be 0x0");

        addNFToken(_to, _tokenId);

        emit Transfer(address(0), _to, _tokenId);
    }

    function _burn(address _owner, uint256 _tokenId) 
        internal validNFToken(_tokenId) {
        clearApproval(_tokenId);
        removeNFToken(_owner, _tokenId, 9);
        emit Transfer(_owner, address(0), _tokenId);
        // if (bytes(idToUri[_tokenId]).length != address(0)) {
        //     delete idToUri[_tokenId];
        // }
    }

    function clearApproval(uint256 _tokenId) private {
        if(idToApprovals[_tokenId] != address(0)) {
            delete idToApprovals[_tokenId];
        }
    }

    function removeNFToken(
        address _from, uint256 _tokenId, uint256 mode) internal {
        if (mode == 1) {//transfer
            require(idToOwner[_tokenId] == _from, "tokenId should match _from");
        } else if (mode == 9) {//burn
            require(msg.sender == admin, "only admin can call this function");
            //only contract owner can destroy the token
        }
        require(ownerToNFTokenCount[_from] > 0, "ownerToNFTokenCount[_from] should be > 0");
        ownerToNFTokenCount[_from] = ownerToNFTokenCount[_from].sub(1);
        delete idToOwner[_tokenId];

        //-------------==Enumerable
        require(ownerToIds[_from].length > 0, "ownerToIds[_from].length should be > 0");

        uint256 tokenToRemoveIndex = idToOwnerIndexPlus1[_tokenId] - 1;
        uint256 lastIdIndex = ownerToIds[_from].length.sub(1);
        uint256 lastId = ownerToIds[_from][lastIdIndex];

        ownerToIds[_from][tokenToRemoveIndex] = lastId;
        //ownerToIds[_from][lastIdIndex] = 0;

        ownerToIds[_from].length = ownerToIds[_from].length.sub(1);
        // Consider adding a conditional check for the last token in order to save GAS.
        idToOwnerIndexPlus1[lastId] = tokenToRemoveIndex + 1;
        idToOwnerIndexPlus1[_tokenId] = 0;// index 0 is reserved for no such token id
    }

    function addNFToken(address _to, uint256 _tokenId) internal {
        require(idToOwner[_tokenId] == address(0), "owner of such tokenId should be 0x0");
        idToOwner[_tokenId] = _to;
        ownerToNFTokenCount[_to] = ownerToNFTokenCount[_to].add(1);

        //-----------==Enumerable
        uint256 length = ownerToIds[_to].push(_tokenId);
        idToOwnerIndexPlus1[_tokenId] = length;//.sub(1);// - 1;
    }

    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256) {
        require(_index < ownerToIds[_owner].length, "_index should be < ownerToIds[_owner].length");
        return ownerToIds[_owner][_index];
    }

}


//==================
/*https://github.com/0xcert/ethereum-erc721/blob/master/contracts/tokens/NFTokenMetadata.sol
contract SPLC is NFToken, ERC721Metadata {
}*/

library SafeMath {
    function mul(uint256 _a, uint256 _b) internal pure returns (uint256) {
        if (_a == 0) {
            return 0;
        }
        uint256 c = _a * _b;
        require(c / _a == _b, "safeMath mul failed");
        return c;
    }
    function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
        uint256 c = _a / _b;
        // require(b > 0); // Solidity automatically throws when dividing by 0
        // require(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }
    function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
        require(_b <= _a, "safeMath sub failed");
        return _a - _b;
    }
    function add(uint256 _a, uint256 _b) internal pure returns (uint256) {
        uint256 c = _a + _b;
        require(c >= _a, "safeMath add failed");
        return c;
    }
}


library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) } // solium-disable-line security/no-inline-assembly
        return size > 0;
    }
}