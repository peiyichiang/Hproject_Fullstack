pragma solidity ^0.5.4;
/* => Unix timestamp problem so 'now' cannot be used to get correct time in 2038!!! => use 3rd party to freeze token transfer

Add ITF to distingush interface json from compiled contracts json

ONLY use external account to deploy this contract
https://github.com/0xcert/ethereum-erc721
A contract that implements ERC721Metadata or ERC721Enumerable SHALL also implement ERC721. ERC-721 implements the requirements of interface ERC-165.

https://github.com/0xcert/ethereum-erc721/tree/master/contracts/tokens
*/

import "./SafeMath.sol";

//https://github.com/0xcert/ethereum-erc721/blob/master/contracts/tokens/ERC721.sol
interface ERC721ITF {
  event Transfer(address indexed _from, address indexed _to, uint256 indexed tokenId);

  event Approval(address indexed _owner, address indexed _approved, uint256 indexed tokenId);

  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

  function balanceOf(address _owner) external view returns (uint256);

  function ownerOf(uint256 tokenId) external view returns (address);

  function safeTransferFrom(address _from, address _to, uint256 tokenId, bytes calldata _data) external;

  function safeTransferFrom(address _from, address _to, uint256 tokenId) external;

  function transferFrom(address _from, address _to, uint256 tokenId) external;

  function approve(address _approved, uint256 tokenId) external;

  function setApprovalForAll(address _operator, bool _approved) external;

  function getApproved(uint256 tokenId) external view returns (address);

  function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}

/*A wallet/broker/auction application MUST implement the wallet interface if it will accept safe transfers. $dev Note: the ERC-165 identifier for this interface is 0x150b7a02.
*/
interface ERC721TokenReceiverITF {
    function onERC721Received(address _operator, address _from, uint256 tokenId, bytes calldata _data) external pure returns(bytes4);
}

//supportsInterface[0x01ffc9a7] will be true, must not set element 0xffffffff to true!!!!!
interface ERC165ITF {
  function supportsInterface(bytes4 _interfaceID) external view returns (bool);
}
contract SupportsInterface is ERC165ITF {
    mapping(bytes4 => bool) internal supportedInterfaces;
    constructor() public {
        supportedInterfaces[0x01ffc9a7] = true; // ERC165ITF, must not set element 0xffffffff to true!!!!!
    }
    function supportsInterface(bytes4 _interfaceID) external view returns (bool) {
        return supportedInterfaces[_interfaceID];
    }
}

//RegistryITF(addrRegistryITF).isAddrApproved(_to);
interface RegistryITF {
    function isAddrApproved(address assetCtAddr) external view returns (bool);
}

//TokenControllerITF(addrTokenControllerITF).isAdmin(msg.sender);
interface TokenControllerITF {
    function isAdmin(address sender) external view returns (bool);
    function isUnlockedValid() external view returns (bool);
}
//AssetBookITF(addrAssetBookITF).addAsset(_assetAddr);
interface AssetBookITF {
    function addAsset(address _assetAddr, string calldata _symbol, uint tokenId, uint _balance) external;
}


//------------------------
contract ERC721SPLC_HToken is ERC721ITF, SupportsInterface {
    using SafeMath for uint256;
    using AddressUtils for address;

    bytes4 constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;
    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))` ... which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`

    //-------------==H token specifics
    mapping(address => Account) internal accounts;//accounts[user]
    struct Account {
        uint idxStart;
        uint idxEnd;
        mapping (uint => uint) indexToId;//time index to tokenId
        //For First In First Out(FIFO) exchange rule
        mapping (address => bool) operators;
    }
    mapping(uint256 => Asset) public idToAsset;//NFT ID to token assets
    struct Asset {
        address owner;
        string name;// NCCU site No.1(2018)
        string symbol;//NCCU1801... 4 characters+ yy for year+ ss serial number
        string currency;// NTD or USD or ...
        bytes32 uri;//token specific information
        uint pricing;// pricing in the "currency" type above
        bool approval;//approved to be transferred by one of the operators or the owner himself
    }

    uint public tokenId;//first id will be 1
    uint public siteSizeInKW;// 300kw
    uint public maxTotalSupply;// total allowed tokens for this contract. 790 Assets
    uint public totalSupply;//total generated tokens - destroyed tokens
    uint public initialAssetPricing;// 17000
    string public pricingCurrency;// for the initialAssetPricing: NTD or USD
    uint public IRR20yrx100;// 470 represents 4.7; // IRR 20 years rental x100 (per year 年);

    address public addrRegistryITF;
    address public addrTokenControllerITF;

    /**//==================Metadata
    https://github.com/0xcert/ethereum-erc721/blob/master/contracts/tokens/ERC721Metadata.sol
    interface ERC721Metadata {}*/
    string internal nftName;//descriptive name for a collection of NFTs
    string internal nftSymbol;//abbreviated name for NFTokens

    function name() external view returns (string memory _name) {
        _name = nftName;
    }
    function symbol() external view returns (string memory _symbol) {
        _symbol = nftSymbol;
    }
    function tokenURI(uint256 tokenId) external view returns (bytes32) {
        require(idToAsset[tokenId].owner != address(0), "owner should not be 0x0");
        return idToAsset[tokenId].uri;
    }

    //==================
    //6122295 gas. 
    /** Contract code size over limit of 24576 bytes.
    "NCCU site No.1(2018)", "NCCU1801", 300, 800, 17000, "NTD", 470, "0x0dcd2f752394c41875e259e00bb44fd505297caf",
    "0xbbf289d846208c16edc8474705c748aff07732db"  */
    constructor(
        string memory _nftName, string memory _nftSymbol, 
        uint _siteSizeInKW, uint _maxTotalSupply, uint _initialAssetPricing, 
        string memory _pricingCurrency, uint _IRR20yrx100,
        address _addrRegistryITF, address _addrTokenControllerITF) public {
        nftName = _nftName;
        nftSymbol = _nftSymbol;

        siteSizeInKW = _siteSizeInKW;
        maxTotalSupply = _maxTotalSupply;
        initialAssetPricing = _initialAssetPricing;
        pricingCurrency = _pricingCurrency;
        IRR20yrx100 = _IRR20yrx100;
        
        addrRegistryITF = _addrRegistryITF;
        addrTokenControllerITF = _addrTokenControllerITF;
        supportedInterfaces[0x80ac58cd] = true;// ERC721ITF
        supportedInterfaces[0x5b5e139f] = true;// ERC721Metadata
        supportedInterfaces[0x780e9d63] = true;// ERC721Enumerable
    }
    
    function getHTokenDetails() external view returns (
        uint tokenId_, uint siteSizeInKW_, uint maxTotalSupply_,
        uint totalSupply_, uint initialAssetPricing_, string memory pricingCurrency_, uint IRR20yrx100_) {
            tokenId_ tokenId;
            siteSizeInKW_ = siteSizeInKW;
            maxTotalSupply_ = maxTotalSupply;
            totalSupply_ = totalSupply;
            initialAssetPricing_ = initialAssetPricing;
            pricingCurrency_ = pricingCurrency;
            IRR20yrx100_ = IRR20yrx100;
    }
    modifier ckAddr(address addr) {
        require(addr != address(0), "addr should not be zero");
        _;
    }


    function ownerOf(uint256 tokenId) 
        external view returns (address _owner) {
        require(_owner != address(0), "_owner should not be 0x0");
        _owner = idToAsset[tokenId].owner;
    }
    function getNFT(uint tokenId) external view returns (
        address owner, string memory nftName, 
        string memory nftSymbol, string memory ntfCurrency, 
        bytes32 nftURI, uint nftPricing, bool approval) {
        Asset memory asset = idToAsset[tokenId];
        owner = asset.owner;
        nftName = asset.name;
        nftSymbol = asset.symbol;
        ntfCurrency = asset.currency;
        nftURI = asset.uri;
        nftPricing = asset.pricing;
        approval = asset.approval;
    }
    /*struct Asset {
        address owner;
        string name;// NCCU site No.1(2018)
        string symbol;//NCCU1801
        string currency;// NTD or USD or ...
        bytes32 uri;//token specific information
        uint pricing;// pricing in the "currency" type above
        bool approval;
    }*/


    //---------------------------==Account
    function getAccount(address user) external view 
      returns (uint idxStart, uint idxEnd, uint balance) {
        idxStart = accounts[user].idxStart;
        idxEnd = accounts[user].idxEnd;
        balance = balanceOfP(user);
    }
    function balanceOf(address user) external view returns (uint balance) {
        balance = balanceOfP(user);
    }
    function balanceOfP(address user) public view returns (uint balance) {
        require(user != address(0), "user should not be 0x0");
        uint idxStart = accounts[user].idxStart;
        uint idxEnd = accounts[user].idxEnd;
        if (idxStart > idxEnd) {
            balance = 0;
        } else {
            idxEnd.sub(idxStart).add(1);
        }
    }
    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/
    // function get_ownerToIds(address _owner) external view returns (uint[] 
    function getAccountIds(address user) external view 
    returns (uint[] memory arrayOut) {
        require(user != address(0), "owner should not be 0x0");
        uint idxStart = accounts[user].idxStart;
        uint idxEnd = accounts[user].idxEnd;
        
        if (idxStart <= idxEnd) {
            //require(idxStart <= idxEnd, "idxStart <= idxEnd");
            uint len = idxEnd.sub(idxStart).add(1);
            arrayOut = new uint[](len);
            for(uint i = 0; i < len; i++) {
                arrayOut[i] = accounts[user].indexToId[i.add(idxStart)];
            }
        }//else arrayOut = [];
    }
    function getAccountId(address user, uint index) 
    public view ckAssetAddr(user) 
    returns (uint tokenId) {
        tokenId = accounts[user].indexToId[index];
    }
    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/

    //-------------------==Enumerable
    /** https://github.com/0xcert/ethereum-erc721/blob/master/contracts/tokens/ERC721Enumerable.sol
    interface ERC721Enumerable {
      function totalSupply() external view returns (uint256);
      function tokenByIndex(uint256 _index) external view returns (uint256);
      function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256);
    }*/

    uint public tokenByIndex = 999999999;//no array so no token should be found by array index => returning the tokenId(token identifier)
    //-----------------------==End of Enumerable interface


    //-----------------------==Mint
    function mintSerialNFTOne(address _to, bytes32 _uri) external {
        mintSerialNFT(_to, _uri);
    }
    function mintSerialNFTBatch(address[] calldata _tos, bytes32[] calldata _uris) external {
        uint toLength = _tos.length;
        require(toLength == _uris.length, "_tos.length and _uris.length must be the same");
        for(uint i=0; i<toLength; i++) {
            mintSerialNFT(_tos[i], _uris[i]);
        }
    }
    function mintSerialNFTBatchToOne(address _to, bytes32[] calldata _uris) external {
        for(uint i=0; i < _uris.length; i++) {
            mintSerialNFT(_to, _uris[i]);
        }
    }

    event MintSerialNFT(address indexed newOwner, uint tokenId, string nftName, string nftSymbol, 
        string pricingCurrency, bytes32 uri, uint initialAssetPricing);
    function mintSerialNFT(address _to, bytes32 _uri) public {
        require(TokenControllerITF(addrTokenControllerITF).isAdmin(msg.sender), 'only H-Token admin can mint tokens');

        //Legal Compliance
        require(RegistryITF(addrRegistryITF).isAddrApproved(_to), "_to is not in compliance");

        tokenId = tokenId.add(1);

        if (_to.isContract()) {//also checks for none zero address
            bytes4 retval = ERC721TokenReceiverITF(_to).onERC721Received(
                msg.sender, address(this), tokenId, "");
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        }

        require(tokenId <= maxTotalSupply, "max allowed token amount has been reached");
        idToAsset[tokenId] = Asset(_to, nftName, nftSymbol, pricingCurrency, _uri, initialAssetPricing, false);
    /*struct Asset {
        address owner;
        string name;// NCCU site No.1(2018)
        string symbol;//NCCU1801
        string currency;// NTD or USD or ...
        bytes32 uri;//token specific information
        uint pricing;// pricing in the "currency" type above
        bool approval;
    }*/
        addNFToken(_to, tokenId);
        emit MintSerialNFT(msg.sender, tokenId, nftName, nftSymbol, 
          pricingCurrency, _uri, initialAssetPricing);
        totalSupply = totalSupply.add(1);
    }


    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/



    //---------------------------==Transfer
    function safeTransferFromBatch(address[] calldata _froms, 
        address[] calldata _tos, uint[] memory _tokenIds) external {
        require(_froms.length == _tos.length, "_froms.length and _tos.length must be the same");
        for(uint i = 0; i < toLength; i++) {
            _safeTransferFrom(_froms[i], _tos[i], _tokenIds[i], "");
        }
    }
    function safeTransferFromToOne(address _from, address _to, uint amount) external {
        require(_from != address(0), "_to should not be 0x0");
        //require(_to != address(0), "_to should not be 0x0");
        require(amount > 0, "amount should not be > 0");
        require(_from != _to, "_from should not be equal to _to");

        if (_to.isContract()) {
            bytes4 retval = ERC721TokenReceiverITF(_to).onERC721Received(
                msg.sender, _from, tokenId, _data);
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        }

        require(TokenControllerITF(addrTokenControllerITF).isUnlockedValid(),'token cannot be transferred due to either unlock period or after valid date');
        //Legal Compliance
        require(RegistryITF(addrRegistryITF).isAddrApproved(_to), "_to is not in compliance");
        require(RegistryITF(addrRegistryITF).isAddrApproved(_from), "from is not in compliance");

        _safeTransferFromToOne(_from, _to, amount);
    }

    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/
    /*struct Asset { // idToAsset[tokenId]
        address owner;
        string name;// NCCU site No.1(2018)
        string symbol;//NCCU1801
        string currency;// NTD or USD or ...
        bytes32 uri;//token specific information
        uint pricing;// pricing in the "currency" type above
        bool approval;
    }*/
    //emit Transfer(from, _to, tokenId);
    //canTransfer(tokenId) validNFToken(tokenId)
    function _safeTransferFromToOne(address _from, address _to, uint amount) internal {

        Account account = accounts[_from];
        uint idxStart = account.idxStart;
        uint idxEnd = account.idxEnd;
        require(idxStart <= idxEnd, "not enough asset: balance = 0");
        uint balance = idxEnd.sub(idxStart).add(1);
        require(balance >= amount, "not enough asset: balance < amount");
        uint idxEndReq = idxStart.add(amount).sub(1);

        uint tokenId;
        for(uint i = idxStart; i <= idxEndReq; i++) {
            tokenId = account.indexToId[i];

            address tokenOwner = idToAsset[tokenId].owner;
            require(tokenOwner == _from, "tokenOwner should be _from");
            require(
            tokenOwner == msg.sender || getIdToApprovals(tokenId) == msg.sender || accounts[tokenOwner].operators[msg.sender], "msg.sender should be tokenOwner, an approved, or a token operator");//ownerToOperators[tokenOwner][msg.sender]
            require(idToAsset[tokenId].owner != address(0), "owner should not be 0x0");

            clearApproval(tokenId);
            delete accounts[_from].indexToId[i];

            require(idToAsset[tokenId].owner == _from, "tokenId should match _from");
            delete idToAsset[tokenId].owner;

            addNFToken(_to, tokenId);
        }
        if (idxEnd == idxEndReq) {
            accounts[_from].idxEnd = 0;
            accounts[_from].idxStart = 0;
            accounts[addr].indexToId[0] = 0;
        } else {
            accounts[_from].idxStart = idxStart.add(amount);
        }
    }
    /*canTransfer()
        require(
            tokenOwner == msg.sender || getIdToApprovals(tokenId) == msg.sender || accounts[tokenOwner].operators[msg.sender], "msg.sender should be tokenOwner, an approved, or a token operator");//ownerToOperators[tokenOwner][msg.sender]

      validToken()
        require(idToAsset[tokenId].owner != address(0), "owner should not be 0x0");
    */
    function removeNFToken(address addr) internal {
        Account account = accounts[addr];
        require(account.indexToId[0] > 0, "token is not zero");
        uint idxStart = account.idxStart;
        uint idxEnd = account.idxEnd;
        uint count = idxEnd.sub(idxStart).add(1);
        uint tokenId = account.indexToId[idxStart];

        require(count > 0, "token count should be > 0");
        uint countM1 = count.sub(1);
        accounts[addr].idxStart = idxStart.add(1);
        delete accounts[addr].indexToId[idxStart];

        if (countM1 == 0) {
            accounts[addr].idxStart = 0;
            accounts[addr].idxEnd = 0;
            accounts[addr].indexToId[0] == 0;
        }

        require(idToAsset[tokenId].owner == addr, "tokenId should match addr");
        delete idToAsset[tokenId].owner;
        clearApproval(tokenId);
    }
    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/


    function addNFToken(address addr, uint tokenId) internal {
        //accounts[owner].idxStart  .idxEnd  .indexToId[index]  .operators[opAddr]
        Account account = accounts[addr];
        uint idxStart = account.idxStart;
        uint idxEnd = account.idxEnd;

        if (idxStart == 0 && idxEnd == 0 && account.indexToId[0] == 0) {
            accounts[addr].indexToId[0] = tokenId;

        } else if (idxStart > idxEnd) {
            accounts[addr].idxStart = 0;
            accounts[addr].idxEnd = 0;
            accounts[addr].indexToId[0] = tokenId;

        } else {
            uint idxEndOut = idxEnd.add(1);
            accounts[addr].indexToId[idxEndOut] = tokenId;
            accounts[addr].idxEnd = idxEndOut;
        }
        AssetBookITF(addr).addAsset(address(this), nftSymbol, tokenId);
    }
    /*struct Asset {
        address owner;
        string name;// NCCU site No.1(2018)
        string symbol;//NCCU1801
        string currency;// NTD or USD or ...
        bytes32 uri;//token specific information
        uint pricing;// pricing in the "currency" type above
        bool approval;
    }*/
    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/
    function safeTransferFrom(
        address _from, address _to, uint256 tokenId, bytes calldata _data) 
        external {
        _safeTransferFrom(_from, _to, tokenId, _data);
    }
    function safeTransferFrom(address _from, address _to, uint256 tokenId) external {
        _safeTransferFrom(_from, _to, tokenId, "");
    }
    function transferFrom(address _from, address _to, uint256 tokenId) external {
        _safeTransferFrom(_from, _to, tokenId, "");
    }

    function _safeTransferFrom(
        address _from, address _to, uint256 tokenId, bytes memory _data)
        internal canTransfer(tokenId) validNFToken(tokenId) {

        address tokenOwner = idToAsset[tokenId].owner;
        require(tokenOwner == _from, "tokenOwner should be _from");
        require(_to != address(0), "_to should not be 0x0");

        if (_to.isContract()) {
            bytes4 retval = ERC721TokenReceiverITF(_to).onERC721Received(
                msg.sender, _from, tokenId, _data);
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        }
        _transfer(_to, tokenId);
    }
    /*canTransfer()
        require(
            tokenOwner == msg.sender || getIdToApprovals(tokenId) == msg.sender || accounts[tokenOwner].operators[msg.sender], "msg.sender should be tokenOwner, an approved, or a token operator");//ownerToOperators[tokenOwner][msg.sender]

      validToken()
        require(idToAsset[tokenId].owner != address(0), "owner should not be 0x0");
    */
    function _transfer(address _to, uint256 tokenId) private {
        address _from = idToAsset[tokenId].owner;

        require(TokenControllerITF(addrTokenControllerITF).isUnlockedValid(),'token cannot be transferred due to either unlock period or after valid date');
        //Legal Compliance
        require(RegistryITF(addrRegistryITF).isAddrApproved(_to), "_to is not in compliance");
        require(RegistryITF(addrRegistryITF).isAddrApproved(_from), "_from is not in compliance");

        clearApproval(tokenId);
        removeNFToken(_from);
        addNFToken(_to, tokenId);
        emit Transfer(_from, _to, tokenId);
    }
    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/




    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/


    //-------------------------==
    function getTokenOwners(uint tokenId_Start, uint amount) 
        external view returns(address[] memory addrArray) {
        //maxTokenId = tokenId - 1;
        require(tokenId_Start + amount - 1 <= tokenId, "tokenId_Start is too big for amount");
        address[] memory addrArray;
        for(uint i = tokenId_Start; i <= tokenId; i = i.add(1)) {
            addrArray[i] = idToAsset[i].owner;
        }
    }
    function getIdToApprovals(uint256 tokenId) public view
        validNFToken(tokenId) returns (address) {
        return idToAsset[tokenId].approval;
    }


    /** $dev Guarantees that the msg.sender is 
    an owner or operator of the given NFT.
    * $param tokenId ID of the NFT to validate.   */
    modifier canOperate(uint256 tokenId) {
        address tokenOwner = idToAsset[tokenId].owner;
        require(
            tokenOwner == msg.sender || accounts[tokenOwner].operators[msg.sender],
            "tokenOwner should be either msg.sender or is an approved operator");//ownerToOperators[tokenOwner][msg.sender]
        _;
    }

    /** $dev Guarantees that the msg.sender is allowed to transfer NFT.
    * $param tokenId ID of the NFT to transfer.   */
    modifier canTransfer(uint256 tokenId) {
        address tokenOwner = idToAsset[tokenId].owner;
        require(
            tokenOwner == msg.sender || getIdToApprovals(tokenId) == msg.sender || accounts[tokenOwner].operators[msg.sender], "msg.sender should be tokenOwner, an approved, or a token operator");//ownerToOperators[tokenOwner][msg.sender]
        _;
    }

    /** $dev Guarantees that tokenId is a valid Token. Check if such tokenId exists. $param tokenId ID of the NFT to validate.   */
    modifier validNFToken(uint256 tokenId) {
        require(idToAsset[tokenId].owner != address(0), "owner should not be 0x0");
        _;
    }
    //------------------------==Approvals
    /** $dev Clears the current approval of a given NFT ID.
    * $param tokenId ID of the NFT to be transferred.   */
    function clearApproval(uint256 tokenId) private {
        if(idToAsset[tokenId].approval != address(0)) {
            delete idToAsset[tokenId].approval;
        }
    }

    function approve(address _approved, uint256 tokenId) external {
        //canOperate(tokenId)
        address tokenOwner = idToAsset[tokenId].owner;
        require(
            tokenOwner == msg.sender || accounts[tokenOwner].operators[msg.sender],
            "msg.sender should be either tokenOwner or an approved operator");//ownerToOperators[tokenOwner][msg.sender]

        //validNFToken(tokenId)
        require(idToAsset[tokenId].owner != address(0), "owner should not be 0x0");

        require(_approved != tokenOwner, "_approved should not be tokenOwner");
        // require(
        //     !(getIdToApprovals(tokenId) == address(0) && _approved == address(0)), 
        //     "approved address and _approved should not be 0x0");

        idToAsset[tokenId].approval = _approved;
        emit Approval(tokenOwner, _approved, tokenId);
    }

    /** $dev Enables or disables approval for a third party ("operator") 
    to manage all of `msg.sender`'s assets. It also emits the ApprovalForAll event.
    * $notice This works even if sender doesn't own any tokens at the time.
    * $param _operator Address to add to the set of authorized operators.
    * $param _approved True if the operators is approved, false to revoke approval.   */
    function setApprovalForAll(address _operator, bool _approved) 
        external {
        require(_operator != address(0), "_operator should not be 0x0");
        accounts[msg.sender].operators[_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }//ownerToOperators[msg.sender][_operator]

    /** $dev Get the approved address for a single NFT.
    * $notice Throws if `tokenId` is not a valid NFT.
    * $param tokenId ID of the NFT to query the approval of.   */
    function getApproved(uint256 tokenId) external view returns (address) {
        //validNFToken(tokenId)
        require(idToAsset[tokenId].owner != address(0), "owner should not be 0x0");
        return idToAsset[tokenId].approval;
    }

    /** $dev Checks if `_operator` is an approved operator for `_owner`.
    * $param _owner The address that owns the NFTs.
    * $param _operator The address that acts on behalf of the owner.   */
    function isApprovedForAll(address _owner, address _operator) 
        external view returns (bool) {
        require(_owner != address(0), "_owner should not be 0x0");
        require(_operator != address(0), "_operator should not be 0x0");
        return accounts[_owner].operators[_operator];
        //return ownerToOperators[_owner][_operator];
    }

    //-------------------==Enumerable
    /** $dev returns the n-th NFT ID from a list of owner's tokens.
    * $param _owner Token owner's address.
    * $param _index Index number representing n-th token in owner's list of tokens.*/
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256) {
        require(_index <= accounts[_owner].idxEnd, "_index should be <= accounts[_owner].idxEnd");
        require(_index >= accounts[_owner].idxStart, "_index should be >= accounts[_owner].idxStart");
        return accounts[_owner].indexToId[_index];
        //accounts[owner].indexToId[index]
    }
    //====================Copied code
    /** $dev Mints a new NFT.
    * $notice This is a private function which should be called from user_implemented external     * mint function. Its purpose is to show and properly initialize data structures when using this * implementation.
    * $param _to The address that will own the minted NFT.
    * $param tokenId of the NFT to be minted by the msg.sender.   */
    /*function _mint(address _to, uint256 tokenId) internal {
        // require(_to != address(0), "_to should not be 0x0");
        // require(tokenId != 0, "tokenId should not be 0");
        //require(idToAsset[tokenId].owner == address(0), "owner of this id should be 0x0");
        addNFToken(_to, tokenId);
        //emit Transfer(address(0), _to, tokenId);
    }*/

    /** $dev Burns a NFT.
    * $notice This is a private function which should be called from user_implemented external; 
    burn function. Its purpose is to show and properly initialize data structures when using this implementation.
    * $param _owner Address of the NFT owner.
    * $param tokenId ID of the NFT to be burned.   */
    // function _burn(address _owner, uint256 tokenId) 
    //     internal validNFToken(tokenId) {
    //     clearApproval(tokenId);
    //     require(TokenControllerITF(addrTokenControllerITF).isAdmin(msg.sender), 'only H-Token admin can remove tokens');
    //         //only contract owner can destroy the token
    //     removeNFToken(_owner);
    //     emit Transfer(_owner, address(0), tokenId);
    //     // if (bytes(idToUri[tokenId]).length != address(0)) {
    //     //     delete idToUri[tokenId];
    //     // }
    // }

    function() external payable { revert("should not send any ether directly"); }
    //should not send any ether directly

    /** $dev Emits when ownership of any NFT changes by any mechanism. This event emits 
    when NFTs are created (`from` == 0) and destroyed (`to` == 0). 
    Exception: during contract creation, any number of NFTs may be created and 
    assigned without emitting Transfer. At the time of any transfer, the approved address 
    for that NFT (if any) is reset to none. $param _from Sender of NFT 
    (if address is zero address it indicates token creation). $param _to Receiver of NFT 
    (if address is zero address it indicates token destruction).
    * $param tokenId The NFT that got transfered.   */
    event Transfer(address indexed _from, address indexed _to, uint256 indexed tokenId);

    /** $dev This emits when the approved address for an NFT is changed or reaffirmed. The zero
    * address indicates there is no approved address. When a Transfer event emits, this also
    * indicates that the approved address for that NFT (if any) is reset to none.
    * $param _owner Owner of NFT.
    * $param _approved Address that we are approving.
    * $param tokenId NFT which we are approving.   */
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed tokenId);

    /** $dev This emits when an operator is enabled or disabled for an owner. The operator can manage
    * all NFTs of the owner.
    * $param _owner Owner of NFT.
    * $param _operator Address to which we are setting operator rights.
    * $param _approved Status of operator rights(true if operator rights are given and false if
    * revoked).   */
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);


    // event BurnNFT(address _owner, uint tokenId, address msgsender);
    // function burnNFT(address _owner, uint256 tokenId) external onlyAdmin {
    //     delete idToAsset[tokenId];
    //     _burn(_owner, tokenId);
    //     totalSupply = totalSupply.sub(1);
    //     emit BurnNFT(_owner, tokenId, msg.sender);
    // }




}


//--------------------==
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

# Read only NFT RegistryITF — always throw from unsafeTransfer, transferFrom, approve and setApprovalForAll

$ only allow two-step ERC-20 style transaction, require that transfer functions never throw, require all functions to return a boolean indicating the success of the operation.

$ The URI MAY be mutable (i.e. it changes from time to time).

*/

/**
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
