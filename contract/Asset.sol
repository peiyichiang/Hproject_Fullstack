pragma solidity ^0.5.3;
//pragma experimental ABIEncoderV2;

//import "https://github.com/kappabooom/h_contract/ERC721_SPLC5.sol";
import "./ERC721_SPLC5.sol";

contract multiSig {
    address internal assetsOwner; /** @dev 用戶 address */
    address internal platformContractAddr; /** @dev 平台方 platformContractAddr */
    address[] internal endorsersContractAddr; /** @dev 背書者的 assetContractAddr (一到三個人) */
    uint private owner_flag;
    uint private platform_flag;
    uint private endorsers_flag;

    /** @dev multiSig相關event */
    event changeAssetOwnerEvent(address indexed oldOwner, address indexed newOwner, uint256 timestamp);
    event changeEndorsersEvent(address indexed oldEndorsers, address indexed newEndorsers, uint256 timestamp);
    event addEndorsersEvent(address indexed endorsers, uint256 timestamp);
    event ownerSignEvent(address owner, uint256 timestamp);
    event platformSignEvent(address platformContractAddr, uint256 timestamp);
    event endorserSignEvent(address endorserContractAddr, uint256 timestamp);

    /** @dev 檢查是否為合約擁有者 */
    modifier isOwner(){
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
    function ownerSign(uint256 _time) public isOwner {
        owner_flag = 1;
        emit ownerSignEvent(msg.sender, _time);
    }

    function platformSign(uint256 _time) public isPlatform {
        platform_flag = 1;
        emit ownerSignEvent(msg.sender, _time);
    }

    function endorsersSign(uint256 _time) public isEndorsers {
        endorsers_flag = 1;
        emit ownerSignEvent(msg.sender, _time);
    }

    modifier isMultiSignature(){
        require(owner_flag+platform_flag+endorsers_flag >= 2, "請確認是否完成多重簽章");
        _;
    }

    /** @dev 重置簽章狀態 */
    function resetSignStatus() internal {
        owner_flag = 0;
        platform_flag = 0;
        endorsers_flag = 0;
    }

    /** @dev 更換assetOwner */
    function changeAssetOwner(address _to, uint256 _time) public isMultiSignature{
        address _oldAssetOwner = assetsOwner;
        assetsOwner = _to;
        resetSignStatus();

        emit changeAssetOwnerEvent(_oldAssetOwner, assetsOwner, _time);
    }

    /** @dev 新增endorser */
    function addEndorser(address _newEndorser, uint256 _time) public isOwner{
        require(endorsersContractAddr.length < 3, "背書者人數上限為三人");
        endorsersContractAddr.push(_newEndorser);

        emit addEndorsersEvent(_newEndorser, _time);
    }

    /** @dev 更換endorser */
    function changeEndorsers(address _oldEndorser, address _newEndorser, uint256 _time) public isOwner{
        for(uint i = 0;  i < endorsersContractAddr.length; i++){
            if(endorsersContractAddr[i] == _oldEndorser){
                endorsersContractAddr[i] = _newEndorser;
                emit changeEndorsersEvent(_oldEndorser, _newEndorser, _time);
            }
        }
    }

    /** @dev 取得sign */
    function getOwnerSign() public view returns(uint){
        return owner_flag;
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


contract AssetContract is multiSig{

    /** @dev asset資料結構 */
    struct Asset{
        address tokenAddr; //token合約位址
        string tokenSymbol; //tokenSymbol
        uint tokenAmount; //Token數量
        uint[] ids; //擁有的TokenId
    }

    mapping (address => Asset) assets;
    address[] assetIndex; //token address list

    /** @dev asset相關event */
    event createAssetContractEvent(address assetsOwner, address platformContractAddr, uint timestamp);
    event addAssetEvent(address tokenAddr, string tokenSymbol, uint tokenAmount, uint[] ids ,uint timestamp);
    event transferAssetEvent(address to, string tokenSymbol, uint _tokenId, uint remainAmount, uint[] remainIDs, uint timestamp);

    constructor (address _assetsOwner, address _platform, uint256 _time) public {
        assetsOwner = _assetsOwner;
        platformContractAddr = _platform;

        emit createAssetContractEvent(_assetsOwner, _platform, _time);
    }

    modifier isAssetsOwner(){
        require(msg.sender == assetsOwner, "請檢查是否為合約擁有者");
        _;
    }

    /** @dev 新增token(當 erc721_token 分配到 AssetContract 的時候記錄起來) */
    function addAsset(address _tokenAddr, uint256 _time) public {
        //use ERC721TOKEN's function (balanceof, getTokenSymbol)
        NFTokenSPLC _erc721 = NFTokenSPLC(address(uint160(_tokenAddr)));

        assets[_tokenAddr].tokenAddr = _tokenAddr;
        assets[_tokenAddr].tokenSymbol = _erc721.symbol();
        assets[_tokenAddr].tokenAmount = _erc721.balanceOf(address(this));
        assets[_tokenAddr].ids = _erc721.get_ownerToIds(address(this));
        assetIndex.push(_tokenAddr);

        emit addAssetEvent(assets[_tokenAddr].tokenAddr, assets[_tokenAddr].tokenSymbol, assets[_tokenAddr].tokenAmount, assets[_tokenAddr].ids, _time);
    }

    /** @dev 提領token */
    function transferAsset(address _tokenAddr, uint _tokenId, address _to, uint256 _time) public isAssetsOwner {
        NFTokenSPLC _erc721 = NFTokenSPLC(address(uint160(_tokenAddr)));
        require(_erc721.ownerOf(_tokenId) == address(this), "請確認欲轉移的token_id");

        uint remainAmount = _erc721.balanceOf(address(this));//_tokenAddr.balances(this);
        _erc721.transferFrom(address(this), _to, _tokenId);
        assets[_tokenAddr].tokenAmount = _erc721.balanceOf(address(this));
        assets[_tokenAddr].ids = _erc721.get_ownerToIds(address(this));

        emit transferAssetEvent(_to, assets[_tokenAddr].tokenSymbol, _tokenId, remainAmount, assets[_tokenAddr].ids, _time);
    }

    /** @dev get tokenAmount */
    function getAsset(address _tokenAddr) public view returns (uint, uint[] memory){
        NFTokenSPLC _erc721 = NFTokenSPLC(address(uint160(_tokenAddr)));

        return (assets[_tokenAddr].tokenAmount, _erc721.get_ownerToIds(address(this)));
    }

    /** @dev get asset number */
    function getAssetCount() public view returns(uint assetCount){
        return assetIndex.length;
    }

    /** @dev get all assetAddr */
    function getAssetIndex() public view returns(address[] memory){
        return (assetIndex);
    }

    /** @dev sign AssetContract's endorserSign */
    function signAssetContract(address _assetContractAddr, uint256 _time) public isAssetsOwner{
        AssetContract _multiSig = AssetContract(address(uint160(_assetContractAddr)));
        _multiSig.endorsersSign(_time);
    }


/** @dev string[] 不能回傳 */
/*
    //get all assets
    function getAllAssets() public isAssetsOwner returns (address[], string[], uint[] ){
        address[] memory tokenAddrs = new address[](assetIndex.length);
        string[] memory tokenSymbols = new string[](assetIndex.length);
        uint[]    memory tokenAmounts = new uint[](assetsIndex.length);

        for (uint i = 0; i < assetIndex.length; i++) {
            Asset storage asset = assets[assetIndex[i]];
            tokenAddrs[i] = asset.tokenAddr;
            tokenSymbols[i] = asset.tokenSymbol;
            tokenAmounts[i] = asset.tokenAmount;
        }

        return (tokenAddrs, tokenSymbols, tokenAmounts);
    }

*/
}

