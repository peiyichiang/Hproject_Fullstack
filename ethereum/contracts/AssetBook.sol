pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
//deploy parameters: "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201902191745
import "./SafeMath.sol";//not used i++ is assumed not to be too big

interface ERC721SPLCITF_assetbook {
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function getAccountIds(address user, uint idxS, uint idxE) external;

    function approve(address _approved, uint256 _tokenId) external;
    function setApprovalForAll(address _operator, bool _approved) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);

    function name() external view returns (string memory _name);
    function symbol() external view returns (string memory _symbol);
    function getTokenOwners(uint idStart, uint idCount) external view returns(address[] memory);
    function safeTransferFromBatch(address _from, address _to, uint amount, uint price, uint serverTime) external;
}

contract MultiSig {
    using SafeMath for uint256;
    using AddressUtils for address;

    address public assetOwner; /** @dev 用戶 EOA */
    address public platformCtrt; /** @dev 平台方 */
    address[] public endorserCtrts; /** @dev 背書者的 (一到三個人) */
    // we require platformCtrt and endorserCtrt because EOA may change ...
    uint public assetOwner_flag;
    uint public platformCtrt_flag;
    uint public endorserCtrts_flag;

    /** @dev multiSig相關event */
    event ChangeAssetOwnerEvent(address indexed oldAssetOwner, address indexed newAssetOwner, uint256 timestamp);
    event ChangeEndorserCtrtEvent(address indexed oldEndorserCtrt, address indexed newEndorserCtrt, uint256 timestamp);
    event AddEndorserEvent(address indexed endorserCtrts, uint256 timestamp);
    event AssetOwnerVoteEvent(address indexed assetOwner, uint256 timestamp);
    event PlatformCtrtVoteEvent(address indexed platformCtrt, uint256 timestamp);
    event EndorserVoteEvent(address indexed endorserContractAddr, uint256 timestamp);

    //"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c"
    // constructor (address _assetOwner, address _platformCtrt) public {
    //     assetOwner = _assetOwner;
    //     platformCtrt = _platformCtrt;
    // }
    /** @dev 檢查是否為合約擁有者 */
    modifier ckAssetOwner(){
        require(msg.sender == assetOwner, "sender must be assetOwner");
        _;
    }
    modifier ckIsContract(address _assetAddr) {
        require(_assetAddr.isContract(), "_assetAddr has to contain a contract");
        //require(_assetAddr != address(0), "_assetAddr should not be zero");
        _;
    }

    // for assetOwner to vote
    function assetOwnerVote(uint256 _timeCurrent) external ckAssetOwner {
        assetOwner_flag = 1;
        emit AssetOwnerVoteEvent(msg.sender, _timeCurrent);
    }

    // for platformCtrt to vote
    function platformCtrtVote(uint256 _timeCurrent) external {
        require(msg.sender == platformCtrt, "sender must be Platform Contract");
        platformCtrt_flag = 1;
        emit PlatformCtrtVoteEvent(msg.sender, _timeCurrent);
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
        return (assetOwner_flag + platformCtrt_flag + endorserCtrts_flag);
    }

    /** @dev 重置簽章狀態 */
    function resetVoteStatus() internal {
        assetOwner_flag = 0;
        platformCtrt_flag = 0;
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
        string symbol;
        uint balance; //Token數量
        bool isInitialized;
    }
    mapping (address => Asset) assets;//assets[_assetAddr]
    uint public assetCindex;//count and index of assets, and each asset has an assetAddr
    mapping (uint => address) assetIndexToAddr;//starts from 1, 2... assetCindex. each assset address has an unique index in this asset contract

    /** @dev asset相關event */
    event TransferAssetEvent(address to, string symbol, uint _assetId, uint tokenBalance, uint timestamp);
    event TransferAssetBatchEvent(address to, string symbol, uint[] _assetId, uint tokenBalance, uint timestamp);


    //"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 201903061045
    constructor (address _assetOwner, address _platformCtrt) public {
        assetOwner = _assetOwner;
        platformCtrt = _platformCtrt;
    }


    /** @dev get assets info: asset symbol and balance on this assetbook’s account
			_assetAddr is the asset contract address */
    function getAsset(address _assetAddr) public view ckIsContract(_assetAddr) 
    returns (string memory symbol, uint balance) {
        ERC721SPLCITF_assetbook erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        symbol = erc721.symbol();
        balance = erc721.balanceOf(address(this));
    }


    // /** @dev 新增token(當 erc721_token 分配到 AssetBookCtrt 的時候記錄起來) */
    // function addAsset(address _assetAddr, string calldata symbol, uint balance) external {
    //     //assets[_assetAddr].isApprovedForAsset = true;
    //     require(_assetAddr.isContract(), "_assetAddr must contain a contract");//_assetAddr != address(0)

    //     if(!assets[_assetAddr].isInitialized){
    //         assets[_assetAddr].isInitialized = true;

    //         assets[_assetAddr].symbol = symbol;
    //         assets[_assetAddr].balance = balance;

    //         assetCindex = assetCindex.add(1);
    //         assetIndexToAddr[assetCindex] = _assetAddr;
    //     } else {
    //         assets[_assetAddr].balance = balance;
    //     }
    // }
    // function getAssetFromAssetBook(address _assetAddr) public view ckIsContract(_assetAddr) 
    // returns (string memory symbol, uint balance, bool isInitialized) {
    //     Asset memory asset = assets[_assetAddr];
    //     symbol = asset.symbol;
    //     balance = asset.balance;
    //     isInitialized = asset.isInitialized;
    // }

    // function updateAsset(address _assetAddr) external {
    //     require(_assetAddr.isContract(), "_assetAddr has to contain a contract");
    //     ERC721SPLCITF_assetbook erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));

    //     if (assets[_assetAddr].isInitialized) {
    //         assets[_assetAddr].balance = erc721.balanceOf(address(this));

    //     } else {
    //         assets[_assetAddr].isInitialized = true;
    //         assets[_assetAddr].symbol = erc721.symbol();
    //         assets[_assetAddr].balance = erc721.balanceOf(address(this));
    //     }
    // }


    // function deleteAsset(address _assetAddr) public ckIsContract(_assetAddr) {
    //     require(msg.sender == platformCtrt || msg.sender == assetOwner, "check if sender is approved");
    //     require(assets[_assetAddr].isInitialized, "this _assetAddr has not been initialized");
    //     assets[_assetAddr].isInitialized = false;

    //     delete assetIndexToAddr[assetCindex];
    //     assetCindex = assetCindex.sub(1);
    //     delete assets[_assetAddr].symbol;
    //     delete assets[_assetAddr].balance;
    // }
    

    /** @dev transfer `amount` of token quantity with such token that is specified by the _assetAddr
        from this assetbook to the _to address, 
        with exchange price of `price`, with the server time being `serverTime`
        Note: the token IDs are chosen according to First In First Out principle
    */
    function safeTransferFromBatch(address _assetAddr, uint amount, address _to, uint price, uint serverTime) 
        public ckAssetOwner ckIsContract(_assetAddr){
        ERC721SPLCITF_assetbook erc721 = ERC721SPLCITF_assetbook(address(uint160(_assetAddr)));
        erc721.safeTransferFromBatch(address(this), _to, amount, price, serverTime);
    }

    /** @dev to get all assetAddr stored in this assetbook contract
        Because all asset contract are added with an index number,
        we can search them according to the index number

        indexStart is the index to start the search
        amount is the output number of results we would like to received
        but if the indexStart or the amount value is too large,
        then this function will automatically find all the asset addresses that has asset index greater or equal to indexStart
    */
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
        /*the following will fail if data is empty!!!
        uint32 u = uint32(data[3]) + (uint32(data[2]) << 8) + (uint32(data[1]) << 16) + (uint32(data[0]) << 24);
        tkn.sig = bytes4(u);//tkn.sig is 4 bytes signature of function
        if data of token transaction is a function execution
        TKN has element of bytes4 sig;
        */
        return MAGIC_ON_ERC721_RECEIVED;
    }

    function() external payable { revert("should not send any ether directly"); }
}

//"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c"
contract ERC721Testing {
    using SafeMath for uint256;
    
    mapping(uint256 => Asset) public idToAsset;//NFT ID to token assets
    struct Asset {
        address owner;
        uint acquiredCost;
        address approvedAddr;//approved to be transferred by one of the operators or the owner himself
    }
    
    mapping(address => Account) public accounts;//accounts[user]
    struct Account {
        uint idxStart;
        uint idxEnd;
        mapping (uint => uint) indexToId;//time index to _tokenId: accounts[user].indexToId[index]
        mapping (address => bool) operators;
    }

    uint public tokenId;
    address public user1 = 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c;
    address public user2 = 0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C;
    uint public amount_;
    uint public indexStart_;
    uint public idxStart;
    uint public idxEnd;
    uint public idxStartReq;
    uint public idxEndReq;
    address public _to;
    address public user;
    // constructor (address _user1, address _user2) public {
    //   user1 = _user1;
    //   user2 = _user2;
    // }
    function getAccountIndexToId(uint userNum, uint idIndex) public returns (uint tokenId_) {
        if (userNum == 1) { _to = user1;
        } else if (userNum == 2) {
          _to = user2;
        }
        tokenId_ = accounts[_to].indexToId[idIndex];
    }
    function mintSerialNFT(uint userNum, uint amount) public {
        if (userNum == 1) { _to = user1;
        } else if (userNum == 2) {
          _to = user2;
        }
        idxEnd = accounts[_to].idxEnd;
        idxStart = accounts[_to].idxStart;
        if (idxStart == 0 && idxEnd == 0 && accounts[_to].indexToId[0] == 0) {
          //idxStartReq = 0;
          idxEndReq = amount.sub(1);
        } else if (idxStart > idxEnd) {
          //idxStartReq = 0;
          idxEndReq = amount.sub(1);
        } else {
          idxStartReq = idxEnd.add(1);
          idxEndReq = idxEnd.add(amount);
        }

        for(uint i = idxStartReq; i <= idxEndReq; i = i.add(1)) {
            tokenId = tokenId.add(1);
            idToAsset[tokenId].owner = _to;
            idToAsset[tokenId].acquiredCost = 17000;
            //idToAsset[tokenId] = Asset(_to, initialAssetPricing, address(0));
            accounts[_to].indexToId[i] = tokenId;
        }
        accounts[_to].idxEnd = idxEndReq;
    }

    function getAccountIds(uint userNum, uint indexStart, uint amount) external  
    returns (uint[] memory arrayOut) {
        if (userNum == 1) { user = user1;
        } else if (userNum == 2) {
          user = user2;
        }

        //indexStart == 0 and amount == 0 for all Ids(min idxStart and max amount)
        require(user != address(0), "user should not be address(0)");

        idxStart = accounts[user].idxStart;
        idxEnd = accounts[user].idxEnd;
        //require(indexStart >= idxStart, "indexStart must be >= idxStart");
        //require(idxE <= idxEnd, "idxE must be <= idxEnd");

        if(idxStart == 0 && idxEnd == 0 && accounts[user].indexToId[0] == 0) {

        } else if(idxStart > idxEnd) {

        } else {
            if (indexStart == 0 && amount == 0) {
              indexStart_ = idxStart;//set to min indexStart
              amount_ = idxEnd.sub(idxStart).add(1);//set to max amount

            } else if (indexStart.add(amount).sub(1) > idxEnd) {
              indexStart_ = indexStart;
              amount_ = idxEnd.sub(indexStart).add(1);
            } else {
              indexStart_ = indexStart;
              amount_ = amount;
            }
            arrayOut = new uint[](amount_);

            for(uint i = 0; i < amount_; i = i.add(1)) {
                arrayOut[i] = accounts[user].indexToId[i.add(indexStart_)];
            }
            //return arrayOut;
            // uint length = idxE.sub(indexStart).add(1);
            // arrayOut = new uint[](length);
            // for(uint i = indexStart; i < length; i = i.add(1)) {
            //     arrayOut[i] = accounts[user].indexToId[i];
            // }
        }
    }
}


contract CrowdFundingTesting {
    using SafeMath for uint256;

    mapping(uint => Account) public accounts;
    struct Account {
        address assetbook;
        uint256 qty;
    }
    uint public cindex;

    //  "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 1
    function invest(address _assetbook, uint _quantityToInvest) public {
        cindex = cindex.add(1);
        accounts[cindex].assetbook = _assetbook;
        accounts[cindex].qty = _quantityToInvest;
    }

    //1, 100
    function getInvestors(uint indexStart, uint amount) 
        external view returns(address[] memory, uint[] memory) {
        require(amount > 0, "amount must be > 0");
        require(indexStart > 0, "indexStart must be > 0");
        uint amount_;
        if(indexStart.add(amount).sub(1) > cindex) {
          amount_ = cindex.sub(indexStart).add(1);
        } else {
          amount_ = amount;
        }
        address[] memory assetbooks = new address[](amount_);
        uint[] memory qtyArray = new uint[](amount_);

        for(uint i = 0; i < amount_; i = i.add(1)) {
            assetbooks[i] = accounts[i.add(indexStart)].assetbook;
            qtyArray[i] = accounts[i.add(indexStart)].qty;
        }
        return (assetbooks, qtyArray);
    }

    //inputs: [0, 1, 2, 3, 4], 0, 4, 1      [0, 1, 2, 3, 4], 0, 4, 0
    //sliceA gives the 1st part of the input array
    function sliceA(uint[] calldata array, uint idxStart, uint idxEnd, uint amount) 
        external pure returns (uint[] memory arrayOut){
        //ckIsContract(_assetAddr)
        uint arrayLen = array.length;
        require(arrayLen == idxEnd.sub(idxStart).add(1), "array length should be equal to idxEnd-idxStart+1");
        require(idxStart <= idxEnd, "idxStart must be <= idxEnd");
        require(amount > 0, "amount must be > 0");
        require(amount <= arrayLen, "amount must be <= arrayLen");

        uint idxEndReq = idxStart.add(amount).sub(1);
        require(idxEndReq <= idxEnd, "idxEndReq must be equal to/lesser than idxEnd");

        arrayOut = new uint[](amount);
        for(uint i = 0; i <= idxEndReq; i = i.add(1)) {
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
          for(uint i = idxStartOut; i <= idxEnd; i = i.add(1)) {
              arrayOut[i.sub(idxStartOut)] = array[i];
          }
        }

    }
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
