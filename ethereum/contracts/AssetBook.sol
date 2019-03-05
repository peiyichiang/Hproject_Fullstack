pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
//deploy parameters: "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902191745
import "./SafeMath.sol";//not used i++ is assumed not to be too big

interface ERC721SPLCITF_assetbook {
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata _data) external;
    function transferFrom(address _from, address _to, uint256 _tokenId) external;

    function approve(address _approved, uint256 _tokenId) external;
    function setApprovalForAll(address _operator, bool _approved) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);

    function supportsInterface(bytes4 _interfaceID) external view returns (bool);
    
    function name() external view returns (string memory _name);
    function symbol() external view returns (string memory _symbol);
    function tokenURI(uint256 _tokenId) external view returns (string memory);

    function getNFT(uint _id) external view returns (string memory, string memory, string memory, string memory, uint);
    function get_ownerToIds(address _owner) external view returns (uint[] memory);
    function get_idToOwnerIndexPlus1(uint _tokenId) external view returns (uint);

    function getTokenOwners(uint idStart, uint idCount) external view returns(address[] memory);
    function mintSerialNFTOne(address _to, bytes32 _uri) external;
    function mintSerialNFTBatch(address[] calldata _tos, bytes32[] calldata _uris) external;
    function safeTransferFromBatch(address[] calldata _froms, address[] calldata _tos, uint[] calldata _tokenIds) external;
}

contract MultiSig {
    //using SafeMath for uint256;
    address internal assetsOwner; /** @dev 用戶 address */
    address internal platformContractAddr; /** @dev 平台方 platformContractAddr */
    address[] internal endorsersContractAddr; /** @dev 背書者的 assetContractAddr (一到三個人) */
    uint private assetsOwner_flag;
    uint private platform_flag;
    uint private endorsers_flag;

    /** @dev multiSig相關event */
    event changeAssetOwnerEvent(address indexed oldAssetsOwner, address indexed newAssetsOwner, uint256 timestamp);
    event changeEndorsersEvent(address indexed oldEndorsers, address indexed newEndorsers, uint256 timestamp);
    event addEndorsersEvent(address indexed endorsers, uint256 timestamp);
    event assetsOwnerVoteEvent(address assetsOwner, uint256 timestamp);
    event platformVoteEvent(address platformContractAddr, uint256 timestamp);
    event endorserVoteEvent(address endorserContractAddr, uint256 timestamp);

    /** @dev 檢查是否為合約擁有者 */
    modifier ckAssetsOwner(){
        require(msg.sender == assetsOwner, "請檢查是否為合約擁有者");
        _;
    }
    modifier ckPlatform(){
        require(msg.sender == platformContractAddr, "請檢查是否為平台方合約地址");
        _;
    }

    /** @dev 執行更換eth地址前，三人中有兩人須簽章 */
    function AssetsOwnerVote(uint256 _timeCurrent) external ckAssetsOwner {
        assetsOwner_flag = 1;
        emit assetsOwnerVoteEvent(msg.sender, _timeCurrent);
    }

    function platformVote(uint256 _timeCurrent) external ckPlatform {
        platform_flag = 1;
        emit platformVoteEvent(msg.sender, _timeCurrent);
    }

    function endorsersVote(uint256 _timeCurrent) public {
        require(endorsersContractAddr[0] == msg.sender || endorsersContractAddr[1] == msg.sender || endorsersContractAddr[2] == msg.sender, "請檢查是否為背書人合約地址");
        endorsers_flag = 1;
        emit endorserVoteEvent(msg.sender, _timeCurrent);
    }

    function calculateVotes() public view returns (uint) {
        return (assetsOwner_flag + platform_flag + endorsers_flag);
    }
    /** @dev 重置簽章狀態 */
    function resetVoteStatus() internal {
        assetsOwner_flag = 0;
        platform_flag = 0;
        endorsers_flag = 0;
    }

    /** @dev 更換assetOwner */
    function changeAssetOwner(address _assetOwnerNew, uint256 _timeCurrent) public {
        require(calculateVotes() >= 2, "請確認是否完成多重簽章");
        address _oldAssetOwner = assetsOwner;
        assetsOwner = _assetOwnerNew;
        resetVoteStatus();
        emit changeAssetOwnerEvent(_oldAssetOwner, assetsOwner, _timeCurrent);
    }

    /** @dev 新增endorser */
    function addEndorser(address _newEndorser, uint256 _timeCurrent) public ckAssetsOwner{
        require(endorsersContractAddr.length <= 3, "背書者人數上限為三人");
        endorsersContractAddr.push(_newEndorser);

        emit addEndorsersEvent(_newEndorser, _timeCurrent);
    }

    /** @dev 更換endorser */
    function changeEndorsers(address _oldEndorser, address _newEndorser, uint256 _timeCurrent) public ckAssetsOwner{
        for(uint i = 0;  i < endorsersContractAddr.length; i++){
            if(endorsersContractAddr[i] == _oldEndorser){
                endorsersContractAddr[i] = _newEndorser;
                emit changeEndorsersEvent(_oldEndorser, _newEndorser, _timeCurrent);
            }
        }
    }

    /** @dev 取得vote */
    function getAssetsOwnerVote() public view returns(uint){
        return assetsOwner_flag;
    }

    function getPlatformVote() public view returns(uint){
        return platform_flag;
    }

    function getEndorsersVote() public view returns(uint){
        return endorsers_flag;
    }

    /** @dev 取得person */
    function getAssetsOwner() public view returns(address){
        return assetsOwner;
    }

    function getPlatformContractAddr() public view returns(address){
        return platformContractAddr;
    }

    function getEndorsers() public view returns(address[] memory){
        address[] memory _endorsers = new address[](endorsersContractAddr.length);
        for (uint i = 0; i < endorsersContractAddr.length; i++) {
            _endorsers[i] = endorsersContractAddr[i];
        }

        return _endorsers;
    }

}


contract AssetBook is MultiSig {
    using SafeMath for uint256;
    using AddressUtils for address;

    /** @dev asset資料結構 */
    struct Asset{
        address assetAddr; //token合約位址
        string assetSymbol; //assetSymbol
        uint assetAddrIndex; // starting from 1
        uint[] ids; //擁有的TokenId
        uint assetAmount; //Token數量
        mapping (uint => uint) timeIndexToTokenId;//For First In First Out(FIFO) exchange rule
        uint timeIndexStart;
        uint timeIndexEnd;
        bool isWriteApproved;
        bool isInitialized;
    }
    mapping (address => Asset) assets;//assetAddress
    uint public assetCindex;//count and index of assets, and each asset has an assetAddr
    //address[] assetAddrList; //asset address list ... list will need for loop to check each one to prevent duplicated entries!
    mapping (uint => address) assetIndexToAddr;//each assset address has an unique index in this asset contract

    /** @dev asset相關event */
    event createAssetContractEvent(address assetsOwner, address platformContractAddr, uint timestamp);
    //event addAssetEvent(address assetAddr, string assetSymbol, uint assetAmount, uint[] ids ,uint timestamp);
    event transferAssetEvent(address to, string assetSymbol, uint _assetId, uint tokenBalance, uint[] remainIDs, uint timestamp);
    event transferAssetEventBatch(address to, string assetSymbol, uint[] _assetId, uint tokenBalance, uint[] remainIDs, uint timestamp);

    //"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902201045
    constructor (address _assetsOwner, address _platform, uint256 _timeCurrent) public {
        assetsOwner = _assetsOwner;
        platformContractAddr = _platform;
        emit createAssetContractEvent(_assetsOwner, _platform, _timeCurrent);
    }

    modifier ckAssetAddr(address _assetAddr) {
        require(_assetAddr != address(0), "_assetAddr should not be zero");
        require(_assetAddr.isContract(), "_assetAddr has to contain a contract");
        _;
    }
    modifier restricted() {
        require(msg.sender == platformContractAddr || msg.sender == assetsOwner, "check if sender is approved");
        _;
    }

    function ckAssetAdded(address _assetAddr) public view {
        require(assets[_assetAddr].assetAddr != address(0), "_assetAddr should have been added into the AssetBook smart contract");
    }

    function setAssetCtrtApproval(address _assetAddr, bool _isWriteApproved) public ckPlatform {
        assets[_assetAddr].isWriteApproved = _isWriteApproved;
    }

    /*
    struct Asset{
        address assetAddr; //token合約位址
        string assetSymbol; //assetSymbol
        uint assetAddrIndex; // starting from 1
        uint[] ids; //擁有的TokenId
        uint assetAmount; //Token數量
        mapping (uint => uint) timeIndexToTokenId;//For First In First Out(FIFO) exchange rule
        uint timeIndexStart;
        uint timeIndexEnd;
        bool isWriteApproved;
        bool isInitialized;
    }*/
    /** @dev 新增token(當 erc721_token 分配到 AssetBookCtrt 的時候記錄起來)
    For ERC721SPLC to call this when minting new tokens */
    function addAsset(address _assetAddr) external {
        require(msg.sender == platformContractAddr || assets[msg.sender].isWriteApproved, "only approved asset contract can call this function");
        require(!assets[_assetAddr].isInitialized, "this _assetAddr has been initialized already");
        assets[_assetAddr].isInitialized = true;
        require(_assetAddr != address(0), "_assetAddr should not be zero");
        require(_assetAddr.isContract(), "_assetAddr has to contain a contract");

        //add an asset address
        ERC721SPLCITF_assetbook _erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        assets[_assetAddr].assetAddr = _assetAddr;
        assets[_assetAddr].assetSymbol = _erc721.symbol();

        assetCindex = assetCindex.add(1);
        assets[_assetAddr].assetAddrIndex = assetCindex;
        assetIndexToAddr[assetCindex] = _assetAddr;

        assets[_assetAddr].ids = _erc721.get_ownerToIds(address(this));
        assets[_assetAddr].assetAmount = _erc721.balanceOf(address(this));

        uint assetIdsLength = assets[_assetAddr].ids.length;
        require(assetIdsLength > 0, "assets[_assetAddr].ids has to be none empty");
        for(uint i = 0; i < assetIdsLength; i++) {
            assets[_assetAddr].timeIndexToTokenId[i] = assets[_assetAddr].ids[i];
        }
        assets[_assetAddr].timeIndexEnd = assetIdsLength.sub(1);
    }
    function deleteAsset(address _assetAddr) public ckAssetAddr(_assetAddr) restricted {
        //delete an asset address
        require(assets[_assetAddr].isInitialized, "this _assetAddr has not been initialized");
        assets[_assetAddr].isInitialized = false;

        assetIndexToAddr[assets[_assetAddr].assetAddrIndex] = assetIndexToAddr[assetCindex];
        delete assetIndexToAddr[assetCindex];
        assetCindex = assetCindex.sub(1);
        //delete assets[_assetAddr].assetAddrIndex;
        delete assets[_assetAddr].assetAddr;
        delete assets[_assetAddr].assetSymbol;
        delete assets[_assetAddr].ids;
        delete assets[_assetAddr].assetAmount;
    }
    //copy asset contract info without preserving buy/sell sequence for FIFO accounting purpose
    function updateReset(address _assetAddr) public ckAssetAddr(_assetAddr){
        require(msg.sender == platformContractAddr || assets[msg.sender].isWriteApproved, "only approved asset contract can call this function");

        ERC721SPLCITF_assetbook _erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        assets[_assetAddr].assetAddr = _assetAddr;
        assets[_assetAddr].assetSymbol = _erc721.symbol();
        //assets[_assetAddr].assetAddrIndex; ???
        assets[_assetAddr].ids = _erc721.get_ownerToIds(address(this));
        assets[_assetAddr].assetAmount = _erc721.balanceOf(address(this));

        uint assetIdsLength = assets[_assetAddr].ids.length;
        require(assetIdsLength > 0, "assets[_assetAddr].ids has to be none empty");
        for(uint i = 0; i < assetIdsLength; i++) {
            assets[_assetAddr].timeIndexToTokenId[i] = assets[_assetAddr].ids[i];
        }
        assets[_assetAddr].timeIndexStart = 0;
        assets[_assetAddr].timeIndexEnd = assetIdsLength.sub(1);
    }
    /*struct Asset{
        address assetAddr; //token合約位址
        string assetSymbol; //assetSymbol
        uint assetAddrIndex; // starting from 1
        uint[] ids; //擁有的TokenId
        uint assetAmount; //Token數量
        mapping (uint => uint) timeIndexToTokenId;//For First In First Out(FIFO) exchange rule
        uint timeIndexStart;
        uint timeIndexEnd;
        bool isWriteApproved;
        bool isInitialized;
    }*/

    //preserving buy/sell sequence for FIFO accounting purpose
    //to receive assets and give timeIndex to each received asset
    function updateAssetSymbol(address _assetAddr) public ckAssetAddr(_assetAddr) restricted {
        ERC721SPLCITF_assetbook _erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
            assets[_assetAddr].assetSymbol = _erc721.symbol();
    }
    function updateReceivedAsset(address _assetAddr) public ckAssetAddr(_assetAddr) restricted {
        ERC721SPLCITF_assetbook _erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        assets[_assetAddr].assetAmount = _erc721.balanceOf(address(this));

        if(_erc721.balanceOf(address(this)) > assets[_assetAddr].assetAmount) {
            uint increase = _erc721.balanceOf(address(this)).sub(assets[_assetAddr].assetAmount);
            assets[_assetAddr].timeIndexEnd = assets[_assetAddr].timeIndexEnd.add(increase);

            uint assetIdsLengthOld = assets[_assetAddr].ids.length;
            uint[] memory assetIds = _erc721.get_ownerToIds(address(this));
            uint assetIdsLength = assetIds.length;

            //address[] memory outTokenIds = new address[](increase);
            for(uint i=assetIdsLengthOld; i <= assetIdsLength.sub(1); i++) {
                assets[_assetAddr].timeIndexToTokenId[i] = assetIds[i];
            }
            assets[_assetAddr].ids = _erc721.get_ownerToIds(address(this));
        }
    }

    /*struct Asset{
        address assetAddr; //token合約位址
        string assetSymbol; //assetSymbol
        uint assetAddrIndex; // starting from 1
        uint[] ids; //擁有的TokenId
        uint assetAmount; //Token數量
        mapping (uint => uint) timeIndexToTokenId;//For First In First Out(FIFO) exchange rule
        uint timeIndexStart;
        uint timeIndexEnd;
        bool isWriteApproved;
        bool isInitialized;
    }*/
    /** @dev 提領token: will break token sequence => updateReset to reset asset sequence!!! */
    //=> start from the minimum index according to First In First Out principle!!!
    function transferAsset(address _assetAddr, uint _tokenId, address _to, uint256 _timeCurrent) 
        public ckAssetsOwner ckAssetAddr(_assetAddr){
        ckAssetAdded(_assetAddr);
        ERC721SPLCITF_assetbook _erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        require(_erc721.ownerOf(_tokenId) == address(this), "請確認欲轉移的token_id");
        uint tokenBalance = _erc721.balanceOf(address(this));//_assetAddr.balances(this);
        require(tokenBalance > 0, "tokenBalance should be > 0");

        _erc721.safeTransferFrom(address(this), _to, _tokenId);
        updateReset(_assetAddr);
        emit transferAssetEvent(_to, assets[_assetAddr].assetSymbol, _tokenId, tokenBalance, assets[_assetAddr].ids, _timeCurrent);
    }
    function transferAssetBatch(address _assetAddr, uint _amount, address _to, uint256 _timeCurrent) 
        public ckAssetsOwner ckAssetAddr(_assetAddr){
        ckAssetAdded(_assetAddr);
        ERC721SPLCITF_assetbook _erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        uint tokenBalance = _erc721.balanceOf(address(this));
        require(_amount > 0, "_amount must be > 0");
        require(tokenBalance > 0, "tokenBalance must be > 0");
        require(_amount <= tokenBalance, "_amount must be <= tokenBalance");

        uint timeIndexEndReq = assets[_assetAddr].timeIndexStart.add(_amount).sub(1);
        require(timeIndexEndReq <= assets[_assetAddr].timeIndexEnd, "not enough assets to send _amount from timeIndexStart to timeIndexEndReq");
        //timeIndexStart + amount - 1 <= timeIndexEnd

        uint[] memory tokenIds;
        for(uint i = assets[_assetAddr].timeIndexStart; i <= timeIndexEndReq; i++) {
            uint tokenId = assets[_assetAddr].timeIndexToTokenId[i];
            require(tokenId > 0, "tokenId > 0");
            require(_erc721.ownerOf(tokenId) == address(this), "請確認欲轉移的token_id");
            _erc721.safeTransferFrom(address(this), _to, tokenId);
            delete assets[_assetAddr].timeIndexToTokenId[i];
            tokenIds[i.sub(assets[_assetAddr].timeIndexStart)] = tokenId;
        }
        assets[_assetAddr].timeIndexStart = timeIndexEndReq.add(1);
        assets[_assetAddr].ids = _erc721.get_ownerToIds(address(this));
        assets[_assetAddr].assetAmount = _erc721.balanceOf(address(this));

        emit transferAssetEventBatch(_to, assets[_assetAddr].assetSymbol, tokenIds, tokenBalance, assets[_assetAddr].ids, _timeCurrent);
    }

    /*struct Asset{
        address assetAddr; //token合約位址
        string assetSymbol; //assetSymbol
        uint assetAddrIndex; // starting from 1
        uint assetAmount; //Token數量
        uint[] ids; //擁有的TokenId
        mapping (uint => uint) timeIndexToTokenId;//For First In First Out(FIFO) exchange rule
        uint timeIndexStart;
        uint timeIndexEnd;
        bool isWriteApproved;
        bool isInitialized;
    }*/
    /** @dev get assets info */
    function getAsset(address _assetAddr) public view ckAssetAddr(_assetAddr) 
    returns (string memory, uint, uint, uint, uint, bool, bool){
        Asset memory asset = assets[_assetAddr];
        return (asset.assetSymbol, asset.assetAddrIndex, 
        asset.assetAmount,  
        asset.timeIndexStart, 
        asset.timeIndexEnd, asset.isWriteApproved, asset.isInitialized);
    }
    function getAssetIds(address _assetAddr) public view ckAssetAddr(_assetAddr) 
    returns (uint[] memory, uint[] memory) {
        ERC721SPLCITF_assetbook _erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        return (assets[_assetAddr].ids, _erc721.get_ownerToIds(address(this))); 
    }
    function getAssetTimeIndexedTokenIds(address _assetAddr, uint _timeIndexStart, uint _num) 
    public view ckAssetAddr(_assetAddr) returns (uint[] memory){
        require(_num > 0, "_num must be > 0");
        require(_timeIndexStart.add(_num).sub(1) <= assets[_assetAddr].timeIndexEnd, 
        "_timeIndexStart.add(_num).sub(1) must be equal to/lesser than timeIndexEnd");
        uint[] memory outTokenIds = new uint[](_num);
        for(uint i=0; i < _timeIndexStart.add(_num); i++) {
            outTokenIds[i] = assets[_assetAddr].timeIndexToTokenId[_timeIndexStart.add(i)];
        }
        return outTokenIds;
    }
    function getAssetTimeIndexedTokenIds(address _assetAddr) 
    public view ckAssetAddr(_assetAddr) returns (uint[] memory){
        uint _num = assets[_assetAddr].assetAmount;
        uint _timeIndexStart = assets[_assetAddr].timeIndexStart;
        require(_num > 0, "_num must be > 0");
        require(_timeIndexStart.add(_num).sub(1) <= assets[_assetAddr].timeIndexEnd, 
        "_timeIndexStart.add(_num).sub(1) must be equal to/lesser than timeIndexEnd");
        uint[] memory outTokenIds = new uint[](_num);
        for(uint i=0; i < _timeIndexStart.add(_num); i++) {
            outTokenIds[i] = assets[_assetAddr].timeIndexToTokenId[_timeIndexStart.add(i)];
        }
        return outTokenIds;
    }

    /** @dev get asset number */
    function getAssetCount() public view returns(uint assetCount){
        return assetCindex;//assetAddrList.length;
    }

    /** @dev get all assetAddr */
    function getAssetAddrList() public view returns(address[] memory){
        address[] memory assetAddrList = new address[](assetCindex);
        for(uint i=0; i < assetCindex; i++) {
            assetAddrList[i] = assetIndexToAddr[i+1];
        }
        return (assetAddrList);
    }
    function getAssetAddrList(uint start, uint num) public view returns(address[] memory){
        address[] memory assetAddrList = new address[](num);
        for(uint i=start; i < start.add(num); i++) {
            assetAddrList[i] = assetIndexToAddr[i+1];
        }
        return (assetAddrList);
    }
    
    /** @dev AssetBookCtrt's endorserVote */
    function voteAssetContract(address _assetAddr, uint256 _timeCurrent) public ckAssetsOwner ckAssetAddr(_assetAddr){
        AssetBook assetBook = AssetBook(address(uint160(_assetAddr)));
        assetBook.endorsersVote(_timeCurrent);
    }

    bytes4 constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;
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
      unless throwing
      which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    */
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external pure returns(bytes4) {
        require(_operator != address(0), 'operator address should not be zero');
        require(_from != address(0), 'from address should not be zero');// _from address is contract address if minting tokens
        require(_tokenId > 0, 'tokenId should be greater than zero');
        /*the following will fail if data is empty!!!
        uint32 u = uint32(data[3]) + (uint32(data[2]) << 8) + (uint32(data[1]) << 16) + (uint32(data[0]) << 24);
        tkn.sig = bytes4(u);//tkn.sig is 4 bytes signature of function
        if data of token transaction is a function execution
        TKN has element of bytes4 sig;
        */
        return MAGIC_ON_ERC721_RECEIVED;
    }
/** @dev string[] 不能回傳 */
/*
    //get all assets
    function getAllAssets() public ckAssetsOwner returns (address[], string[], uint[] ){
        address[] memory assetAddrs = new address[](assetAddrList.length);
        string[] memory assetSymbols = new string[](assetAddrList.length);
        uint[]    memory assetAmounts = new uint[](assetsIndex.length);

        for (uint i = 0; i < assetAddrList.length; i++) {
            Asset storage asset = assets[assetAddrList[i]];
            assetAddrs[i] = asset.assetAddr;
            assetSymbols[i] = asset.assetSymbol;
            assetAmounts[i] = asset.assetAmount;
        }

        return (assetAddrs, assetSymbols, assetAmounts);
    }

*/
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