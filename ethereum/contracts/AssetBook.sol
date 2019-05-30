pragma solidity ^0.5.4;

import "./SafeMath.sol";//not used i++ is assumed not to be too big

interface HCAT721ITF_assetbook {
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function getAccountIds(address user, uint idxS, uint idxE) external;

    function allowance(address user, address operator) external view returns (uint remaining);
    function tokenApprove(address operator, uint amount) external;

    function name() external view returns (bytes32 _name);
    function symbol() external view returns (bytes32 _symbol);
    function getTokenOwners(uint idStart, uint idCount) external view returns(address[] memory);
    function safeTransferFromBatch(address _from, address _to, uint amount, uint price, uint serverTime) external;
}

interface HeliumITF{
    function checkCustomerService(address _eoa) external view returns(bool _isCustomerService);
}

contract MultiSig {
    using SafeMath for uint256;
    using AddressUtils for address;

    address public assetOwner; /** @dev 用戶 EOA */
    address public addrHeliumContract; /** @dev 平台方 */
    address[] public endorserCtrts; /** @dev 背書者的 (一到三個人) */
    // we require addrHeliumContract and endorserCtrt because EOA may change ...
    uint public assetOwner_flag;
    uint public HeliumContract_flag;
    uint public endorserCtrts_flag;

    /** @dev multiSig相關event */
    event ChangeAssetOwnerEvent(address indexed oldAssetOwner, address indexed newAssetOwner, uint256 timestamp);
    event ChangeEndorserCtrtEvent(address indexed oldEndorserCtrt, address indexed newEndorserCtrt, uint256 timestamp);
    event AddEndorserEvent(address indexed endorserCtrts, uint256 timestamp);
    event AssetOwnerVoteEvent(address indexed assetOwner, uint256 timestamp);
    event HeliumCtrtVoteEvent(address indexed addrHeliumContract, uint256 timestamp);
    event EndorserVoteEvent(address indexed endorserContractAddr, uint256 timestamp);

    /** @dev 檢查是否為合約擁有者 */
    modifier ckAssetOwner(){
        require(msg.sender == assetOwner, "sender must be assetOwner");
        _;
    }
    modifier ckIsContract(address assetAddr) {
        require(assetAddr.isContract(), "assetAddr has to contain a contract");
        //require(assetAddr != address(0), "assetAddr should not be zero");
        _;
    }

    // for assetOwner to vote
    function assetOwnerVote(uint256 _timeCurrent) external ckAssetOwner {
        assetOwner_flag = 1;
        emit AssetOwnerVoteEvent(msg.sender, _timeCurrent);
    }

    function setHeliumAddr(address _addrHeliumContract) external {
        require(checkCustomerService(), "only a customer service rep can call this function");
        addrHeliumContract = _addrHeliumContract;
    }
    function checkCustomerService() public view returns (bool){
        return (HeliumITF(addrHeliumContract).checkCustomerService(msg.sender));
    }
    // for addrHeliumContract to vote
    function HeliumContractVote(uint256 _timeCurrent) external {
        require(checkCustomerService(), "only a customer service rep can call this function");
        HeliumContract_flag = 1;
        emit HeliumCtrtVoteEvent(msg.sender, _timeCurrent);
    }

    // for endorserCtrt to vote on other multiSig contracts
    function endorserCtrtsVoteOutbound(address _multisigCtrt, uint256 _timeCurrent) public ckIsContract(_multisigCtrt){
        MultiSig multiSig = MultiSig(address(uint160(_multisigCtrt)));
        multiSig.endorserCtrtsVoteInbound(_timeCurrent);
    }

    // for this endorser contract to receive votes from other multiSig contracts
    function endorserCtrtsVoteInbound(uint256 _timeCurrent) external {
        require(endorserCtrts[0] == msg.sender || endorserCtrts[1] == msg.sender || endorserCtrts[2] == msg.sender, "sender must be one of the endorserCtrts");
        endorserCtrts_flag = 1;
        emit EndorserVoteEvent(msg.sender, _timeCurrent);
    }


    // to calculate the sum of all vote flags
    function calculateVotes() public view returns (uint) {
        return (assetOwner_flag + HeliumContract_flag + endorserCtrts_flag);
    }

    /** @dev 重置簽章狀態 */
    function resetVoteStatus() internal {
        assetOwner_flag = 0;
        HeliumContract_flag = 0;
        endorserCtrts_flag = 0;
    }

    /** @dev 更換assetOwner */
    /** @dev When changing assetOwner EOA，two out of three parties must vote on pass */
    function changeAssetOwner(address _assetOwnerNew, uint256 _timeCurrent) external {
        require(calculateVotes() >= 2, "vote count must be >= 2");
        address _oldAssetOwner = assetOwner;
        assetOwner = _assetOwnerNew;
        resetVoteStatus();
        emit ChangeAssetOwnerEvent(_oldAssetOwner, _assetOwnerNew, _timeCurrent);
    }

    /** @dev 新增endorser */
    function addEndorser(address _newEndorser, uint256 _timeCurrent) public ckAssetOwner{
        require(endorserCtrts.length <= 3, "endorser count must be <= 3");
        endorserCtrts.push(_newEndorser);
        emit AddEndorserEvent(_newEndorser, _timeCurrent);
    }

    /** @dev 更換endorser */
    function changeEndorser(address _oldEndorser, address _newEndorser, uint256 _timeCurrent) public ckAssetOwner{
        for(uint i = 0;  i < endorserCtrts.length; i = i.add(1)){
            if(endorserCtrts[i] == _oldEndorser){
                endorserCtrts[i] = _newEndorser;
                emit ChangeEndorserCtrtEvent(_oldEndorser, _newEndorser, _timeCurrent);
            }
        }
    }


    function() external payable { revert("should not send any ether directly"); }
}


//"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 201903061045

contract AssetBook is MultiSig {
    using SafeMath for uint256;
    using AddressUtils for address;

    /** @dev asset資料結構 */
    struct Asset{
        bytes32 symbol;
        uint balance; //Token數量
        bool isInitialized;
    }
    mapping (address => Asset) assets;//assets[assetAddr]
    uint public assetCindex;//last submitted index and total count of current assets, and each asset has an assetAddr
    mapping (uint => address) assetIndexToAddr;//starts from 1, 2... assetCindex. each assset address has an unique index in this asset contract
    mapping (address => uint) addrToAssetIndex;

    /** @dev asset相關event */
    event TransferAssetEvent(address to, bytes32 symbol, uint _assetId, uint tokenBalance, uint timestamp);
    event TransferAssetBatchEvent(address to, bytes32 symbol, uint[] _assetId, uint tokenBalance, uint timestamp);


    //"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201903061045
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
    function getAsset(uint assetIndex, address assetAddr) public view returns (uint assetIndex_, address assetAddr_, bytes32 symbol, uint balance) {
        if(assetIndex > 0) {
            assetIndex_ = assetIndex;
            assetAddr_ = assetIndexToAddr[assetIndex];
        } else {
            require(assetAddr.isContract(), "assetAddr has to contain a contract");
            assetAddr_ = assetAddr;
            assetIndex_ = addrToAssetIndex[assetAddr];
        }
        HCAT721ITF_assetbook hcat721 = HCAT721ITF_assetbook(address(uint160(assetAddr_)));
        symbol = hcat721.symbol();
        balance = hcat721.balanceOf(address(this));
    }

    function getAssetBatch(uint indexStart, uint amount) 
        external view returns(uint[] memory assetIndexArray, address[] memory assetAddresses, bytes32[] memory assetSymbols, uint[] memory assetBalances) {
        uint indexStart_; uint amount_; address assetAddr;
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

                HCAT721ITF_assetbook hcat721 = HCAT721ITF_assetbook(address(uint160(assetAddr)));
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
        uint indexStart_; uint amount_;
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

    /** @dev transfer `amount` of token quantity with such token that is specified by the assetAddr
        from this assetbook to the _to address, 
        with exchange price of `price`, with the server time being `serverTime`
        Note: the token IDs are chosen according to First In First Out principle
    */
    function checkSafeTransferFromBatch(address assetAddr, 
        address _from, address _to, uint amount, uint price, uint serverTime) external view returns(bool[] memory boolArray) {

        HCAT721ITF_assetbook hcat721 = HCAT721ITF_assetbook(address(uint160(assetAddr)));
        return hcat721.checkSafeTransferFromBatch(_from, _to, amount, price,  serverTime);
    }
    function safeTransferFromBatch(address assetAddr, uint assetIndex, address _to, uint amount,  uint price, uint serverTime) 
        public ckAssetOwner {
        address assetAddr_;
        if(assetIndex > 0) {
            assetAddr_ = assetIndexToAddr[assetIndex];
        } else {
            assetAddr_ = assetAddr;
        }
        require(assetAddr_.isContract(), "assetAddr has to contain a contract");

        HCAT721ITF_assetbook hcat721 = HCAT721ITF_assetbook(address(uint160(assetAddr_)));
        hcat721.safeTransferFromBatch(address(this), _to, amount, price, serverTime);
    }
    function assetbookApprove(address assetAddr, uint assetIndex, address operator, uint amount) external ckAssetOwner {
        address assetAddr_;
        if(assetIndex > 0) {
            assetAddr_ = assetIndexToAddr[assetIndex];
        } else {
            assetAddr_ = assetAddr;
        }
        require(assetAddr_.isContract(), "assetAddr has to contain a contract");

        HCAT721ITF_assetbook hcat721 = HCAT721ITF_assetbook(address(uint160(assetAddr_)));
        hcat721.tokenApprove(operator, amount);
    }


    bytes4 constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;
    /* $notice Handle the receipt of an NFT
     $dev The ERC721 smart contract calls this function on the recipient
      after a `transfer`. This function MAY throw to revert and reject the
      transfer. Return of other than the magic value MUST result in the
      transaction being reverted.
    */
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external pure returns(bytes4) {
        require(_operator != address(0), 'operator address should not be zero');
        require(_from != address(0), 'from address should not be zero');// _from address is contract address if minting tokens
        require(_tokenId > 0, 'tokenId should be greater than zero');
        
        return MAGIC_ON_ERC721_RECEIVED;
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
