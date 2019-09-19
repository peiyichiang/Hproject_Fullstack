pragma solidity ^0.5.4;
//"0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c"
import "./SafeMath.sol";

interface HeliumITF{
    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor);
}
contract TestCtrt {
    uint public HCAT721SerialNumber;
    address public addrHelium;

    constructor (uint _HCAT721SerialNumber, address _addrHelium) public {
        HCAT721SerialNumber = _HCAT721SerialNumber;
        addrHelium = _addrHelium;
    }

    modifier onlyPlatformSupervisor() {
        require(HeliumITF(addrHelium).checkPlatformSupervisor(msg.sender), "only PlatformSupervisor is allowed to call this function");
        _;
    }
    function setHCAT721SerialNumber(uint _hcatSerialNum) public onlyPlatformSupervisor{
        HCAT721SerialNumber = _hcatSerialNum;
    }
    function setHCAT721SerialNumberNG(uint _hcatSerialNum) public {
        HCAT721SerialNumber = _hcatSerialNum;
    }
}
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

contract ExtractTokenId {
    uint public count;

    constructor() public {
        owner = msg.sender;
        accounts[owner].idxStart = 2;
        accounts[owner].idxEnd = 7;

        accounts[owner].indexToId[2] = 21;
        accounts[owner].indexToId[3] = 53;
        accounts[owner].indexToId[4] = 70;
        accounts[owner].indexToId[5] = 14;
        accounts[owner].indexToId[6] = 37;
        accounts[owner].indexToId[7] = 42;

    }

    mapping(address => Account) internal accounts;//accounts[user]
    struct Account {
        uint idxStart;
        uint idxEnd;
        mapping (uint => uint) indexToId;
        //account index to _tokenId: accounts[user].indexToId[index] //For First In First Out(FIFO) transfer rule
        mapping (address => uint) allowed;
        //each operator has given quota to send certain account's N amount of tokens
    }

    function getTokenIds() view public returns () {
        uint amount_ = accounts[owner].idxEnd - accounts[owner].idxStart + 1;
        for(uint i = accounts[owner].idxStart; i < amount_; i = i.add(1)) {
            arrayOut[i] = accounts[user].indexToId[i.add(indexStart_)];
        }
        
    }
    
    function sendTokenById(address from, address _to, uint tokenId) view public {
        //accounts[from].indexToId[index]
        //array1[idx] => accounts[from].indexToId[idx]
        uint idxEndF = accounts[from].idxEnd;
        uint idxStartF = accounts[from].idxStart;

        if(tokenId === accounts[from].indexToId[idxStartF]){
          delete accounts[from].indexToId[idxStartF];
          idxStartF = idxStartF.add(1);

        } else if(tokenId === accounts[from].indexToId[idxEndF]) {
          delete accounts[from].indexToId[idxEndF];
          idxEndF = idxEndF.sub(1);

        } else {
            for(uint idx = idxStartF.add(1); idx < idxEndF; idx = idx.add(1)) {
                if(accounts[from].indexToId[idx] === tokenId){
                  accounts[from].indexToId[idx] = accounts[from].indexToId[idxEndF];
                  delete accounts[from].indexToId[idxEndF];
                  idxEndF = idxEndF.sub(1);
                }
            }
        }

        idToAsset[tokenId].owner = _to;

        uint idxEndT = accounts[_to].idxEnd;
        uint idxStartT = accounts[_to].idxStart;
        accounts[_to].idxEnd = idxEndT.add(1);
        accounts[_to].indexToId[idxEndT.add(1)] = tokenId;
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
