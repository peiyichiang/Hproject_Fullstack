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
    event assetsOwnerSignEvent(address assetsOwner, uint256 timestamp);
    event platformSignEvent(address platformContractAddr, uint256 timestamp);
    event endorserSignEvent(address endorserContractAddr, uint256 timestamp);

    /** @dev 檢查是否為合約擁有者 */
    modifier isAssetsOwner(){
        require(msg.sender == assetsOwner, "請檢查是否為合約擁有者");
        _;
    }

    /** @dev 檢查是否為平台方 */
    modifier isPlatform(){
        require(msg.sender == platformContractAddr, "請檢查是否為平台方合約地址");
        _;
    }

    /** @dev 檢查是否為背書者 */
    modifier isEndorsers(){
        require(endorsersContractAddr[0] == msg.sender || endorsersContractAddr[1] == msg.sender || endorsersContractAddr[2] == msg.sender, "請檢查是否為背書人合約地址");
        _;
    }

    /** @dev 執行更換eth地址前，三人中有兩人須簽章 */
    function AssetsOwnerSign(uint256 _timeCurrent) external isAssetsOwner {
        assetsOwner_flag = 1;
        emit assetsOwnerSignEvent(msg.sender, _timeCurrent);
    }

    function platformSign(uint256 _timeCurrent) external {
        require(msg.sender == platformContractAddr, "請檢查是否為平台方合約地址");
        platform_flag = 1;
        emit platformSignEvent(msg.sender, _timeCurrent);
    }

    function endorsersSign(uint256 _timeCurrent) public isEndorsers {
        endorsers_flag = 1;
        emit endorserSignEvent(msg.sender, _timeCurrent);
    }

    modifier isMultiSignature(){
        require(assetsOwner_flag+platform_flag+endorsers_flag >= 2, "請確認是否完成多重簽章");
        _;
    }

    /** @dev 重置簽章狀態 */
    function resetSignStatus() internal {
        assetsOwner_flag = 0;
        platform_flag = 0;
        endorsers_flag = 0;
    }

    /** @dev 更換assetOwner */
    function changeAssetOwner(address _to, uint256 _timeCurrent) public isMultiSignature{
        address _oldAssetOwner = assetsOwner;
        assetsOwner = _to;
        resetSignStatus();

        emit changeAssetOwnerEvent(_oldAssetOwner, assetsOwner, _timeCurrent);
    }

    /** @dev 新增endorser */
    function addEndorser(address _newEndorser, uint256 _timeCurrent) public isAssetsOwner{
        require(endorsersContractAddr.length < 3, "背書者人數上限為三人");
        endorsersContractAddr.push(_newEndorser);

        emit addEndorsersEvent(_newEndorser, _timeCurrent);
    }

    /** @dev 更換endorser */
    function changeEndorsers(address _oldEndorser, address _newEndorser, uint256 _timeCurrent) public isAssetsOwner{
        for(uint i = 0;  i < endorsersContractAddr.length; i++){
            if(endorsersContractAddr[i] == _oldEndorser){
                endorsersContractAddr[i] = _newEndorser;
                emit changeEndorsersEvent(_oldEndorser, _newEndorser, _timeCurrent);
            }
        }
    }

    /** @dev 取得sign */
    function getAssetsOwnerSign() public view returns(uint){
        return assetsOwner_flag;
    }

    function getPlatformSign() public view returns(uint){
        return platform_flag;
    }

    function getEndorsersSign() public view returns(uint){
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


contract AssetContract is MultiSig {
    using SafeMath for uint256;

    /** @dev asset資料結構 */
    struct Asset{
        address assetAddr; //token合約位址
        uint assetAddrIndex; // starting from 1
        string assetSymbol; //assetSymbol
        uint[] ids; //擁有的TokenId
        uint assetAmount; //Token數量
    }

    mapping (address => Asset) assets;//assetAddress
    uint public assetCindex;//count and index of assets, and each asset has an assetAddr
    //address[] assetAddrList; //asset address list ... list will need for loop to check each one to prevent duplicated entries!
    mapping (uint => address) assetIndexToAddr;//each assset address has an unique index in this asset contract

    /** @dev asset相關event */
    event createAssetContractEvent(address assetsOwner, address platformContractAddr, uint timestamp);
    //event addAssetEvent(address assetAddr, string assetSymbol, uint assetAmount, uint[] ids ,uint timestamp);
    event transferAssetEvent(address to, string assetSymbol, uint _assetId, uint remainAmount, uint[] remainIDs, uint timestamp);

    //"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902201045
    constructor (address _assetsOwner, address _platform, uint256 _timeCurrent) public {
        assetsOwner = _assetsOwner;
        platformContractAddr = _platform;
        emit createAssetContractEvent(_assetsOwner, _platform, _timeCurrent);
    }

    /*
    struct Asset{
        address assetAddr; //asset合約位址
        uint assetAddrIndex; // starting from 1
        string assetSymbol; //assetSymbol
        uint[] ids; //擁有的TokenId
        uint assetAmount; //Token數量
    }*/
    /** @dev 新增token(當 erc721_token 分配到 AssetContract 的時候記錄起來) */
    function updateAsset(address _assetAddr) public {
        ERC721SPLCITF_assetbook _erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));

        if (assets[_assetAddr].assetAmount < _erc721.balanceOf(address(this))){
            //increase in amount
            if (assets[_assetAddr].assetAmount == 0) {
                //adding a new asset address
                assets[_assetAddr].assetAddr = _assetAddr;
                assets[_assetAddr].assetSymbol = _erc721.symbol();

                assetCindex = assetCindex.add(1);
                assets[_assetAddr].assetAddrIndex = assetCindex;
                assetIndexToAddr[assetCindex] = _assetAddr;
                //assetAddrList.push(_assetAddr);
            }
            assets[_assetAddr].ids = _erc721.get_ownerToIds(address(this));
            assets[_assetAddr].assetAmount = _erc721.balanceOf(address(this));
        } else {
            if (assets[_assetAddr].assetAmount > _erc721.balanceOf(address(this))){
                //decrease in amount
                if (_erc721.balanceOf(address(this)) == 0) {
                    //deleting an asset address
                    assetIndexToAddr[assets[_assetAddr].assetAddrIndex] = assetIndexToAddr[assetCindex];
                    delete assetIndexToAddr[assetCindex];
                    assetCindex = assetCindex.sub(1);
                    delete assets[_assetAddr].assetAddrIndex;
                    delete assets[_assetAddr].assetAddr;
                    delete assets[_assetAddr].assetSymbol;
                    delete assets[_assetAddr].ids;
                    delete assets[_assetAddr].assetAmount;
                } else {
                    assets[_assetAddr].ids = _erc721.get_ownerToIds(address(this));
                    assets[_assetAddr].assetAmount = _erc721.balanceOf(address(this));
                }
            }
        }
        // emit addAssetEvent(assets[_assetAddr].assetAddr, assets[_assetAddr].assetSymbol, assets[_assetAddr].assetAmount, assets[_assetAddr].ids, _timeCurrent);
    }


    /** @dev 提領token */
    //=> start from the minimum index according to First In First Out principle!!!
    function transferAsset(address _assetAddr, uint _tokenId, address _to, uint256 _timeCurrent) public isAssetsOwner {
        ERC721SPLCITF_assetbook _erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        require(_erc721.ownerOf(_tokenId) == address(this), "請確認欲轉移的token_id");

        uint remainAmount = _erc721.balanceOf(address(this));//_assetAddr.balances(this);
        _erc721.safeTransferFrom(address(this), _to, _tokenId);
        updateAsset(_assetAddr);
        emit transferAssetEvent(_to, assets[_assetAddr].assetSymbol, _tokenId, remainAmount, assets[_assetAddr].ids, _timeCurrent);
    }

    /** @dev get assets info */
    function getAsset(address _assetAddr) public view returns (string memory, uint, uint[] memory){
        return (assets[_assetAddr].assetSymbol, assets[_assetAddr].assetAmount, assets[_assetAddr].ids);
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
    
    /** @dev sign AssetContract's endorserSign */
    function signAssetContract(address _assetContractAddr, uint256 _timeCurrent) public isAssetsOwner{
        AssetContract _multiSig = AssetContract(address(uint160(_assetContractAddr)));
        _multiSig.endorsersSign(_timeCurrent);
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
    function getAllAssets() public isAssetsOwner returns (address[], string[], uint[] ){
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

