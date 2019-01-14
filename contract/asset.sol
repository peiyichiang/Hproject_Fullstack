pragma solidity ^0.4.25;
//pragma experimental ABIEncoderV2;

import "https://github.com/kappabooom/h_contract/ERC721.sol";


contract multiSig {
    address internal assetsOwner;//用戶
    address internal platform;
    address internal thirdparty;
    uint private owner_flag;
    uint private platform_flag;
    uint private thirdparty_flag;

    event changeAssetOwnerEvent(address indexed oldOwner, address indexed newOwner, uint256 timestamp);
    event changePlatformEvent(address indexed oldPlatform, address indexed newPlatform, uint256 timestamp);
    event changeThirdpartyEvent(address indexed oldThirdparty, address indexed newThirdparty, uint256 timestamp);


    //執行更換eth地址前 三人中有兩人須簽章
    function ownerSign() public isOwner {
        owner_flag = 1;
    }

    function platformSign() public isPlatform {
        platform_flag = 1;
    }

    function thirdpartySign() public isThirdparty {
        thirdparty_flag = 1;
    }

    modifier isMultiSignature(){
        require(owner_flag+platform_flag+thirdparty_flag >= 2);
        _;
    }
    
    //重置簽章狀態
    function resetSignStatus() internal {
        owner_flag = 0;
        platform_flag = 0;
        thirdparty_flag = 0;
    }
    
    //檢查是否為合約擁有者
    modifier isOwner(){
        require(msg.sender == assetsOwner);
        _;
    }
    
    //檢查是否為平台方
    modifier isPlatform(){
        require(msg.sender == platform);
        _;
    }
    
    //檢查是否為第三方公信機構
    modifier isThirdparty(){
        require(msg.sender == thirdparty);
        _;
    }
    
    //更換assetOwner
    function changeAssetOwner(address _to) public isMultiSignature{
        assetsOwner = _to;
        resetSignStatus();
        
        emit changeAssetOwnerEvent(msg.sender, _to, now);
    }
    
    //更換platform
    function changePlatform(address _to) public isMultiSignature{
        platform = _to;
        resetSignStatus();
        
        emit changePlatformEvent(msg.sender, _to, now);
    }
    
    //更換thirdparty
    function changeThirdparty(address _to) public isMultiSignature{
        thirdparty = _to;
        resetSignStatus();
        
        emit changeThirdpartyEvent(msg.sender, _to, now);
    }
    
    function getOwnerSign() public view returns(uint){
        return owner_flag;
    }
    
    function getPlatformSign() public view returns(uint){
        return platform_flag;
    }
    
    function getThirdpartySign() public view returns(uint){
        return thirdparty_flag;
    }
    
    function getAssetsOwner() public view returns(address){
        return assetsOwner;
    }
    
    function getPlatform() public view returns(address){
        return platform;
    }
    
    function getThirdparty() public view returns(address){
        return thirdparty;
    }
    
}

contract AssetContract is multiSig{


    struct Asset{
        address tokenAddr;//token合約位址
        string tokenSymbol; //tokenSymbol
        uint tokenAmount;//Token數量
    }

    mapping (address => Asset) assets;
    address[] assetIndex;


    event createAssetContractEvent(address assetsOwner, address platform, address thirdparty, uint timestamp);
    event addAssetEvent(address tokenAddr, string tokenSymbol, uint tokenAmount, uint timestamp);
    event transferAssetEvent(address to, string tokenSymbol, uint transferAmount, uint remainAmount, uint timestamp);

    constructor (address _assetsOwner, address _platform, address _thirdparty) public {
            assetsOwner = _assetsOwner;
            platform = _platform;
            thirdparty = _thirdparty;
            
            emit createAssetContractEvent(_assetsOwner, _platform, _thirdparty, now);
    }

    modifier isAssetsOwner(){
        require(msg.sender == assetsOwner);
        _;
    }

    //新增token(當 erc721_token 分配到 AssetContract 的時候記錄起來)
    function addAsset(address _tokenAddr) public {
        //use ERC721TOKEN's function (balanceof, getTokenSymbol)
        ERC721 _erc721 = ERC721(_tokenAddr);

        assets[_tokenAddr].tokenAddr = _tokenAddr;
        assets[_tokenAddr].tokenSymbol = _erc721.getTokenSymbol(this);
        assets[_tokenAddr].tokenAmount += _erc721.getBalance(this);
        assetIndex.push(_tokenAddr);

        emit addAssetEvent(assets[_tokenAddr].tokenAddr, assets[_tokenAddr].tokenSymbol, assets[_tokenAddr].tokenAmount, now);
    }

    //提領token
    function transferAsset(address _tokenAddr, uint _transferAmount,address _to) public isAssetsOwner {
        require(assets[_tokenAddr].tokenAmount >= _transferAmount, "your balances are not enough" );
        
        uint remainAmount = 123;//_tokenAddr.balances(this);
        //_tokenAddr.transfer(_to);

        emit transferAssetEvent(_to, assets[_tokenAddr].tokenSymbol, _transferAmount, remainAmount, now);
    }

    //get tokenAmount
    function getAsset(address _tokenAddr) public view returns (uint){
        return assets[_tokenAddr].tokenAmount;
    }

    //get asset number
    function getAssetCount() public view returns(uint assetCount){
    	return assetIndex.length;
	}
	
	//get all assetAddr
	function getAssetIndex() public view returns(address[]){
        return (assetIndex);
	}

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