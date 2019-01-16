pragma solidity ^0.5.2;
/* => Unix timestamp problem so 'now' cannot be used to get correct time in 2038!!! => use 3rd party to freeze token transfer

ONLY use external account to deploy this contract
https://github.com/0xcert/ethereum-erc721
A contract that implements ERC721Metadata or ERC721Enumerable SHALL also implement ERC721. ERC-721 implements the requirements of interface ERC-165.

https://github.com/0xcert/ethereum-erc721/tree/master/contracts/tokens
*/

/**
$ Caller SHALL NOT assume that ID numbers have any specific pattern to them, and MUST treat the ID as a "black box".
Also note that a NFTs MAY become invalid (be destroyed). 

$ Transfers may be initiated by:
The owner of an NFT, The approved address of an NFT, An authorized operator of an NFT
Additionally, an authorized operator may set the approved address for an NFT.

# Disallow transfers if the contract is paused — prior art, CryptoKitties deployed contract, line 611
# Blacklist certain address from receiving NFTs — prior art, CryptoKitties deployed contract, lines 565, 566
# Disallow unsafe transfers — transferFrom throws unless _to equals msg.sender or countOf(_to) is non-zero or was non-zero previously (because such cases are safe)

# Charge a fee to both parties of a transaction — require payment when 
calling approve with a non-zero _approved if it was previously the zero address, refund payment if calling approve with the zero address 
if it was previously a non-zero address, require payment when calling any transfer function, require transfer parameter _to to equal msg.sender, 
require transfer parameter _to to be the approved address for the NFT

# Read only NFT registry — always throw from unsafeTransfer, transferFrom, approve and setApprovalForAll

$ only allow two-step ERC-20 style transaction, require that transfer functions never throw, require all functions to return a boolean indicating the success of the operation.

$ The URI MAY be mutable (i.e. it changes from time to time).

*/

contract Ownable {
    address public owner;
    address public ownerNew;
    address public chairman;
    address public director;
    address public manager;
    address public admin;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    constructor() public {
        owner = msg.sender;
        chairman = msg.sender;
        director = msg.sender;
        manager = msg.sender;
        admin = msg.sender;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can call this function");
        _;
    }
    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin can call this function");
        _;
    }
    function addNewOwner(address _newOwner) external onlyOwner {
        ownerNew = _newOwner;
    }
    function transferOwnership() external {
        require(ownerNew == msg.sender, "only new owner can call this function");
        emit OwnershipTransferred(owner, ownerNew);
        owner = ownerNew;
    }
    function setNewChairman(address _newChairman) external onlyOwner {
        chairman = _newChairman;
    }
    function setNewDirector(address _newDirector) external {
        require(msg.sender == chairman, "only chairman can call this function");
        director = _newDirector;
    }
    function setNewManager(address _newMgr) external {
        require(msg.sender == director, "only director can call this function");
        manager = _newMgr;
    }
    function setNewAdmin(address _newAdmin) external {
        require(msg.sender == manager, "only manager can call this function");
        admin = _newAdmin;
    }
}

//https://github.com/0xcert/ethereum-erc721/blob/master/contracts/tokens/ERC721.sol
interface ERC721 {
  /** $dev Emits when ownership of any NFT changes by any mechanism. This event emits 
  when NFTs are created (`from` == 0) and destroyed (`to` == 0). Exception: during contract 
  creation, any number of NFTs may be created and assigned without emitting Transfer. 
  At the time of any transfer, the approved address for that NFT (if any) is reset to none.   */
  event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);

  /** $dev This emits when the approved address for an NFT is changed or reaffirmed. The zero
   * address indicates there is no approved address. When a Transfer event emits, this also
   * indicates that the approved address for that NFT (if any) is reset to none.   */
  event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);

  /** $dev This emits when an operator is enabled or disabled for an owner. 
  The operator can manage all NFTs of the owner.   */
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

  /** $dev Returns the number of NFTs owned by `_owner`. NFTs assigned to the zero address are
   * considered invalid, and this function throws for queries about the zero address.
   * $param _owner Address for whom to query the balance.   */
  function balanceOf(address _owner) external view returns (uint256);

  /** $dev Returns the address of the owner of the NFT. NFTs assigned to zero address are considered
   * invalid, and queries about them do throw.
   * $param _tokenId The identifier for an NFT.  */
  function ownerOf(uint256 _tokenId) external view returns (address);

  /** $dev Transfers the ownership of an NFT from one address to another address.
   * $notice Throws unless `msg.sender` is the current owner, an authorized operator, or the
   * approved address for this NFT. Throws if `_from` is not the current owner. Throws if `_to` is the zero address. Throws if `_tokenId` is not a valid NFT. When transfer is complete, this function checks if `_to` is a smart contract (code size > 0). If so, it calls `onERC721Received` on `_to` and throws if the return value is not `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`.
   * $param _from The current owner of the NFT.
   * $param _to The new owner.
   * $param _tokenId The NFT to transfer.
   * $param _data Additional data with no specified format, sent in call to `_to`.   */
  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data) external;

  /** $dev Transfers the ownership of an NFT from one address to another address.
   * $notice This works identically to the other function with an extra data parameter, except this
   * function just sets data to ""
   * $param _from The current owner of the NFT.
   * $param _to The new owner.
   * $param _tokenId The NFT to transfer.   */
  function safeTransferFrom(address _from, address _to, uint256 _tokenId) external;

  /** $dev Throws unless `msg.sender` is the current owner, an authorized operator, or the approved address for this NFT. Throws if `_from` is not the current owner. Throws if `_to` is the zero; * address. Throws if `_tokenId` is not a valid NFT.
   * $notice The caller is responsible to confirm that `_to` is capable of receiving NFTs or else
   * they mayb be permanently lost.
   * $param _from The current owner of the NFT.
   * $param _to The new owner.
   * $param _tokenId The NFT to transfer.   */
  function transferFrom(address _from, address _to, uint256 _tokenId) external;

  /** $dev Set or reaffirm the approved address for an NFT.
   * $notice The zero address indicates there is no approved address. Throws unless `msg.sender` is
   * the current NFT owner, or an authorized operator of the current owner.
   * $param _approved The new approved NFT controller.
   * $param _tokenId The NFT to approve.   */
  function approve(address _approved, uint256 _tokenId) external;

  /** $dev Enables or disables approval for a third party ("operator") to manage all of
   * `msg.sender`'s assets. It also emits the ApprovalForAll event.
   * $notice The contract MUST allow multiple operators per owner.
   * $param _operator Address to add to the set of authorized operators.
   * $param _approved True if the operators is approved, false to revoke approval.   */
  function setApprovalForAll(address _operator, bool _approved) external;

  /** $dev Get the approved address for a single NFT.
   * $notice Throws if `_tokenId` is not a valid NFT.
   * $param _tokenId The NFT to find the approved address for.   */
  function getApproved(uint256 _tokenId) external view returns (address);

  /** $dev Returns true if `_operator` is an approved operator for `_owner`, false otherwise.
   * $param _owner The address that owns the NFTs.
   * $param _operator The address that acts on behalf of the owner.   */
  function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}

/*A wallet/broker/auction application MUST implement the wallet interface if it will 
accept safe transfers. $dev Note: the ERC-165 identifier for this interface is 0x150b7a02.
*/
interface ERC721TokenReceiver {
    /* $notice Handle the receipt of an NFT
     $dev The ERC721 smart contract calls this function on the recipient
      after a `transfer`. This function MAY throw to revert and reject the
      transfer. Return of other than the magic value MUST result in the
      transaction being reverted.
      Note: the contract address is always the message sender.
     $param _operator The address which called `safeTransferFrom` function
     $param _from The address which previously owned the token
     $param _tokenId The NFT identifier which is being transferred
     $param _data Additional data with no specified format
     $return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
      unless throwing*/
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes _data) external returns(bytes4);
}

//supportsInterface[0x01ffc9a7] will be true, must not set element 0xffffffff to true!!!!!
interface ERC165 {
  /** $dev Checks if the smart contract includes a specific interface.
   * $notice This function uses less than 30,000 gas.
   * $param _interfaceID The interface identifier, as specified in ERC-165.
   * $return `true` if the contract implements `interfaceID` and
   *  `interfaceID` is not 0xffffffff, `false` otherwise 
   * $notice You must not set element 0xffffffff to true!!!!!  */
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

/*==================
https://github.com/0xcert/ethereum-erc721/blob/master/contracts/tokens/ERC721Metadata.sol
 */
interface ERC721Metadata {
    function name() external view returns (string _name);//get token name of the contract
    function symbol() external view returns (string _symbol);// get symbol of the contract
    function tokenURI(uint256 _tokenId) external view returns (string);// get token URI of certain tokenId
}

//https://github.com/0xcert/ethereum-erc721/blob/master/contracts/tokens/ERC721Enumerable.sol
interface ERC721Enumerable {
  /** 
   * @dev Returns a count of valid NFTs tracked by this contract, where each one of them has an
   * assigned and queryable owner not equal to the zero address. */
  function totalSupply() external view returns (uint256);

  /**
   * @dev Returns the token identifier for the `_index`th NFT. Sort order is not specified.
   * @param _index A counter less than `totalSupply()`. */
  function tokenByIndex(uint256 _index) external view returns (uint256);

  /**
   * @dev Returns the token identifier for the `_index`th NFT assigned to `_owner`. Sort order is
   * not specified. It throws if `_index` >= `balanceOf(_owner)` or if `_owner` is the zero address,
   * representing invalid NFTs.
   * @param _owner An address where we are interested in NFTs owned by them.
   * @param _index A counter less than `balanceOf(_owner)`.*/
  function tokenOfOwnerByIndex(address _owner, uint256 _index) external view
    returns (uint256);
}
//=> Add our own get_ownerToIds()
//==================
contract NFTokenSPLC is Ownable, ERC721, SupportsInterface, ERC721Metadata, ERC721Enumerable {
    using SafeMath for uint256;
    using AddressUtils for address;

    mapping(uint256 => address) internal idToOwner;//NFT ID to owner
    mapping(uint256 => address) internal idToApprovals;//NFT ID to approved address
    mapping(address => uint256) internal ownerToNFTokenCount;//owner address to count of his tokens
    mapping(address => mapping (address => bool)) internal ownerToOperators;
    /** $dev Magic value of a smart contract that can recieve NFT.
    * Equal to: keccak256("onERC721Received(address,uint256,bytes)").   */
    bytes4 constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;
    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`

    //ERC721Enumerable
    //uint256[] internal tokens;//Array of all NFT IDs.
    //mapping(uint256 => uint256) internal idToIndex;
    //ID to index in global tokens array; index 0 is reserved for no such token id
    mapping(uint256 => uint256) internal idToOwnerIndexPlus1;
    //ID to index in owner tokens list; 0 is reserved for not in list!
    mapping(address => uint256[]) internal ownerToIds;//owner to list of owned NFT IDs.

    //==================New code starting from here
    //bool public SPLC_Termination_Time;
    //uint public 1yPeriod = 31536000;
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
        uint, uint, string, 
        uint, string, bool, address,
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

    function name() external view returns (string _name) {
        _name = nftName;
    }
    function symbol() external view returns (string _symbol) {
        _symbol = nftSymbol;
    }
    function tokenURI(uint256 _tokenId) external validNFToken(_tokenId) view returns (string) {
        return idToAsset[_tokenId].uri;//idToUri[_tokenId];
    }
    /*function _setTokenUri(uint256 _tokenId, string _uri) internal validNFToken(_tokenId) onlyOwner {
        idToAsset[_tokenId].uri = _uri;//idToUri[_tokenId] = _uri;
    }*/
    //==================
    /*4566010 gas
    "NCCU site No.1(2018)", "NCCU1801", 300, 800, 17000, "NTD", 470, "01312038"
    Deployed in Rinkeby
    0x1DB86a2B9Ab01024333Bd335B6D67cc30d50324f
    */
    constructor(string _nftName, string _nftSymbol, uint _siteSizeInKW, uint _maxTotalSupply, 
        uint _initialAssetPricing, string _pricingCurrency,
        uint _IRR20yrx100, string _validDate) public {
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
    /*
    * 0x80ac58cd ===
    *   bytes4(keccak256('balanceOf(address)')) ^
    *   bytes4(keccak256('ownerOf(uint256)')) ^
    *   bytes4(keccak256('approve(address,uint256)')) ^
    *   bytes4(keccak256('getApproved(uint256)')) ^
    *   bytes4(keccak256('setApprovalForAll(address,bool)')) ^
    *   bytes4(keccak256('isApprovedForAll(address,address)')) ^
    *   bytes4(keccak256('transferFrom(address,address,uint256)')) ^
    *   bytes4(keccak256('safeTransferFrom(address,address,uint256)')) ^
    *   bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)'))
    */
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
    function getNFT(uint _id) external view returns (string, string, string, string, uint) {
        return (idToAsset[_id].name, idToAsset[_id].symbol,
        idToAsset[_id].currency, idToAsset[_id].uri, idToAsset[_id].pricing);
    }
    function get_ownerToIds(address _owner) external view returns (uint[]) {
        return ownerToIds[_owner];
    }
    function get_idToOwnerIndexPlus1(uint _tokenId) public view returns (uint){
        return idToOwnerIndexPlus1[_tokenId];
    }
    //-------------------==Enumerable
    function totalSupply() external view returns (uint256) {
        return totalSupplyValidToken;//edit
    }
    //no array so no token should be found by array index => returning the tokenId(token identifier)
    function tokenByIndex(uint256 _index) external view returns (uint256) {
        return 999999999999999999;
    }
    //-------------------==End of Enumerable interface

    event MintSerialNFT(uint tokenId, string nftName, string nftSymbol, string pricingCurrency, string uri, uint initialAssetPricing);
    function mintSerialNFT(string _uri) external onlyAdmin {
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

    function() public payable { revert("should not send any ether directly"); } //should not send any ether directly


    //====================Copied code
    /** $dev Emits when ownership of any NFT changes by any mechanism. This event emits 
    when NFTs are created (`from` == 0) and destroyed (`to` == 0). 
    Exception: during contract creation, any number of NFTs may be created and 
    assigned without emitting Transfer. At the time of any transfer, the approved address 
    for that NFT (if any) is reset to none. $param _from Sender of NFT 
    (if address is zero address it indicates token creation). $param _to Receiver of NFT 
    (if address is zero address it indicates token destruction).
    * $param _tokenId The NFT that got transfered.   */
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);

    /** $dev This emits when the approved address for an NFT is changed or reaffirmed. The zero
    * address indicates there is no approved address. When a Transfer event emits, this also
    * indicates that the approved address for that NFT (if any) is reset to none.
    * $param _owner Owner of NFT.
    * $param _approved Address that we are approving.
    * $param _tokenId NFT which we are approving.   */
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);

    /** $dev This emits when an operator is enabled or disabled for an owner. The operator can manage
    * all NFTs of the owner.
    * $param _owner Owner of NFT.
    * $param _operator Address to which we are setting operator rights.
    * $param _approved Status of operator rights(true if operator rights are given and false if
    * revoked).   */
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    /** $dev Guarantees that the msg.sender is 
    an owner or operator of the given NFT.
    * $param _tokenId ID of the NFT to validate.   */
    modifier canOperate(uint256 _tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(
            tokenOwner == msg.sender || ownerToOperators[tokenOwner][msg.sender],
            "tokenOwner should be either msg.sender or is an approved operator");
        _;
    }

    /** $dev Guarantees that the msg.sender is allowed to transfer NFT.
    * $param _tokenId ID of the NFT to transfer.   */
    modifier canTransfer(uint256 _tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(
            tokenOwner == msg.sender || getApproved(_tokenId) == msg.sender || ownerToOperators[tokenOwner][msg.sender], "msg.sender should be tokenOwner, an approved, or a token operator");
        _;
    }

    /** $dev Guarantees that _tokenId is a valid Token. Check if such tokenId exists
    * $param _tokenId ID of the NFT to validate.   */
    modifier validNFToken(uint256 _tokenId) {
        require(idToOwner[_tokenId] != address(0), "owner should not be 0x0");
        _;
    }

    /** $dev Returns the number of NFTs owned by `_owner`. NFTs assigned to the zero address are
    * considered invalid, and this function throws for queries about the zero address.
    * $param _owner Address for whom to query the balance.   */
    function balanceOf(address _owner) external view returns (uint256) {
        require(_owner != address(0), "_owner should not be 0x0");
        return ownerToNFTokenCount[_owner];
    }

    /** $dev Returns the address of the owner of the NFT. 
    NFTs assigned to zero address are considered
    * invalid, and queries about them do throw.
    * $param _tokenId The identifier for an NFT.   */
    function ownerOf(uint256 _tokenId) 
        external view returns (address _owner) {
        _owner = idToOwner[_tokenId];
        require(_owner != address(0), "_owner should not be 0x0");
    }

    /** $dev Transfers the ownership of an NFT from one address to another address.
    * $notice Throws unless `msg.sender` is the current owner, an authorized operator, or the    * approved address for this NFT. Throws if `_from` is not the current owner. Throws if `_to` is     * the zero address. Throws if `_tokenId` is not a valid NFT. When transfer is complete, this    * function checks if `_to` is a smart contract (code size > 0). If so, it calls `onERC721Received`
    * on `_to` and throws if the return value is not `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`.
    * $param _from The current owner of the NFT.
    * $param _to The new owner.
    * $param _tokenId The NFT to transfer.
    * $param _data Additional data with no specified format, sent in call to `_to`.   */
    function safeTransferFrom(
        address _from, address _to, uint256 _tokenId, bytes _data) 
        external checkTfStatus {
        _safeTransferFrom(_from, _to, _tokenId, _data);
    }

    /** $dev Transfers the ownership of an NFT from one address to another address.
    * $notice This works identically to the other function with an extra data parameter, except this
    * function just sets data to ""
    * $param _from The current owner of the NFT.
    * $param _to The new owner.
    * $param _tokenId The NFT to transfer.   */
    function safeTransferFrom(
        address _from, address _to, uint256 _tokenId) external 
        checkTfStatus {
        _safeTransferFrom(_from, _to, _tokenId, "");
    }

    /** $dev Throws unless `msg.sender` is the current owner, an authorized operator, or the approved
    * address for this NFT. Throws if `_from` is not the current owner. Throws if `_to` is the zero
    * address. Throws if `_tokenId` is not a valid NFT.
    * $notice The caller is responsible to confirm that `_to` is capable of receiving NFTs or else
    * they maybe be permanently lost.
    * $param _from The current owner of the NFT.
    * $param _to The new owner.
    * $param _tokenId The NFT to transfer.   */
    function transferFrom(
        address _from, address _to, uint256 _tokenId) external 
        checkTfStatus
        canTransfer(_tokenId) validNFToken(_tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(tokenOwner == _from, "tokenOwner should be equal to _from");
        require(_to != address(0), "_to should not be 0x0");
        _transfer(_to, _tokenId);
    }

    /** $dev Set or reaffirm the approved address for an NFT.
    * $notice The zero address indicates there is no approved address. 
    Throws unless `msg.sender` is
    * the current NFT owner, or an authorized operator of the current owner.
    * $param _approved Address to be approved for the given NFT ID.
    * $param _tokenId ID of the token to be approved.   */
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

    /** $dev Enables or disables approval for a third party ("operator") 
    to manage all of `msg.sender`'s assets. It also emits the ApprovalForAll event.
    * $notice This works even if sender doesn't own any tokens at the time.
    * $param _operator Address to add to the set of authorized operators.
    * $param _approved True if the operators is approved, false to revoke approval.   */
    function setApprovalForAll(address _operator, bool _approved) 
        external {
        require(_operator != address(0), "_operator should not be 0x0");
        ownerToOperators[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    /** $dev Get the approved address for a single NFT.
    * $notice Throws if `_tokenId` is not a valid NFT.
    * $param _tokenId ID of the NFT to query the approval of.   */
    function getApproved(uint256 _tokenId) public view
        validNFToken(_tokenId) returns (address) {
        return idToApprovals[_tokenId];
    }

    /** $dev Checks if `_operator` is an approved operator for `_owner`.
    * $param _owner The address that owns the NFTs.
    * $param _operator The address that acts on behalf of the owner.   */
    function isApprovedForAll(address _owner, address _operator) 
        external view returns (bool) {
        require(_owner != address(0), "_owner should not be 0x0");
        require(_operator != address(0), "_operator should not be 0x0");
        return ownerToOperators[_owner][_operator];
    }

    /** $dev Actually perform the safeTransferFrom.
    * $param _from The current owner of the NFT.
    * $param _to The new owner.
    * $param _tokenId The NFT to transfer.
    * $param _data Additional data with no specified format, sent in call to `_to`.   */
    function _safeTransferFrom(
        address _from, address _to, uint256 _tokenId, bytes _data)
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

    /** $dev Actually preforms the transfer.
    * $notice Does NO checks.
    * $param _to Address of a new owner.
    * $param _tokenId The NFT that is being transferred.   */
    function _transfer(address _to, uint256 _tokenId) private {
        address from = idToOwner[_tokenId];
        clearApproval(_tokenId);
        removeNFToken(from, _tokenId, 1);
        addNFToken(_to, _tokenId);

        emit Transfer(from, _to, _tokenId);
    }

    /** $dev Mints a new NFT.
    * $notice This is a private function which should be called from user_implemented external     * mint function. Its purpose is to show and properly initialize data structures when using this * implementation.
    * $param _to The address that will own the minted NFT.
    * $param _tokenId of the NFT to be minted by the msg.sender.   */
    function _mint(address _to, uint256 _tokenId) internal {
        require(_to != address(0), "_to should not be 0x0");
        require(_tokenId != 0, "_tokenId should not be 0");
        require(idToOwner[_tokenId] == address(0), "owner of this id should be 0x0");

        addNFToken(_to, _tokenId);

        emit Transfer(address(0), _to, _tokenId);
    }

    /** $dev Burns a NFT.
    * $notice This is a private function which should be called from user_implemented external; 
    burn function. Its purpose is to show and properly initialize data structures when using this implementation.
    * $param _owner Address of the NFT owner.
    * $param _tokenId ID of the NFT to be burned.   */
    function _burn(address _owner, uint256 _tokenId) 
        internal validNFToken(_tokenId) {
        clearApproval(_tokenId);
        removeNFToken(_owner, _tokenId, 9);
        emit Transfer(_owner, address(0), _tokenId);
        // if (bytes(idToUri[_tokenId]).length != address(0)) {
        //     delete idToUri[_tokenId];
        // }
    }

    /** $dev Clears the current approval of a given NFT ID.
    * $param _tokenId ID of the NFT to be transferred.   */
    function clearApproval(uint256 _tokenId) private {
        if(idToApprovals[_tokenId] != address(0)) {
            delete idToApprovals[_tokenId];
        }
    }

    /** $dev Removes a NFT from owner.
    * $notice Use and override this function with caution. Wrong usage can have serious consequences.
    * $param _from Address from wich we want to remove the NFT.
    * $param _tokenId Which NFT we want to remove.  */
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

    /** $dev Assignes a new NFT to owner.
    * $notice Use and override this function with caution. Wrong usage can have serious consequences.
    * $param _to Address to wich we want to add the NFT.
    * $param _tokenId Which NFT we want to add.   */
    function addNFToken(address _to, uint256 _tokenId) internal {
        require(idToOwner[_tokenId] == address(0), "owner of such tokenId should be 0x0");
        idToOwner[_tokenId] = _to;
        ownerToNFTokenCount[_to] = ownerToNFTokenCount[_to].add(1);

        //-----------==Enumerable
        uint256 length = ownerToIds[_to].push(_tokenId);
        idToOwnerIndexPlus1[_tokenId] = length;//.sub(1);// - 1;
    }

    //-------------------==Enumerable
    /** $dev returns the n-th NFT ID from a list of owner's tokens.
    * $param _owner Token owner's address.
    * $param _index Index number representing n-th token in owner's list of tokens.*/
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
        /* XXX Currently there is no better way to check if there is a contract in an address than to
        * check the size of the code at that address.
        * See https://ethereum.stackexchange.com/a/14016/36603 for more details about how this works.
        * TODO: Check this again before the Serenity release, because all addresses will be
        * contracts then.*/
        assembly { size := extcodesize(_addr) } // solium-disable-line security/no-inline-assembly
        return size > 0;
    }
}
/**
https://github.com/0xcert/ethereum-erc721/blob/master/LICENSE
0xcert/ethereum-erc721 is licensed under the MIT License
A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.
Permissions

yes for Commercial use, Modification, Distribution, Private use
no for Limitations including Liability, Warranty
=================
The MIT License

Copyright (c) 2017-2018 0xcert, d.o.o. https://0xcert.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

 */