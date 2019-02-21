pragma solidity ^0.5.3;
//pragma experimental ABIEncoderV2;
//deploy parameters: "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902191745
import "./SafeMath.sol";//not used i++ is assumed not to be too big

interface ERC721SPLCITF_asset {
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
    function mintSerialNFT(address _to, string calldata _uri) external;
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
    function AssetsOwnerSign(uint256 _timeCurrent) public isAssetsOwner {
        assetsOwner_flag = 1;
        emit assetsOwnerSignEvent(msg.sender, _timeCurrent);
    }

    function platformSign(uint256 _timeCurrent) public isPlatform {
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

    //"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902201045
    constructor (address _assetsOwner, address _platform, uint256 _timeCurrent) public {
        assetsOwner = _assetsOwner;
        platformContractAddr = _platform;
        emit createAssetContractEvent(_assetsOwner, _platform, _timeCurrent);
    }


    /** @dev 新增token(當 erc721_token 分配到 AssetContract 的時候記錄起來) */
    function addAsset(address _tokenAddr, uint256 _timeCurrent) public {
        //use ERC721TOKEN's function (balanceof, getTokenSymbol)
        ERC721SPLCITF_asset _erc721 = ERC721SPLCITF_asset(address(uint160(_tokenAddr)));

        assets[_tokenAddr].tokenAddr = _tokenAddr;
        assets[_tokenAddr].tokenSymbol = _erc721.symbol();
        assets[_tokenAddr].tokenAmount = _erc721.balanceOf(address(this));
        assets[_tokenAddr].ids = _erc721.get_ownerToIds(address(this));
        assetIndex.push(_tokenAddr);

        emit addAssetEvent(assets[_tokenAddr].tokenAddr, assets[_tokenAddr].tokenSymbol, assets[_tokenAddr].tokenAmount, assets[_tokenAddr].ids, _timeCurrent);
    }


    /** @dev 提領token */
    function transferAsset(address _tokenAddr, uint _tokenId, address _to, uint256 _timeCurrent) public isAssetsOwner {
        ERC721SPLCITF_asset _erc721 = ERC721SPLCITF_asset(address(uint160(_tokenAddr)));
        require(_erc721.ownerOf(_tokenId) == address(this), "請確認欲轉移的token_id");

        uint remainAmount = _erc721.balanceOf(address(this));//_tokenAddr.balances(this);
        _erc721.safeTransferFrom(address(this), _to, _tokenId);
        assets[_tokenAddr].tokenAmount = _erc721.balanceOf(address(this));
        assets[_tokenAddr].ids = _erc721.get_ownerToIds(address(this));

        emit transferAssetEvent(_to, assets[_tokenAddr].tokenSymbol, _tokenId, remainAmount, assets[_tokenAddr].ids, _timeCurrent);
    }

    /** @dev get assets info */
    function getAsset(address _tokenAddr) public view returns (string memory, uint, uint[] memory){
        return (assets[_tokenAddr].tokenSymbol, assets[_tokenAddr].tokenAmount, assets[_tokenAddr].ids);
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

