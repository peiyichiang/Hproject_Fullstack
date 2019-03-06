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
    using AddressUtils for address;

    address public assetOwner; /** @dev 用戶 address */
    address public platformContractAddr; /** @dev 平台方 platformContractAddr */
    address[] public endorsersContractAddr; /** @dev 背書者的 assetContractAddr (一到三個人) */
    uint public assetOwner_flag;
    uint public platform_flag;
    uint public endorsers_flag;

    /** @dev multiSig相關event */
    event ChangeAssetOwnerEvent(address indexed oldAssetOwner, address indexed newAssetOwner, uint256 timestamp);
    event ChangeEndorsersEvent(address indexed oldEndorsers, address indexed newEndorsers, uint256 timestamp);
    event AddEndorsersEvent(address indexed endorsers, uint256 timestamp);
    event AssetOwnerVoteEvent(address indexed assetOwner, uint256 timestamp);
    event PlatformVoteEvent(address indexed platformContractAddr, uint256 timestamp);
    event EndorserVoteEvent(address indexed endorserContractAddr, uint256 timestamp);

    //"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c"
    constructor (address _assetOwner, address _platformContractAddr) public {
        assetOwner = _assetOwner;
        platformContractAddr = _platformContractAddr;
    }
    /** @dev 檢查是否為合約擁有者 */
    modifier ckAssetOwner(){
        require(msg.sender == assetOwner, "sender must be assetOwner");
        _;
    }
    modifier ckAssetAddr(address _assetAddr) {
        require(_assetAddr != address(0), "_assetAddr should not be zero");
        require(_assetAddr.isContract(), "_assetAddr has to contain a contract");
        _;
    }

    /** @dev 執行更換eth地址前，三人中有兩人須簽章 */
    function AssetOwnerVote(uint256 _timeCurrent) external ckAssetOwner {
        assetOwner_flag = 1;
        emit AssetOwnerVoteEvent(msg.sender, _timeCurrent);
    }

    function platformVote(uint256 _timeCurrent) external {
        require(msg.sender == platformContractAddr, "sender must be Platform Contract");
        platform_flag = 1;
        emit PlatformVoteEvent(msg.sender, _timeCurrent);
    }

    function endorsersVote(uint256 _timeCurrent) external {
        require(endorsersContractAddr[0] == msg.sender || endorsersContractAddr[1] == msg.sender || endorsersContractAddr[2] == msg.sender, "sender must be one of the endorsers");
        endorsers_flag = 1;
        emit EndorserVoteEvent(msg.sender, _timeCurrent);
    }

    function calculateVotes() public view returns (uint) {
        return (assetOwner_flag + platform_flag + endorsers_flag);
    }
    /** @dev 重置簽章狀態 */
    function resetVoteStatus() internal {
        assetOwner_flag = 0;
        platform_flag = 0;
        endorsers_flag = 0;
    }

    /** @dev 更換assetOwner */
    function changeAssetOwner(address _assetOwnerNew, uint256 _timeCurrent) external {
        require(calculateVotes() >= 2, "vote count must be > 2");
        address _oldAssetOwner = assetOwner;
        assetOwner = _assetOwnerNew;
        resetVoteStatus();
        emit ChangeAssetOwnerEvent(_oldAssetOwner, assetOwner, _timeCurrent);
    }

    /** @dev 新增endorser */
    function addEndorser(address _newEndorser, uint256 _timeCurrent) public ckAssetOwner{
        require(endorsersContractAddr.length <= 3, "endorser count must be <= 3");
        endorsersContractAddr.push(_newEndorser);
        emit AddEndorsersEvent(_newEndorser, _timeCurrent);
    }

    /** @dev 更換endorser */
    function changeEndorsers(address _oldEndorser, address _newEndorser, uint256 _timeCurrent) public ckAssetOwner{
        for(uint i = 0;  i < endorsersContractAddr.length; i++){
            if(endorsersContractAddr[i] == _oldEndorser){
                endorsersContractAddr[i] = _newEndorser;
                emit ChangeEndorsersEvent(_oldEndorser, _newEndorser, _timeCurrent);
            }
        }
    }
    function voteAssetContract(address _assetAddr, uint256 _timeCurrent) public ckAssetOwner ckAssetAddr(_assetAddr){
        MultiSig multiSig = MultiSig(address(uint160(_assetAddr)));
        multiSig.endorsersVote(_timeCurrent);
    }

    function getAssetOwner() external view returns(address){
        return assetOwner;
    }
    function getPlatformContractAddr() external view returns(address){
        return platformContractAddr;
    }
    function getEndorsers() public view returns(address[] memory){
        return endorsersContractAddr;
    }

}

interface MultiSigITF_assetbook {
    function getAssetOwner() external view returns(address);
    function changeAssetOwner(address _assetOwnerNew, uint256 _timeCurrent) external;
    function getPlatformContractAddr() external view returns(address);
}

contract AssetBook {
    using SafeMath for uint256;
    using AddressUtils for address;
    address public assetOwner;
    address public multiSigContract;
    address public platformContractAddr;

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
        bool isApprovedToWrite;//by platform to approve writing from the asset contract
        bool isInitialized;
    }
    mapping (address => Asset) assets;//assetAddress
    uint public assetCindex;//count and index of assets, and each asset has an assetAddr
    //address[] assetAddrList; //asset address list ... list will need for loop to check each one to prevent duplicated entries!
    mapping (uint => address) assetIndexToAddr;//starts from 1, 2... assetCindex. each assset address has an unique index in this asset contract

    /** @dev asset相關event */
    event DeployAssetContractEvent(address assetOwner, address multiSigContractAddr, address platformContractAddr, uint timestamp);
    //event addAssetEvent(address assetAddr, string assetSymbol, uint assetAmount, uint[] ids ,uint timestamp);
    event TransferAssetEvent(address to, string assetSymbol, uint _assetId, uint tokenBalance, uint timestamp);
    event TransferAssetBatchEvent(address to, string assetSymbol, uint[] _assetId, uint tokenBalance, uint timestamp);


    //"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 201903061045
    constructor (address _multiSigContract, uint256 _timeCurrent) public {
        multiSigContract = _multiSigContract;
        emit DeployAssetContractEvent(assetOwner, _multiSigContract, platformContractAddr, _timeCurrent);
    }
    function updateAssetOwner() external {
        MultiSigITF_assetbook multiSig = MultiSigITF_assetbook(address(uint160(multiSigContract)));
        assetOwner = multiSig.getAssetOwner();
        platformContractAddr = multiSig.getPlatformContractAddr();
    }
    modifier ckAssetAddr(address _assetAddr) {
        require(_assetAddr != address(0), "_assetAddr should not be zero");
        require(_assetAddr.isContract(), "_assetAddr has to contain a contract");
        _;
    }
    modifier restricted() {
        require(msg.sender == platformContractAddr || msg.sender == assetOwner, "check if sender is approved");
        _;
    }
    modifier ckAssetOwner(){
        require(msg.sender == assetOwner, "sender must be assetOwner");
        _;
    }
    function ckAssetAdded(address _assetAddr) public view {
        require(assets[_assetAddr].assetAddr != address(0), "_assetAddr should have been added into the AssetBook smart contract");
    }
    function setAssetCtrtApproval(address _assetAddr, bool _isApprovedToWrite) external {
        require(msg.sender == platformContractAddr, "sender must be Platform Contract");
        assets[_assetAddr].isApprovedToWrite = _isApprovedToWrite;
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
        bool isInitialized;
    }*/
    /** @dev 新增token(當 erc721_token 分配到 AssetBookCtrt 的時候記錄起來)
    For ERC721SPLC-addNFToken(address _to, uint256 _tokenId) to call this when minting new tokens */
    function addAsset(address _assetAddr, string calldata _symbol, uint _tokenId, uint _balance) external {
        require(assets[_assetAddr].isApprovedToWrite || msg.sender == platformContractAddr, "Platform must approve writing from asset contract, or platformContractAddr can call this function");
        require(_assetAddr != address(0), "_assetAddr should not be zero");
        require(_assetAddr.isContract(), "_assetAddr has to contain a contract");

        if(!assets[_assetAddr].isInitialized){
            assets[_assetAddr].isInitialized = true;
            assets[_assetAddr].assetAddr = _assetAddr;
            assets[_assetAddr].assetSymbol = _symbol;
        }

        assetCindex = assetCindex.add(1);
        assets[_assetAddr].assetAddrIndex = assetCindex;
        assetIndexToAddr[assetCindex] = _assetAddr;

        assets[_assetAddr].ids.push(_tokenId);
        assets[_assetAddr].assetAmount = _balance;

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
    function updateReset(address _assetAddr) public ckAssetAddr(_assetAddr) restricted {

        ERC721SPLCITF_assetbook erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        assets[_assetAddr].assetAddr = _assetAddr;
        assets[_assetAddr].assetSymbol = erc721.symbol();
        //assets[_assetAddr].assetAddrIndex; ???
        uint assetIdsLengthOld = assets[_assetAddr].ids.length;
        assets[_assetAddr].ids = erc721.get_ownerToIds(address(this));
        assets[_assetAddr].assetAmount = erc721.balanceOf(address(this));

        uint assetIdsLength = assets[_assetAddr].ids.length;
        if (assetIdsLength > 0) {
            for(uint i = 0; i < assetIdsLength; i++) {
                assets[_assetAddr].timeIndexToTokenId[i] = assets[_assetAddr].ids[i];
            }
            assets[_assetAddr].timeIndexEnd = assetIdsLength.sub(1);
        } else {
            assets[_assetAddr].timeIndexEnd = 0;
        }
        assets[_assetAddr].timeIndexStart = 0;

        if (assetIdsLengthOld > assetIdsLength){
            for(uint i = assetIdsLength; i < assetIdsLengthOld; i++) {
                delete assets[_assetAddr].timeIndexToTokenId[i];
            }
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
        bool isInitialized;
    }*/

    //preserving buy/sell sequence for FIFO accounting purpose
    //to receive assets and give timeIndex to each received asset
    function updateAssetTokenDetails(address _assetAddr) public ckAssetAddr(_assetAddr) restricted {
        ERC721SPLCITF_assetbook erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        assets[_assetAddr].assetSymbol = erc721.symbol();
        assets[_assetAddr].ids = erc721.get_ownerToIds(address(this));
        assets[_assetAddr].assetAmount = erc721.balanceOf(address(this));
    }

    function updateReceivedAsset(address _assetAddr) public ckAssetAddr(_assetAddr) restricted {
        ERC721SPLCITF_assetbook erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));

        uint tokenBalanceOf = erc721.balanceOf(address(this));
        if(tokenBalanceOf > assets[_assetAddr].assetAmount) {

            uint assetIdsLengthOld = assets[_assetAddr].ids.length;
            uint[] memory assetIds = erc721.get_ownerToIds(address(this));
            uint assetIdsLength = assetIds.length;
            for(uint i = assetIdsLengthOld; i < assetIdsLength; i++) {
                assets[_assetAddr].timeIndexToTokenId[i] = assetIds[i];
            }

            uint increase1 = assetIdsLength.sub(assetIdsLengthOld);
            uint increase2 = tokenBalanceOf.sub(assets[_assetAddr].assetAmount);
            require(increase1 == increase2, "increased amounts have to be the same in the token contract");
            //uint timeIndexEndOld = assets[_assetAddr].timeIndexEnd
            assets[_assetAddr].timeIndexEnd = assetIdsLength.sub(1);
            assets[_assetAddr].ids = assetIds;
            assets[_assetAddr].assetAmount = tokenBalanceOf;
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
        bool isInitialized;
    }*/
    /** @dev 提領token: will break token sequence => updateReset to reset asset sequence!!! */
    function transferAsset(address _assetAddr, uint _tokenId, address _to, uint256 _timeCurrent) 
        public ckAssetOwner ckAssetAddr(_assetAddr){
        ckAssetAdded(_assetAddr);
        ERC721SPLCITF_assetbook erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        require(erc721.ownerOf(_tokenId) == address(this), "check if this contract owns this tokenId");

        uint tokenBalanceOf = erc721.balanceOf(address(this));
        require(tokenBalanceOf > 0, "tokenBalanceOf should be > 0");

        erc721.safeTransferFrom(address(this), _to, _tokenId);
        updateAssetTokenDetails(_assetAddr);
        emit TransferAssetEvent(_to, assets[_assetAddr].assetSymbol, _tokenId, tokenBalanceOf, _timeCurrent);
    }

    //transfer from the minimum timeIndex according to First In First Out principle
    function transferAssetBatch(address _assetAddr, uint amount, address _to, uint256 _timeCurrent) 
        public ckAssetOwner ckAssetAddr(_assetAddr){
        ckAssetAdded(_assetAddr);
        ERC721SPLCITF_assetbook erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));

        uint tokenBalanceOf = erc721.balanceOf(address(this));
        require(amount > 0, "amount must be > 0");
        require(tokenBalanceOf > 0, "tokenBalanceOf must be > 0");
        require(amount <= tokenBalanceOf, "amount must be <= tokenBalanceOf");

        //---------------==transfer + updateTokenIds
        uint timeIndexStart = assets[_assetAddr].timeIndexStart;
        uint timeIndexEndReq = timeIndexStart.add(amount).sub(1);
        require(timeIndexEndReq <= assets[_assetAddr].timeIndexEnd, "not enough assets to send amount from timeIndexStart to timeIndexEndReq");
        //timeIndexStart + amount - 1 <= timeIndexEnd

        uint[] memory tokenIdsSent = new uint[](amount);
        for(uint i = timeIndexStart; i <= timeIndexEndReq; i++) {

            uint tokenId = assets[_assetAddr].timeIndexToTokenId[i];
            require(tokenId > 0, "tokenId > 0");
            require(erc721.ownerOf(tokenId) == address(this), "check if this contract owns this tokenId");
            
            erc721.safeTransferFrom(address(this), _to, tokenId);
            delete assets[_assetAddr].timeIndexToTokenId[i];
            tokenIdsSent[i.sub(timeIndexStart)] = tokenId;
            //timeIndexedTokenIds[i] = assets[_assetAddr].timeIndexToTokenId[timeIndexStart.add(i)];
        }
        assets[_assetAddr].timeIndexStart = timeIndexEndReq.add(1);
        assets[_assetAddr].ids = getAssetTimeIndexedTokenIds(_assetAddr);
        assets[_assetAddr].assetAmount = assets[_assetAddr].assetAmount.sub(amount);

        emit TransferAssetBatchEvent(_to, assets[_assetAddr].assetSymbol, tokenIdsSent, tokenBalanceOf, _timeCurrent);
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
        bool isInitialized;
    }*/
    /** @dev get assets info */
    function getAsset(address _assetAddr) public view ckAssetAddr(_assetAddr) 
    returns (string memory, uint, uint, uint, uint, bool){
        Asset memory asset = assets[_assetAddr];
        return (asset.assetSymbol, asset.assetAddrIndex, 
        asset.assetAmount, asset.timeIndexStart, 
        asset.timeIndexEnd, asset.isInitialized);
    }
    function getAssetIds(address _assetAddr) public view ckAssetAddr(_assetAddr) 
    returns (uint[] memory, uint[] memory) {
        ERC721SPLCITF_assetbook erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        return (assets[_assetAddr].ids, erc721.get_ownerToIds(address(this))); 
    }
    function getAssetTimeIndexedTokenIds(address _assetAddr, uint timeIndexStart, uint amount) 
    public view ckAssetAddr(_assetAddr) returns (uint[] memory){
        require(amount > 0, "amount must be > 0");
        uint timeIndexEndReq = timeIndexStart.add(amount).sub(1);
        require(timeIndexEndReq <= assets[_assetAddr].timeIndexEnd, 
        "timeIndexEndReq must be equal to/lesser than timeIndexEnd");
        uint[] memory timeIndexedTokenIds = new uint[](amount);
        for(uint i = 0; i <= timeIndexEndReq; i++) {
            timeIndexedTokenIds[i] = assets[_assetAddr].timeIndexToTokenId[timeIndexStart.add(i)];
        }
        return timeIndexedTokenIds;
    }
    function getAssetTimeIndexedTokenIds(address _assetAddr) 
    public view ckAssetAddr(_assetAddr) returns (uint[] memory){
        uint amount = assets[_assetAddr].assetAmount;
        uint timeIndexStart = assets[_assetAddr].timeIndexStart;
        getAssetTimeIndexedTokenIds(_assetAddr, timeIndexStart, amount);
    }

    /** @dev get asset number */
    function getAssetCount() public view returns(uint){
        return assetCindex;//assetAddrList.length;
    }

    /** @dev get all assetAddr */
    function getAssetAddrList() public view returns(address[] memory){
        address[] memory assetAddrList = new address[](assetCindex.add(1));
        for(uint i = 1; i <= assetCindex; i++) {
            assetAddrList[i] = assetIndexToAddr[i];
        }
        return assetAddrList;
    }
    function getAssetAddrList(uint start, uint num) public view returns(address[] memory){
        address[] memory assetAddrList = new address[](num);
        for(uint i = 0; i < num; i++) {
            assetAddrList[i] = assetIndexToAddr[i.add(start)];
        }
        return assetAddrList;
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
    function getAllAssets() public ckAssetOwner returns (address[], string[], uint[] ){
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