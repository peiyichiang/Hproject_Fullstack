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
  event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
  event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

  function balanceOf(address _owner) external view returns (uint256);
  function ownerOf(uint256 _tokenId) external view returns (address);
  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata _data) external;
  function safeTransferFrom(address _from, address _to, uint256 _tokenId) external;
  function transferFrom(address _from, address _to, uint256 _tokenId) external;

  function approve(address _approved, uint256 _tokenId) external;
  function setApprovalForAll(address _operator, bool _approved) external;
  function getApproved(uint256 _tokenId) external view returns (address);
  function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}

/*A wallet/broker/auction application MUST implement the wallet interface if it will accept safe transfers. $dev Note: the ERC-165 identifier for this interface is 0x150b7a02.
*/
interface ERC721TokenReceiverITF {
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external pure returns(bytes4);
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
    function addAsset(address _assetAddr, string calldata _symbol, uint _tokenId) external;
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
        mapping (uint => uint) indexToId;//time index to _tokenId
        //For First In First Out(FIFO) exchange rule
        mapping (address => bool) operators;
    }
    mapping(uint256 => Asset) public idToAsset;//NFT ID to token assets
    struct Asset {
        address owner;
        uint acquiredCost;
        address approvedAddress;//approved to be transferred by one of the operators or the owner himself
    }

    bytes32 public tokenURI;//token specific information
    uint public tokenId;//first id will be 1
    uint public siteSizeInKW;// 300kw
    uint public maxTotalSupply;// total allowed tokens for this contract. 790 Assets
    uint public totalSupply;//total generated tokens - destroyed tokens
    uint public initialAssetPricing;// 17000
    string public pricingCurrency;// for the initialAssetPricing: NTD or USD
    uint public IRR20yrx100;// 470 represents 4.7; // IRR 20 years rental x100 (per year 年);

    address public addrRegistryITF;
    address public addrTokenControllerITF;

    /*==================Metadata
    https://github.com/0xcert/ethereum-erc721/blob/master/contracts/tokens/ERC721Metadata.sol
    interface ERC721Metadata {}*/
    string public nftName;//descriptive name for a collection of NFTs
    string public nftSymbol;//abbreviated name for NFTokens

    //==================
    //6122295 gas. 
    /** Contract code size over limit of 24576 bytes.
    "NCCU site No.1(2018)", "NCCU1801", 300, 800, 17000, "NTD", 470, "0x0dcd2f752394c41875e259e00bb44fd505297caf",
    "0xbbf289d846208c16edc8474705c748aff07732db", 0x0348538441  */
    constructor(
        string memory _nftName, string memory _nftSymbol, 
        uint _siteSizeInKW, uint _maxTotalSupply, uint _initialAssetPricing, 
        string memory _pricingCurrency, uint _IRR20yrx100,
        address _addrRegistryITF, address _addrTokenControllerITF,
        bytes32 _tokenURI) public {
        nftName = _nftName;
        nftSymbol = _nftSymbol;
        tokenURI = _tokenURI;

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
        uint totalSupply_, uint initialAssetPricing_, 
        string memory pricingCurrency_, uint IRR20yrx100_) {
            tokenId_ = tokenId;
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

    function ownerOf(uint256 _tokenId) 
        external view returns (address owner_) {
        require(owner_ != address(0), "owner_ should not be 0x0");
        owner_ = idToAsset[_tokenId].owner;
    }
    function getNFT(uint _tokenId) external view returns (
        address owner, uint acquiredCost, address approvedAddress) {
        Asset memory asset = idToAsset[_tokenId];
        owner = asset.owner;
        acquiredCost = asset.acquiredCost;
        approvedAddress = asset.approvedAddress;
    }
    /*struct Asset {
        address owner;
        uint acquiredCost;
        address approvedAddress;
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
        public view ckAddr(user) 
        returns (uint tokenId_) {
            tokenId_ = accounts[user].indexToId[index];
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
    //-----------------------==End of Enumerable interface


    //-----------------------==Mint
    function mintSerialNFTBatch(address[] calldata _tos, uint _amount) external {
        for(uint i=0; i < _tos.length; i++) {
            for(uint j=0; j < _amount; j++) {
                mintSerialNFT(_tos[i]);
            }
        }
    }
    function mintSerialNFTBatchToOne(address _to, uint _amount) external {
        for(uint i=0; i < _amount; i++) {
            mintSerialNFT(_to);
        }
    }

    event MintSerialNFT(address indexed newOwner, uint amountMinted);
    function mintSerialNFT(address _to, uint amount) public {
        require(TokenControllerITF(addrTokenControllerITF).isAdmin(msg.sender), 'only H-Token admin can mint tokens');

        //Legal Compliance
        require(RegistryITF(addrRegistryITF).isAddrApproved(_to), "_to is not in compliance");

        if (_to.isContract()) {//also checks for none zero address
            bytes4 retval = ERC721TokenReceiverITF(_to).onERC721Received(
                msg.sender, address(this), 1, "");
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        }
        require(tokenId.add(amount) <= maxTotalSupply, "max allowed token amount has been reached");
        totalSupply = tokenId.add(amount);
        emit MintSerialNFT(msg.sender, amount);

        Account memory account = accounts[_to];
        //uint idxStart = account.idxStart;
        uint idxEnd = account.idxEnd;
        //require(idxStart <= idxEnd, "not enough asset: balance = 0");
        //uint balance = idxEnd.sub(idxStart).add(1);
        //require(balance >= amount, "not enough asset: balance < amount");
        uint idxEndOut = idxEnd.add(amount);

        for(uint i = idxStart; i <= idxEndOut; i++) {
            tokenId = tokenId.add(1);
            idToAsset[tokenId] = Asset(_to, initialAssetPricing, address(0));
            //addNFToken(_to, tokenId);

        }
        accounts[_to].idxStart = idxStart.add(amount);
    }

    /*struct Asset {
        address owner;
        uint acquiredCost;
        address approvedAddress;
    }*/
    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/

    //---------------------------==Transfer
    function safeTransferFromToOne(address _from, address _to, uint amount, uint price) external {
        require(_from != address(0), "_to should not be 0x0");
        //require(_to != address(0), "_to should not be 0x0");
        require(amount > 0, "amount should not be > 0");
        require(_from != _to, "_from should not be equal to _to");

        if (_to.isContract()) {
            bytes4 retval = ERC721TokenReceiverITF(_to).onERC721Received(
                msg.sender, _from, tokenId, "");
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        }

        require(TokenControllerITF(addrTokenControllerITF).isUnlockedValid(),'token cannot be transferred due to either unlock period or after valid date');
        //Legal Compliance
        require(RegistryITF(addrRegistryITF).isAddrApproved(_to), "_to is not in compliance");
        require(RegistryITF(addrRegistryITF).isAddrApproved(_from), "from is not in compliance");

        _safeTransferFromToOne(_from, _to, amount, price);
    }

    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/
    /*struct Asset { // idToAsset[tokenId]
        address owner;
        uint acquiredCost;
        address approvedAddress;
    }*/
    //emit Transfer(from, _to, tokenId);
    //canTransfer(tokenId) validNFToken(tokenId)
    function _safeTransferFromToOne(address _from, 
        address _to, uint amount, uint price) internal {

        Account memory account = accounts[_from];
        uint idxStart = account.idxStart;
        uint idxEnd = account.idxEnd;
        require(idxStart <= idxEnd, "not enough asset: balance = 0");
        uint balance = idxEnd.sub(idxStart).add(1);
        require(balance >= amount, "not enough asset: balance < amount");
        uint idxEndReq = idxStart.add(amount).sub(1);

        uint tokenId_;
        for(uint i = idxStart; i <= idxEndReq; i++) {
            tokenId_ = accounts[_from].indexToId[i];

            address tokenOwner = idToAsset[tokenId_].owner;
            require(tokenOwner == _from, "tokenOwner should be _from");
            require(
            tokenOwner == msg.sender || getIdToApprovals(tokenId_) == msg.sender 
            || accounts[tokenOwner].operators[msg.sender], 
            "msg.sender should be tokenOwner, an approved, or a token operator");
            //ownerToOperators[tokenOwner][msg.sender]
            require(idToAsset[tokenId_].owner != address(0), "owner should not be 0x0");

            idToAsset[tokenId_].acquiredCost = price;
            clearApproval(tokenId_);
            delete accounts[_from].indexToId[i];

            require(idToAsset[tokenId_].owner == _from, "tokenId_ should match _from");
            delete idToAsset[tokenId_].owner;

            addNFToken(_to, tokenId_);
        }
        if (idxEnd == idxEndReq) {
            accounts[_from].idxEnd = 0;
            accounts[_from].idxStart = 0;
            accounts[_from].indexToId[0] = 0;
        } else {
            accounts[_from].idxStart = idxStart.add(amount);
        }
    }
    /*canTransfer()
        require(
            tokenOwner == msg.sender || getIdToApprovals(tokenId_) == msg.sender || accounts[tokenOwner].operators[msg.sender], "msg.sender should be tokenOwner, an approved, or a token operator");//ownerToOperators[tokenOwner][msg.sender]

      validToken()
        require(idToAsset[tokenId_].owner != address(0), "owner should not be 0x0");
    */
    function removeNFToken(address addr) internal {
        Account memory account = accounts[addr];
        require(accounts[addr].indexToId[0] > 0, "token is not zero");
        uint idxStart = account.idxStart;
        uint idxEnd = account.idxEnd;
        uint count = idxEnd.sub(idxStart).add(1);
        uint tokenId_ = accounts[addr].indexToId[idxStart];

        require(count > 0, "token count should be > 0");
        uint countM1 = count.sub(1);
        accounts[addr].idxStart = idxStart.add(1);
        delete accounts[addr].indexToId[idxStart];

        if (countM1 == 0) {
            accounts[addr].idxStart = 0;
            accounts[addr].idxEnd = 0;
            accounts[addr].indexToId[0] == 0;
        }

        require(idToAsset[tokenId_].owner == addr, "tokenId_ should match addr");
        delete idToAsset[tokenId_].owner;
        clearApproval(tokenId_);
    }
    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/
    /*struct Asset { // idToAsset[tokenId]
        address owner;
        uint acquiredCost;
        address approvedAddress;
    }*/

    function addNFToken(address addr, uint _tokenId) internal {
        //accounts[owner].idxStart  .idxEnd  .indexToId[index]  .operators[opAddr]
        Account memory account = accounts[addr];
        uint idxStart = account.idxStart;
        uint idxEnd = account.idxEnd;

        if (idxStart == 0 && idxEnd == 0 && accounts[addr].indexToId[0] == 0) {
            accounts[addr].indexToId[0] = _tokenId;

        } else if (idxStart > idxEnd) {
            accounts[addr].idxStart = 0;
            accounts[addr].idxEnd = 0;
            accounts[addr].indexToId[0] = _tokenId;

        } else {
            uint idxEndOut = idxEnd.add(1);
            accounts[addr].indexToId[idxEndOut] = _tokenId;
            accounts[addr].idxEnd = idxEndOut;
        }
        AssetBookITF(addr).addAsset(address(this), nftSymbol, _tokenId);
    }
    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/
    /*struct Asset { // idToAsset[tokenId]
        address owner;
        uint acquiredCost;
        address approvedAddress;
    }*/


    //-------------------------------==
    function safeTransferFrom(
        address _from, address _to, uint256 _tokenId, bytes calldata _data) 
        external {
        _safeTransferFrom(_from, _to, _tokenId, _data);
    }
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external {
        _safeTransferFrom(_from, _to, _tokenId, "");
    }
    function transferFrom(address _from, address _to, uint256 _tokenId) external {
        _safeTransferFrom(_from, _to, _tokenId, "");
    }

    function _safeTransferFrom(
        address _from, address _to, uint256 _tokenId, bytes memory _data)
        internal canTransfer(_tokenId) validNFToken(_tokenId) {

        address tokenOwner = idToAsset[_tokenId].owner;
        require(tokenOwner == _from, "tokenOwner should be _from");
        require(_to != address(0), "_to should not be 0x0");

        if (_to.isContract()) {
            bytes4 retval = ERC721TokenReceiverITF(_to).onERC721Received(
                msg.sender, _from, _tokenId, _data);
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        }
        _transfer(_to, _tokenId);
    }
    /*canTransfer()
        require(
            tokenOwner == msg.sender || getIdToApprovals(_tokenId) == msg.sender || accounts[tokenOwner].operators[msg.sender], "msg.sender should be tokenOwner, an approved, or a token operator");//ownerToOperators[tokenOwner][msg.sender]

      validToken()
        require(idToAsset[_tokenId].owner != address(0), "owner should not be 0x0");
    */
    function _transfer(address _to, uint256 _tokenId) private {
        address _from = idToAsset[_tokenId].owner;

        require(TokenControllerITF(addrTokenControllerITF).isUnlockedValid(),'token cannot be transferred due to either unlock period or after valid date');
        //Legal Compliance
        require(RegistryITF(addrRegistryITF).isAddrApproved(_to), "_to is not in compliance");
        require(RegistryITF(addrRegistryITF).isAddrApproved(_from), "_from is not in compliance");

        clearApproval(_tokenId);
        removeNFToken(_from);
        addNFToken(_to, _tokenId);
        emit Transfer(_from, _to, _tokenId);
    }
    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => bool) operators;
    }*/
    /*struct Asset { // idToAsset[tokenId]
        address owner;
        uint acquiredCost;
        address approvedAddress;
    }*/


    //-------------------------==
    function getTokenOwners(uint tokenId_Start, uint amount) 
        external view returns(address[] memory addrArray) {
        //maxTokenId = tokenId - 1;
        require(tokenId_Start + amount - 1 <= tokenId, "tokenId_Start is too big for amount");

        for(uint i = tokenId_Start; i <= tokenId; i = i.add(1)) {
            addrArray[i] = idToAsset[i].owner;
        }
    }
    function getIdToApprovals(uint256 _tokenId) public view
        validNFToken(_tokenId) returns (address) {
        return idToAsset[_tokenId].approvedAddress;
    }
    function getIdToAcquiredCost(uint256 _tokenId) public view
        validNFToken(_tokenId) returns (uint) {
        return idToAsset[_tokenId].acquiredCost;
    }

    /** $dev Guarantees that the msg.sender is 
    an owner or operator of the given NFT.
    * $param _tokenId ID of the NFT to validate.   */
    modifier canOperate(uint256 _tokenId) {
        address tokenOwner = idToAsset[_tokenId].owner;
        require(
            tokenOwner == msg.sender || accounts[tokenOwner].operators[msg.sender],
            "tokenOwner should be either msg.sender or is an approved operator");//ownerToOperators[tokenOwner][msg.sender]
        _;
    }

    /** $dev Guarantees that the msg.sender is allowed to transfer NFT.
    * $param _tokenId ID of the NFT to transfer.   */
    modifier canTransfer(uint256 _tokenId) {
        address tokenOwner = idToAsset[_tokenId].owner;
        require(
            tokenOwner == msg.sender || getIdToApprovals(_tokenId) == msg.sender || accounts[tokenOwner].operators[msg.sender], "msg.sender should be tokenOwner, an approved, or a token operator");//ownerToOperators[tokenOwner][msg.sender]
        _;
    }

    /** $dev Guarantees that _tokenId is a valid Token. Check if such _tokenId exists. $param _tokenId ID of the NFT to validate.   */
    modifier validNFToken(uint256 _tokenId) {
        require(idToAsset[_tokenId].owner != address(0), "owner should not be 0x0");
        _;
    }
    //------------------------==Approvals
    /** $dev Clears the current approvedAddress of a given NFT ID.
    * $param _tokenId ID of the NFT to be transferred.   */
    function clearApproval(uint256 _tokenId) private {
        if(idToAsset[_tokenId].approvedAddress != address(0)) {
            delete idToAsset[_tokenId].approvedAddress;
        }
    }

    function approve(address _approved, uint256 _tokenId) external {
        //canOperate(_tokenId)
        address tokenOwner = idToAsset[_tokenId].owner;
        require(
            tokenOwner == msg.sender || accounts[tokenOwner].operators[msg.sender],
            "msg.sender should be either tokenOwner or an approved operator");//ownerToOperators[tokenOwner][msg.sender]

        //validNFToken(_tokenId)
        require(idToAsset[_tokenId].owner != address(0), "owner should not be 0x0");

        require(_approved != tokenOwner, "_approved should not be tokenOwner");
        // require(
        //     !(getIdToApprovals(_tokenId) == address(0) && _approved == address(0)), 
        //     "approved address and _approved should not be 0x0");

        idToAsset[_tokenId].approvedAddress = _approved;
        emit Approval(tokenOwner, _approved, _tokenId);
    }

    function setApprovalForAll(address _operator, bool _approved) 
        external {
        require(_operator != address(0), "_operator should not be 0x0");
        accounts[msg.sender].operators[_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }//ownerToOperators[msg.sender][_operator]

    function getApproved(uint256 _tokenId) external view returns (address) {
        //validNFToken(_tokenId)
        require(idToAsset[_tokenId].owner != address(0), "owner should not be 0x0");
        return idToAsset[_tokenId].approvedAddress;
    }

    function isApprovedForAll(address _owner, address _operator) 
        external view returns (bool) {
        require(_owner != address(0), "_owner should not be 0x0");
        require(_operator != address(0), "_operator should not be 0x0");
        return accounts[_owner].operators[_operator];
        //return ownerToOperators[_owner][_operator];
    }

    //-------------------==Enumerable
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256) {
        require(_index <= accounts[_owner].idxEnd, "_index should be <= accounts[_owner].idxEnd");
        require(_index >= accounts[_owner].idxStart, "_index should be >= accounts[_owner].idxStart");
        return accounts[_owner].indexToId[_index];
        //accounts[owner].indexToId[index]
    }

    //====================Copied code
    function() external payable { revert("should not send any ether directly"); }
    //should not send any ether directly

    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
    // event BurnNFT(address _owner, uint _tokenId, address msgsender);

    /** $dev Mints a new NFT.
    * $notice This is a private function which should be called from user_implemented external     * mint function. Its purpose is to show and properly initialize data structures when using this * implementation.
    * $param _to The address that will own the minted NFT.
    * $param _tokenId of the NFT to be minted by the msg.sender.   */
    /*function _mint(address _to, uint256 _tokenId) internal {
        // require(_to != address(0), "_to should not be 0x0");
        // require(_tokenId != 0, "_tokenId should not be 0");
        //require(idToAsset[_tokenId].owner == address(0), "owner of this id should be 0x0");
        addNFToken(_to, _tokenId);
        //emit Transfer(address(0), _to, _tokenId);
    }*/


    // function burnNFT(address _owner, uint256 _tokenId) external onlyAdmin {
    //     delete idToAsset[_tokenId];
    //     _burn(_owner, _tokenId);
    //     totalSupply = totalSupply.sub(1);
    //     emit BurnNFT(_owner, _tokenId, msg.sender);
    // }

    // function _burn(address _owner, uint256 _tokenId) 
    //     internal validNFToken(_tokenId) {
    //     clearApproval(_tokenId);
    //     require(TokenControllerITF(addrTokenControllerITF).isAdmin(msg.sender), 'only H-Token admin can remove tokens');
    //         //only contract owner can destroy the token
    //     removeNFToken(_owner);
    //     emit Transfer(_owner, address(0), _tokenId);
    //     // if (bytes(idToUri[_tokenId]).length != address(0)) {
    //     //     delete idToUri[_tokenId];
    //     // }
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
