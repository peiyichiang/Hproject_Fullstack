pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
//deploy parameters: "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902191745
import "./SafeMath.sol";//not used i++ is assumed not to be too big

interface ERC721SPLCITF_assetbook {
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function getAccountIdsAll(address user) external;
    function getAccountIds(address user, uint idxS, uint idxE) external;

    function approve(address _approved, uint256 _tokenId) external;
    function setApprovalForAll(address _operator, bool _approved) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);

    function nftName() external view returns (string memory _name);
    function nftSymbol() external view returns (string memory _symbol);
    function getTokenOwners(uint idStart, uint idCount) external view returns(address[] memory);
    function safeTransferFromBatch(address _from, address _to, uint amount, uint price) external;
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
    // constructor (address _assetOwner, address _platformContractAddr) public {
    //     assetOwner = _assetOwner;
    //     platformContractAddr = _platformContractAddr;
    // }
    /** @dev 檢查是否為合約擁有者 */
    modifier ckAssetOwner(){
        require(msg.sender == assetOwner, "sender must be assetOwner");
        _;
    }
    modifier ckAssetAddr(address _assetAddr) {
        require(_assetAddr.isContract(), "_assetAddr has to contain a contract");
        //require(_assetAddr != address(0), "_assetAddr should not be zero");
        _;
    }

    /** @dev 執行更換eth地址前，三人中有兩人須簽章 */
    function assetOwnerVote(uint256 _timeCurrent) external ckAssetOwner {
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
    function changeEndorser(address _oldEndorser, address _newEndorser, uint256 _timeCurrent) public ckAssetOwner{
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

    function() external payable { revert("should not send any ether directly"); }
}

interface MultiSigITF_assetbook {
    function getAssetOwner() external view returns(address);
    // function changeAssetOwner(address _assetOwnerNew, uint256 _timeCurrent) external;
    // function getPlatformContractAddr() external view returns(address);
}


//"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 201903061045

contract AssetBook is MultiSig {
    using SafeMath for uint256;
    using AddressUtils for address;
    address public assetOwner;
    address public multiSigContractAddr;
    address public platformContractAddr;
    //address public arrayUtilsAddr;

    /** @dev asset資料結構 */
    struct Asset{
        string symbol;
        //uint assetAddrIndex; // starting from 1
        //uint[] ids; //擁有的TokenId
        uint balance; //Token數量
        //mapping (uint => uint) indexToId;//time index to asset token ids. For First In First Out(FIFO) exchange rule
        //uint idxStart;// 0, 1, 2, ...
        //uint idxEnd;// 0, 1, 2, ...
        //bool isApprovedForAsset;//by platform to approve writing from the asset contract
        bool isInitialized;
    }
    mapping (address => Asset) assets;//assets[_assetAddr]
    uint public assetCindex;//count and index of assets, and each asset has an assetAddr
    //address[] assetAddrList; //asset address list ... list will need for loop to check each one to prevent duplicated entries!
    mapping (uint => address) assetIndexToAddr;//starts from 1, 2... assetCindex. each assset address has an unique index in this asset contract

    /** @dev asset相關event */
    //event DeployAssetContractEvent(address assetOwner, address multiSigContractAddr, address platformContractAddr, uint timestamp);
    //event addAssetEvent(address assetAddr, string symbol, uint balance, uint[] ids ,uint timestamp);
    event TransferAssetEvent(address to, string symbol, uint _assetId, uint tokenBalance, uint timestamp);
    event TransferAssetBatchEvent(address to, string symbol, uint[] _assetId, uint tokenBalance, uint timestamp);


    //"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201903061045
    constructor (address _assetOwner, address _platformContractAddr) public {
        assetOwner = _assetOwner;
        platformContractAddr = _platformContractAddr;
        //multiSigContractAddr = _multiSigContractAddr;
        //emit DeployAssetContractEvent(assetOwner, _multiSigContractAddr, platformContractAddr, _timeCurrent);
    }
    /*
    constructor @ MultiSig (address _assetOwner, address _platformContractAddr) public {
        assetOwner = _assetOwner;
        platformContractAddr = _platformContractAddr;
    }
    constructor @ AssetBook: (... address _multiSigContractAddr, )

    function updateAssetOwner() external {
        MultiSigITF_assetbook multiSig = MultiSigITF_assetbook(address(uint160(multiSigContractAddr)));
        assetOwner = multiSig.getAssetOwner();
    }*/

    modifier ckAssetAddr(address _assetAddr) {
        //require(_assetAddr != address(0), "_assetAddr should not be zero");
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
    // function setAssetApproval(address _assetAddr, bool _isApprovedForAsset) external {
    //     require(msg.sender == platformContractAddr, "sender must be Platform Contract");
    //     assets[_assetAddr].isApprovedForAsset = _isApprovedForAsset;
    // }


    /** @dev 新增token(當 erc721_token 分配到 AssetBookCtrt 的時候記錄起來)
    For ERC721SPLC-addNFToken(address _to, uint256 _tokenId) to call this after minting new asset tokens */
    function addAsset(address _assetAddr, string calldata symbol, uint balance) external {
        //assets[_assetAddr].isApprovedForAsset = true;
        require(_assetAddr.isContract(), "_assetAddr must contain a contract");//_assetAddr != address(0)

        if(!assets[_assetAddr].isInitialized){
            assets[_assetAddr].isInitialized = true;

            assets[_assetAddr].symbol = symbol;
            assets[_assetAddr].balance = balance;

            assetCindex = assetCindex.add(1);
            assetIndexToAddr[assetCindex] = _assetAddr;
        } else {
            assets[_assetAddr].balance = balance;
        }
    }

    /** @dev get assets info */
    function getAsset(address _assetAddr) public view ckAssetAddr(_assetAddr) 
    returns (string memory symbol, uint balance) {
        ERC721SPLCITF_assetbook erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        symbol = erc721.nftSymbol();
        balance = erc721.balanceOf(address(this));
    }

    function getAssetFromAssetBook(address _assetAddr) public view ckAssetAddr(_assetAddr) 
    returns (string memory symbol, uint balance, bool isInitialized) {
        Asset memory asset = assets[_assetAddr];
        symbol = asset.symbol;
        balance = asset.balance;
        isInitialized = asset.isInitialized;
    }

    function updateAsset(address _assetAddr) external {
        require(_assetAddr.isContract(), "_assetAddr has to contain a contract");
        ERC721SPLCITF_assetbook erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));

        if (assets[_assetAddr].isInitialized) {
            assets[_assetAddr].balance = erc721.balanceOf(address(this));

        } else {
            assets[_assetAddr].isInitialized = true;
            assets[_assetAddr].symbol = erc721.nftSymbol();
            assets[_assetAddr].balance = erc721.balanceOf(address(this));
        }
    }


    function deleteAsset(address _assetAddr) public ckAssetAddr(_assetAddr) restricted {
        require(assets[_assetAddr].isInitialized, "this _assetAddr has not been initialized");
        assets[_assetAddr].isInitialized = false;

        delete assetIndexToAddr[assetCindex];
        assetCindex = assetCindex.sub(1);
        delete assets[_assetAddr].symbol;
        delete assets[_assetAddr].balance;
    }
    

    //transfer from the minimum timeIndex according to First In First Out principle
    function safeTransferFromBatch(address _assetAddr, uint amount, address _to, uint price) 
        public ckAssetOwner ckAssetAddr(_assetAddr){//, uint256 _timeCurrent
        //require(assets[_assetAddr].isApprovedForAsset, "check if this user is still approved for transferring this stoken");

        ERC721SPLCITF_assetbook erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        erc721.safeTransferFromBatch(address(this), _to, amount, price);

    }

    /** @dev get all assetAddr */
    function getAssetAddrArray(uint indexStart, uint amount) 
        external view returns(address[] memory assetAddrArray) {
        require(amount > 0, "amount must be > 0");
        require(indexStart > 0, "indexStart must be > 0");
        uint amount_;
        if(indexStart.add(amount).sub(1) > assetCindex) {
          amount_ = assetCindex.sub(indexStart).add(1);
        } else {
          amount_ = amount;
        }
        for(uint i = 0; i < amount_; i = i.add(1)) {
            assetAddrArray[i] = assetIndexToAddr[i.add(indexStart)];
        }
    }


    function() external payable { revert("should not send any ether directly"); }

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
}


contract ArrayUtils {
    using SafeMath for uint256;
    mapping (uint => uint) indexToId;//For First In First Out(FIFO) exchange rule

    //inputs: [0, 1, 2, 3, 4], 0, 4, 1      [0, 1, 2, 3, 4], 0, 4, 0
    //sliceA gives the 1st part of the input array
    function sliceA(uint[] calldata array, uint idxStart, uint idxEnd, uint amount) 
        external pure returns (uint[] memory arrayOut){
        //ckAssetAddr(_assetAddr)
        uint arrayLen = array.length;
        require(arrayLen == idxEnd.sub(idxStart).add(1), "array length should be equal to idxEnd-idxStart+1");
        require(idxStart <= idxEnd, "idxStart must be <= idxEnd");
        require(amount > 0, "amount must be > 0");
        require(amount <= arrayLen, "amount must be <= arrayLen");

        uint idxEndReq = idxStart.add(amount).sub(1);
        require(idxEndReq <= idxEnd, "idxEndReq must be equal to/lesser than idxEnd");

        arrayOut = new uint[](amount);
        for(uint i = 0; i <= idxEndReq; i++) {
            arrayOut[i] = array[idxStart.add(i)];
        }
    }

    //inputs: [0, 1, 2, 3, 4], 0, 4, 4     [0, 1, 2, 3, 4], 0, 4, 5
    //sliceB gives the 2nd part of the input array
    function sliceB(uint[] calldata array, uint idxStart, uint idxEnd, uint amount) 
        external pure returns (uint[] memory arrayOut) {
        uint arrayLen = array.length;
        require(arrayLen == idxEnd.sub(idxStart).add(1), "array length should be equal to idxEnd-idxStart+1");
        require(idxStart <= idxEnd, "idxStart must be <= idxEnd");
        require(amount > 0, "amount must be > 0");
        require(amount <= arrayLen, "amount must be <= arrayLen");

        if (amount == arrayLen) {

        } else {
          uint arrayLenOut = arrayLen.sub(amount);
          uint idxStartOut = idxStart.add(amount);

          arrayOut = new uint[](arrayLenOut);
          require(idxEnd.sub(idxStartOut).add(1) == arrayLenOut, "arrayLenOut, start, end");

          require(idxStartOut <= idxEnd, "idxStartOut must be <= than idxEnd");
          for(uint i = idxStartOut; i <= idxEnd; i++) {
              arrayOut[i.sub(idxStartOut)] = array[i];
          }
        }

    }
}
//--------------------==
// interface ArrayUtilsITF_assetbook {
//     function sliceA(uint[] calldata array, uint idxStart, uint idxEnd, uint amount) 
//         external pure;
//     function sliceB(uint[] calldata array, uint idxStart, uint idxEnd, uint amount) 
//         external pure;
// }
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
/** @dev string[] 不能回傳 */
/*
    //get all assets
    function getAllAssets() public ckAssetOwner returns (address[], string[], uint[] ){
        address[] memory assetAddrArray = new address[](assetAddrList.length);
        string[] memory symbols = new string[](assetAddrList.length);
        uint[]    memory balances = new uint[](assetsIndex.length);

        for (uint i = 0; i < assetAddrList.length; i++) {
            Asset storage asset = assets[assetAddrList[i]];
            assetAddrArray[i] = asset.assetAddr;
            symbols[i] = asset.symbol;
            balances[i] = asset.balance;
        }

        return (assetAddrArray, symbols, balances);
    }

*/