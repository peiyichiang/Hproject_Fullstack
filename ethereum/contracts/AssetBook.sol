pragma solidity ^0.5.4;

import "./SafeMath.sol";//not used i++

interface HCAT721_Interface_ABC {
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function getAccountIds(address user, uint idxS, uint idxE) external;

    function allowance(address user, address operator) external view returns (uint remaining);
    function tokenApprove(address operator, uint amount) external;

    function name() external view returns (bytes32 _name);
    function symbol() external view returns (bytes32 _symbol);
    function getTokenOwners(uint idStart, uint idCount) external view returns(address[] memory);
    function safeTransferFromBatch(address _from, address _to, uint amount, uint price, uint serverTime) external;
    function checkSafeTransferFromBatch(
        address _from, address _to, uint amount, uint price, uint serverTime) external view returns(bool[] memory boolArray);
    function getFirstFromAddrTokenId(address _from) external view returns(uint tokenId_);
    function sendTokenToSettlementByAmount(address _from, address _to, uint amount) external;
    //function sendTokenToSettlementById(address _from, address _to, uint _tokenId) external;
    function sendTokenFromSettlementById(address _from, address _to, uint _tokenId) external;
}

interface Helium_Interface_ABC{
    function checkCustomerService(address _eoa) external view returns(bool _isCustomerService);
}

interface Settlement_Interface_ABC{
    function tokenReceiver(address _from, address _to, uint256 _tokenId) external pure returns(bytes4);
}

contract MultiSig {
    using SafeMath for uint256;
    using AddressUtils for address;

    address public assetOwner; /** @dev user EOA */
    address public addrHeliumContract; /** @dev platform address */

    uint public endorserCount;
    mapping(uint => address) public endorsers;
    // we require addrHeliumContract and endorserCtrt because EOA may change ...

    uint public lastLoginTime;
    uint public antiPlatformOverrideDaysDefault = 30;
    uint public antiPlatformOverrideDays = 30;
    uint public assetOwner_flag;
    uint public HeliumContract_flag;
    uint public endorsers_flag;

    event ChangeAssetOwnerEvent(address indexed oldAssetOwner, address indexed newAssetOwner, uint256 timestamp);
    event ChangeEndorserCtrtEvent(address indexed oldEndorserCtrt, address indexed newEndorserCtrt, uint256 timestamp);
    event AddEndorserEvent(address indexed newEndorser, uint256 timestamp);
    event AssetOwnerVoteEvent(address indexed assetOwner, uint256 timestamp);
    event HeliumCtrtVoteEvent(address indexed addrHeliumContract, uint256 timestamp);
    event EndorserVoteEvent(address indexed endorserContractAddr, uint256 timestamp);
    event AddLoginTime(uint indexed lastLoginTime);
    event SetAntiPlatformOverrideDays(uint antiPlatformOverrideDays);


    modifier ckAssetOwner(){
        require(msg.sender == assetOwner, "sender must be assetOwner");
        _;
    }
    function checkAssetOwner() public view returns (bool){
        return (msg.sender == assetOwner);
    }

    function checkIsContract(address assetAddr) public view returns (bool){
        //require(assetAddr != address(0), "assetAddr should not be zero");
        return assetAddr.isContract();
    }

    modifier ckCustomerService(){
        require(Helium_Interface_ABC(addrHeliumContract).checkCustomerService(msg.sender), "only a customer service rep is allowed");
        _;
    }
    function checkCustomerService() public view returns (bool){
        return (Helium_Interface_ABC(addrHeliumContract).checkCustomerService(msg.sender));
    }

    function addLoginTime() external ckAssetOwner {
        lastLoginTime = now;
        emit AddLoginTime(lastLoginTime);
    }

    // for assetOwner to vote
    function assetOwnerVote(uint256 serverTime) external ckAssetOwner {
        assetOwner_flag = 1;
        emit AssetOwnerVoteEvent(msg.sender, serverTime);
    }

    function setHeliumAddr(address _addrHeliumContract) external ckCustomerService {
        addrHeliumContract = _addrHeliumContract;
    }
    // for addrHeliumContract to vote
    function HeliumContractVote(uint256 serverTime) external ckCustomerService {
        HeliumContract_flag = 1;
        emit HeliumCtrtVoteEvent(msg.sender, serverTime);
    }


    // for this endorser contract to receive votes from other multiSig contracts
    function endorserVote(uint256 serverTime) external {
        require(endorsers[1] == msg.sender || endorsers[2] == msg.sender || endorsers[3] == msg.sender, "sender must be one of the endorsers");
        endorsers_flag = 1;
        emit EndorserVoteEvent(msg.sender, serverTime);
    }

    function setAntiPlatformOverrideDays(uint _antiPlatformOverrideDays) external ckAssetOwner {
        require(
            _antiPlatformOverrideDays >= antiPlatformOverrideDaysDefault,
            "minimum _antiPlatformOverrideDays is antiPlatformOverrideDaysDefault days");
        antiPlatformOverrideDays = _antiPlatformOverrideDays;
        emit SetAntiPlatformOverrideDays(_antiPlatformOverrideDays);
    }

    function isAblePlatformOverride() public view returns (bool) {
        return(now >= lastLoginTime + antiPlatformOverrideDays * 1 days);
    }

    // to calculate the sum of all vote flags
    function calculateVotes() public view returns (uint) {
        return (assetOwner_flag + HeliumContract_flag + endorsers_flag);
    }

    //public bcos it will be called in actions
    function resetVoteStatus() public {
        require(checkCustomerService() || checkAssetOwner(), "either the assetowner or the customer service rep can reset vote");
        assetOwner_flag = 0;
        HeliumContract_flag = 0;
        endorsers_flag = 0;
    }

    function addEndorser(address _newEndorser, uint256 serverTime) external ckAssetOwner{
        require(_newEndorser != assetOwner, "new endorser cannot be the assetOwner");
        endorserCount = endorserCount.add(1);
        require(
            endorsers[1] != _newEndorser && endorsers[2] != _newEndorser && endorsers[3] != _newEndorser, "new endorser cannot be duplicated");
        require(endorserCount <= 3, "endorser count must be <= 3");
        endorsers[endorserCount] = _newEndorser;
        emit AddEndorserEvent(_newEndorser, serverTime);
    }

    function changeEndorser(address _oldEndorser, address _newEndorser, uint256 serverTime) external ckAssetOwner{
        for(uint i = 1;  i <= endorserCount; i = i.add(1)){
            if(endorsers[i] == _oldEndorser){
                endorsers[i] = _newEndorser;
                emit ChangeEndorserCtrtEvent(_oldEndorser, _newEndorser, serverTime);
            }
        }
    }

    /** @dev When changing assetOwner EOA，two out of three parties must vote on pass */
    function changeAssetOwner(address _assetOwnerNew, uint256 serverTime) external {
        if(msg.sender != address(0)){//assetOwner
            require(checkCustomerService(),"only a customer service rep is allowed");
            require(calculateVotes() >= 2 || isAblePlatformOverride(),"vote count must be >= 2");
        }
        address _oldAssetOwner = assetOwner;
        assetOwner = _assetOwnerNew;
        assetOwner_flag = 0;
        HeliumContract_flag = 0;
        endorsers_flag = 0;
        emit ChangeAssetOwnerEvent(_oldAssetOwner, _assetOwnerNew, serverTime);
    }

    function() external payable { revert("should not send any ether directly"); }
}


//"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 201903061045

contract AssetBook is MultiSig {
    using SafeMath for uint256;
    using AddressUtils for address;

    struct Asset{
        bytes32 symbol;
        uint balance;
        bool isInitialized;
    }
    mapping (address => Asset) assets;//assets[assetAddr]
    uint public assetCindex;//last submitted index and total count of current assets, and each asset has an assetAddr
    mapping (uint => address) assetIndexToAddr;//starts from 1, 2... assetCindex. each assset address has an unique index in this asset contract
    mapping (address => uint) addrToAssetIndex;


    event TransferAssetEvent(address to, bytes32 symbol, uint _assetId, uint assetBalance, uint timestamp);
    event TransferAssetBatchEvent(address to, bytes32 symbol, uint[] _assetId, uint assetBalance, uint timestamp);


    //"0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201903061045
    constructor (address _assetOwner, address _addrHeliumContract) public {
        assetOwner = _assetOwner;
        addrHeliumContract = _addrHeliumContract;
    }
    function checkDeploymentConditions(
        address _assetOwner, address _addrHeliumContract
      ) public view returns(bool[] memory boolArray) {
        boolArray = new bool[](2);
        boolArray[0] = _assetOwner.isContract();
        boolArray[1] = _addrHeliumContract.isContract();
    }

    function getAssetbookDetails() public view returns(
        address assetOwner_, address addrHeliumContract_,
        uint lastLoginTime_, uint antiPlatformOverrideDays_,
        uint assetOwner_flag_, uint HeliumContract_flag_,
        uint endorsers_flag_, uint endorserCount_,
        uint calculateVotes_, bool isAblePlatformOverride_) {

        assetOwner_ = assetOwner;
        addrHeliumContract_ = addrHeliumContract;
        lastLoginTime_ = lastLoginTime;
        antiPlatformOverrideDays_ = antiPlatformOverrideDays;
        assetOwner_flag_ = assetOwner_flag;
        HeliumContract_flag_ = HeliumContract_flag;

        endorsers_flag_ = endorsers_flag;
        endorserCount_ = endorserCount;
        calculateVotes_ = calculateVotes();
        isAblePlatformOverride_ = isAblePlatformOverride();
    }

    function addAsset(address assetAddr) external ckAssetOwner {
        if(addrToAssetIndex[assetAddr] == 0){
            assetCindex = assetCindex.add(1);
            addrToAssetIndex[assetAddr] = assetCindex;
            assetIndexToAddr[assetCindex] = assetAddr;
        }
    }
    function deleteAsset(uint assetIndex, address assetAddr) external ckAssetOwner {
        uint assetIndex_;
        address assetAddr_;
        if(assetIndex > 0) {
            assetIndex_ = assetIndex;
            assetAddr_ = assetIndexToAddr[assetIndex];
        } else {
            require(assetAddr.isContract(), "assetAddr has to contain a contract");
            assetAddr_ = assetAddr;
            assetIndex_ = addrToAssetIndex[assetAddr];
        }
        delete addrToAssetIndex[assetAddr_];
        delete assetIndexToAddr[assetIndex_];
    }

    /** @dev get assets info: asset symbol and balance on this assetbook’s account
			assetAddr is the asset contract address */
    function getAsset(uint assetIndex, address assetAddr)
    public view returns (uint assetIndex_, address assetAddr_, bytes32 symbol, uint balance) {
        if(assetIndex > 0) {
            assetIndex_ = assetIndex;
            assetAddr_ = assetIndexToAddr[assetIndex];
        } else {
            require(assetAddr.isContract(), "assetAddr has to contain a contract");
            assetAddr_ = assetAddr;
            assetIndex_ = addrToAssetIndex[assetAddr];
        }
        HCAT721_Interface_ABC hcat721 = HCAT721_Interface_ABC(address(uint160(assetAddr_)));
        symbol = hcat721.symbol();
        balance = hcat721.balanceOf(address(this));
    }

    function getAssetBatch(uint indexStart, uint amount) external view returns(
          uint[] memory assetIndexArray, address[] memory assetAddresses, bytes32[] memory assetSymbols, uint[] memory assetBalances) {
        uint indexStart_;
        uint amount_;
        address assetAddr;
        if(indexStart == 0 && amount == 0) {
            indexStart_ = 1;
            amount_ = assetCindex;

        } else {
            require(indexStart > 0, "indexStart must be > 0");
            require(amount > 0, "amount must be > 0");

            if(indexStart.add(amount).sub(1) > assetCindex) {
                indexStart_ = indexStart;
                amount_ = assetCindex.sub(indexStart).add(1);
            } else {
                indexStart_ = indexStart;
                amount_ = amount;
            }

            assetIndexArray = new uint[](amount_);
            assetAddresses = new address[](amount_);
            assetSymbols = new bytes32[](amount_);
            assetBalances = new uint[](amount_);

            for(uint i = 0; i < amount_; i = i.add(1)) {
                assetIndexArray[i] = i.add(indexStart_);
                assetAddr = assetIndexToAddr[i.add(indexStart_)];
                assetAddresses[i] = assetAddr;

                HCAT721_Interface_ABC hcat721 = HCAT721_Interface_ABC(address(uint160(assetAddr)));
                assetSymbols[i] = hcat721.symbol();
                assetBalances[i] = hcat721.balanceOf(address(this));
            }
        }
    }

    /** @dev to get all assetAddr stored in this assetbook contract
        Because all asset contract are added with an index number,
        we can search them according to the index number

        indexStart is the index to start the search
        amount is the output number of results we would like to received
        but if the indexStart or the amount value is too large,
        then this function will automatically find all the asset addresses that has asset index greater or equal to indexStart
    */
    function getAssetAddresses(uint indexStart, uint amount)
        external view returns(address[] memory assetAddresses) {
        uint indexStart_;
        uint amount_;
        if(indexStart == 0 && amount == 0) {
            indexStart_ = 1;
            amount_ = assetCindex;

        } else {
            require(indexStart > 0, "indexStart must be > 0");
            require(amount > 0, "amount must be > 0");

            if(indexStart.add(amount).sub(1) > assetCindex) {
                indexStart_ = indexStart;
                amount_ = assetCindex.sub(indexStart).add(1);
            } else {
                indexStart_ = indexStart;
                amount_ = amount;
            }
            assetAddresses = new address[](amount_);
            for(uint i = 0; i < amount_; i = i.add(1)) {
                assetAddresses[i] = assetIndexToAddr[i.add(indexStart_)];
            }
        }
    }

    /** @dev transfer `amount` of asset quantity with such asset that is specified by the assetAddr
        from this assetbook to the _to address,
        with exchange price of `price`, with the server time being `serverTime`
        Note: the asset IDs are chosen according to First In First Out principle
    */
    function checkInputs(uint assetIndex, address assetAddr, address _from)
    public view returns(address assetAddr_, address from_){
        if(assetIndex > 0) {
            assetAddr_ = assetIndexToAddr[assetIndex];
        } else {
            assetAddr_ = assetAddr;
        }
        if(_from == address(0)){
            from_ = address(this);
        } else {
            from_ = _from;
        }
    }
    function checkSafeTransferFromBatch(
        uint assetIndex, address assetAddr, address _from, address _to, uint amount, uint price, uint serverTime)
        external view returns(bool[] memory boolArray, bool, bool) {

        (address assetAddr_,address from_) = checkInputs(assetIndex, assetAddr, _from);

        HCAT721_Interface_ABC hcat721 = HCAT721_Interface_ABC(address(uint160(assetAddr_)));
        return (hcat721.checkSafeTransferFromBatch(from_, _to, amount, price, serverTime), assetAddr_.isContract(), msg.sender == assetOwner);
    }

    function safeTransferFromBatch(
        uint assetIndex, address assetAddr, address _from, address _to, uint amount,  uint price, uint serverTime) external ckAssetOwner {

        (address assetAddr_,address from_) = checkInputs(assetIndex, assetAddr, _from);

        HCAT721_Interface_ABC(assetAddr_).safeTransferFromBatch(from_, _to, amount, price, serverTime);
    }

    function getFirstFromAddrTokenId(
        uint assetIndex, address assetAddr, address _from) external view returns(uint tokenId_){

        (address assetAddr_, ) = checkInputs(assetIndex, assetAddr, _from);
        tokenId_ = HCAT721_Interface_ABC(assetAddr_).getFirstFromAddrTokenId(address(this));
    }

    function sendTokenToSettlementByAmount(
        uint assetIndex, address assetAddr,
        address _from, address _to, uint _tokenId) external ckAssetOwner {

        (address assetAddr_,address from_) = checkInputs(assetIndex, assetAddr, _from);
        HCAT721_Interface_ABC(assetAddr_).sendTokenToSettlementByAmount(from_, _to, _tokenId);
    }
    //sendTokenToSettlementById(address _from, address _to, uint _tokenId) external;
    // function sendTokenToSettlementById(
    //     uint assetIndex, address assetAddr,
    //     address _from, address _to, uint _tokenId) external ckAssetOwner {

    //     (address assetAddr_,address from_) = checkInputs(assetIndex, assetAddr, _from);
    //     HCAT721_Interface_ABC(assetAddr_).sendTokenToSettlementById(from_, _to, _tokenId);
    // }


    function assetbookApprove(uint assetIndex, address assetAddr, address operator, uint amount) external ckAssetOwner {
        address assetAddr_;
        if(assetIndex > 0) {
            assetAddr_ = assetIndexToAddr[assetIndex];
        } else {
            assetAddr_ = assetAddr;
        }
        require(assetAddr_.isContract(), "assetAddr has to contain a contract");
        
        HCAT721_Interface_ABC(assetAddr_).tokenApprove(operator, amount);
        // HCAT721_Interface_ABC hcat721 = HCAT721_Interface_ABC(address(uint160(assetAddr_)));
        // hcat721.tokenApprove(operator, amount);
    }


    bytes4 constant TOKEN_RECEIVER_HASH = 0x79830ac6;
    // Equals to `bytes4(keccak256(abi.encodePacked("tokenReceiver(address,address,uint256)")))`
    /* $notice Handle the receipt of an NFT
     $dev The ERC721 smart contract calls this function on the recipient
      after a `transfer`. This function MAY throw to revert and reject the
      transfer. Return of other than the magic value MUST result in the
      transaction being reverted.
    */
    function tokenReceiver(address _from, address _to, uint256 _tokenId) external pure returns(bytes4) {
        require(_from != address(0), "from address should not be zero");// _from address is contract address if minting tokens
        require(_to != address(0), "original EOA should not be zero");
        require(_tokenId > 0, "tokenId should be greater than zero");
        return TOKEN_RECEIVER_HASH;
    }

    //function() external payable { revert("should not send any ether directly"); }
}


//--------------------==
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) }
        // solium-disable-line security/no-inline-assembly
        return size > 0;
    }
}
