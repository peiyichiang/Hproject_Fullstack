pragma solidity ^0.5.4;
/* v2.0
=> Unix timestamp problem so 'now' cannot be used to get correct time in 2038!!!
=> use yyyymmddhhmm to record time
<<<<<<< HEAD:ethereum/contracts/ERC721SPLC20190410.sol
=======

//https://github.com/0xcert/ethereum-erc721/blob/master/contracts/tokens/ERC721.sol
>>>>>>> livechain:ethereum/contracts/Archives/ERC721SPLC20190410.sol
*/
import "./SafeMath.sol";

interface ERC721ITF {
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed tokenOwner, address indexed approvedUser, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed user, address indexed _operator, bool isApproved);

    function balanceOf(address user) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata _data) external;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external;
    function transferFrom(address _from, address _to, uint256 _tokenId) external;

    function approve(address user, uint256 _tokenId) external;
    function setApprovalForAll(address _operator, bool user) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address user, address _operator) external view returns (bool);
}

/*An application MUST implement the wallet interface if it will accept safe transfers. $dev Note: the ERC-165 identifier for this interface is 0x150b7a02.*/
interface ERC721TokenReceiverITF {
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external pure returns(bytes4);
}

//supportsInterface[0x01ffc9a7] will be true, must not set element 0xffffffff to true!!!!!
interface ERC165ITF {
  function supportsInterface(bytes4 _interfaceID) external view returns (bool);
}
contract SupportsInterface is ERC165ITF {
    mapping(bytes4 => bool) internal supportedInterfaces;
    constructor() public {
        supportedInterfaces[0x01ffc9a7] = true; // ERC165ITF, must not set element 0xffffffff to true!!!!!
    }
    function supportsInterface(bytes4 _interfaceID) external view returns (bool) {
        return supportedInterfaces[_interfaceID];
    }
}

//RegistryITF(addrRegistry).isAddrApproved(_to);
interface RegistryITF {
    function isAddrApproved(address assetCtAddr) external view returns (bool);
}

//TokenControllerITF(addrTokenController).isAdmin(msg.sender);
interface TokenControllerITF {
    function isAdmin(address sender) external view returns (bool);
    function isUnlockedValid() external view returns (bool);
}

//------------------------HCAT721: Helium Crypto Asset Token
contract ERC721SPLC_HToken is SupportsInterface {//ERC721ITF, 
    using SafeMath for uint256;
    using AddressUtils for address;

    mapping(address => Account) internal accounts;//accounts[user]
    struct Account {
        uint idxStart;
        uint idxEnd;
        mapping (uint => uint) indexToId;//time index to _tokenId: accounts[user].indexToId[index] //For First In First Out(FIFO) transfer rule
        mapping (address => uint) allowed;
        //each operator has given quota to send certain account's N amount of tokens
    }
    mapping(uint256 => Asset) public idToAsset;//NFT ID to token assets
    struct Asset {
        address owner;
        address approvedAddr;//approved to be transferred by one of the operators or the owner himself
    }

    uint public tokenId;//Token ID and also the count of all issued tokens. starts from 1
    uint public siteSizeInKW;//the physical site electrical output in Kw. Typ 300kw
    uint public maxTotalSupply;// total allowed tokens for this contract. 790 Assets
    uint public totalSupply;//total generated tokens - destroyed tokens
    uint public initialAssetPricing;// initial asset pricing, which is the pricing published during the crowdfunding event. Typical value 17000
    string public pricingCurrency;// the currency name that the initialAssetPricing is based on, e.g. NTD or USD
    uint public IRR20yrx100;// 470 represents 4.7;  20 years (per year) IRR times 100;

    address public addrRegistry;// address of Registry contract
    address public addrTokenController;// address of TokenController contract

    string public name;//descriptive name for the issued tokens
    string public symbol;//abbreviated name for issued tokens
    bytes32 public tokenURI;//location that stores additional token specific information

    bytes4 constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;
    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))` ... which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`

    /** Contract code size over limit of 24576 bytes.
    "NCCU site No.1(2018)", "NCCU1801", 300, 800, 17000, "NTD", 470, "0x0dcd2f752394c41875e259e00bb44fd505297caf",
    "0xbbf289d846208c16edc8474705c748aff07732db", 0x0348538441  */
    constructor(
        string memory _nftName, string memory _nftSymbol, 
        uint _siteSizeInKW, uint _maxTotalSupply, uint _initialAssetPricing, 
        string memory _pricingCurrency, uint _IRR20yrx100,
        address _addrRegistry, address _addrTokenController,
        bytes32 _tokenURI) public {
        name = _nftName;
        symbol = _nftSymbol;
        tokenURI = _tokenURI;

        siteSizeInKW = _siteSizeInKW;
        maxTotalSupply = _maxTotalSupply;
        initialAssetPricing = _initialAssetPricing;
        pricingCurrency = _pricingCurrency;
        IRR20yrx100 = _IRR20yrx100;
        
        addrRegistry = _addrRegistry;
        addrTokenController = _addrTokenController;
        supportedInterfaces[0x80ac58cd] = true;// ERC721ITF
        supportedInterfaces[0x5b5e139f] = true;// ERC721Metadata
        supportedInterfaces[0x780e9d63] = true;// ERC721Enumerable
    }
    
    function getTokenContractDetails() external view returns (
        uint tokenId_, uint siteSizeInKW_, uint maxTotalSupply_,
        uint totalSupply_, uint initialAssetPricing_, 
        string memory pricingCurrency_, uint IRR20yrx100_, string memory name_, string memory symbol_, bytes32 tokenURI_) {
            tokenId_ = tokenId;
            siteSizeInKW_ = siteSizeInKW;
            maxTotalSupply_ = maxTotalSupply;
            totalSupply_ = totalSupply;
            initialAssetPricing_ = initialAssetPricing;
            pricingCurrency_ = pricingCurrency;
            IRR20yrx100_ = IRR20yrx100;
            name_ = name;
            symbol_ = symbol;
            tokenURI_ = tokenURI;
    }

    function ownerOf(uint256 _tokenId) 
        external view returns (address owner_) {
        owner_ = idToAsset[_tokenId].owner;
        require(owner_ != address(0), "owner_ does not exist");
    }
    function getIdToAsset(uint _tokenId) external view returns (
        address ownerAddr, address approvedAddr) {
        Asset memory asset = idToAsset[_tokenId];
        ownerAddr = asset.owner;
        approvedAddr = asset.approvedAddr;
        require(ownerAddr != address(0), "ownerAddr should not be 0x0");
    }

    //去ERC721合約中撈 持幣user資料
    function getTokenOwners(uint indexStart, uint amount) 
        external view returns(address[] memory ownerAddrs) {
        uint indexStart_; uint amount_;            
        if(indexStart == 0 && amount == 0) {
          indexStart_ = 1;
          amount_ = tokenId;

        } else {
          require(indexStart > 0, "Token indexStart must be > 0");
          require(amount > 0, "amount must be > 0");

          if(indexStart.add(amount).sub(1) > tokenId) {
            amount_ = tokenId.sub(indexStart).add(1);
          } else {
            amount_ = amount;
          }
        }
        ownerAddrs = new address[](amount_);

        for(uint i = 0; i < amount_; i = i.add(1)) {
          Asset memory asset = idToAsset[i.add(indexStart)];
            ownerAddrs[i] = asset.owner;
        }
    }
<<<<<<< HEAD:ethereum/contracts/ERC721SPLC20190410.sol
=======

>>>>>>> livechain:ethereum/contracts/Archives/ERC721SPLC20190410.sol

    //---------------------------==Account
    function getAccount(address user) external view 
      returns (uint idxStart, uint idxEnd) {
        idxStart = accounts[user].idxStart;
        idxEnd = accounts[user].idxEnd;
    }

    function balanceOf(address user) external view returns (uint balance) {
        require(user != address(0), "user does not exist");
        uint idxStart = accounts[user].idxStart;
        uint idxEnd = accounts[user].idxEnd;

        if(idxStart == 0 && idxEnd == 0 && accounts[user].indexToId[0] == 0) {
            //balance = 0; arrayOut = [];
        } else if(idxStart > idxEnd) {
            //balance = 0; arrayOut = [];
        } else {
            balance = idxEnd.sub(idxStart).add(1);
        }
    }

    function getTokenIdByIndex(address user, uint idx) external view returns (uint256 tokenId_) {
        // idx is the index of tokenId in question, inside the user account
        require(user != address(0), "user should not be 0x0");
        require(idx <= accounts[user].idxEnd, "idx should be <= idxEnd");
        require(idx >= accounts[user].idxStart, "idx should be >= idxStart");
        tokenId_ = accounts[user].indexToId[idx];
    }

    function getAccountIds(address user, uint indexStart, uint amount) external view 
    returns (uint[] memory arrayOut) {
        //indexStart == 0 and amount == 0 for all Ids(min idxStart and max amount)
        require(user != address(0), "user should not be address(0)");
        uint idxStart = accounts[user].idxStart;
        uint idxEnd = accounts[user].idxEnd;

        if(idxStart == 0 && idxEnd == 0 && accounts[user].indexToId[0] == 0) {
            //arrayOut = [];
        } else if(idxStart > idxEnd) {
            //arrayOut = [];
        } else {
            uint amount_; uint indexStart_;
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
<<<<<<< HEAD:ethereum/contracts/ERC721SPLC20190410.sol
=======

>>>>>>> livechain:ethereum/contracts/Archives/ERC721SPLC20190410.sol
        }
    }

    event MintSerialNFT(address indexed newOwner, uint amountMinted, uint indexed serverTime);
    function mintSerialNFT(address _to, uint amount, uint serverTime) public {
        require(TokenControllerITF(addrTokenController).isAdmin(msg.sender), 'only admin can mint tokens');

        //Legal Compliance, also block address(0)
        require(RegistryITF(addrRegistry).isAddrApproved(_to), "_to is not in compliance");

        if (_to.isContract()) {//also checks for none zero address
            bytes4 retval = ERC721TokenReceiverITF(_to).onERC721Received(
                msg.sender, address(this), 1, "");
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        }

        require(amount > 0, "amount must be > 0");
        totalSupply = tokenId.add(amount);
        require(totalSupply <= maxTotalSupply, "max allowed token amount has been reached");
        emit MintSerialNFT(_to, amount, serverTime);

        uint idxEnd = accounts[_to].idxEnd;
        uint idxStart = accounts[_to].idxStart;
        uint idxStartReq; uint idxEndReq;
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
            accounts[_to].indexToId[i] = tokenId;
        }
        accounts[_to].idxEnd = idxEndReq;

    }

    //---------------------------==Transfer
    function safeTransferFromBatch(address _from, address _to, uint amount, uint price, uint serverTime) external {
        require(amount > 0, "amount should be > 0");
        require(price > 0, "price should be > 0");
        require(_from != _to, "_from should not be equal to _to");

        if (_to.isContract()) {
            bytes4 retval = ERC721TokenReceiverITF(_to).onERC721Received(
                msg.sender, _from, 1, "");
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        }

        require(TokenControllerITF(addrTokenController).isUnlockedValid(),'token cannot be transferred due to either unlock period or after valid date');
        //Legal Compliance
        require(RegistryITF(addrRegistry).isAddrApproved(_to), "_to is not in compliance");
        require(RegistryITF(addrRegistry).isAddrApproved(_from), "_from is not in compliance");

        _safeTransferFromBatch(_from, _to, amount, price, serverTime);
    }

    event SafeTransferFromBatch(address indexed _from, address indexed _to, uint amount, uint price, uint indexed serverTime);//this function should be called by an Exchange contract, which should be trustworthy enough to give the correct price and serverTime


    function _safeTransferFromBatch(address _from, 
        address _to, uint amount, uint price, uint serverTime) internal {
          //price will be the same as acquiredCost, assuming no transaction fee

        uint idxStartF = accounts[_from].idxStart;
        uint idxEndF = accounts[_from].idxEnd;
        require(idxStartF <= idxEndF, "not enough asset to transfer: balance = 0");
        require(idxEndF.sub(idxStartF).add(1) >= amount, "not enough asset to transfer: balance < amount");

        //fix _to account
        uint idxStartT = accounts[_to].idxStart;
        uint idxEndT = accounts[_to].idxEnd;
        uint idxStartReqT; //uint idxEndReqT;
        if (idxStartT > idxEndT) {
          accounts[_to].idxStart = 0;
          accounts[_to].idxEnd = amount.sub(1);
          //idxStartReqT = 0;
          //idxEndReqT = amount.sub(1);
        } else if (idxStartT == 0 && idxEndT == 0 && accounts[_to].indexToId[0] == 0) {
          accounts[_to].idxEnd = amount.sub(1);
          //idxStartReqT = 0;
          //idxEndReqT = amount.sub(1);
        } else {
          idxStartReqT = idxEndT.add(1);
          accounts[_to].idxEnd = idxEndT.add(amount);
          //idxEndReqT = idxEndT.add(amount);
        }//accounts[_to].indexToId[0]


        //uint allowedAmount = accounts[_from].allowed[msg.sender];
        for(uint i = 0; i < amount; i = i.add(1)) {
            //inside _from account
            uint idxFrom = i.add(idxStartF);
            uint tokenId_ = accounts[_from].indexToId[idxFrom];
            delete accounts[_from].indexToId[idxFrom];

            address tokenOwner = idToAsset[tokenId_].owner;
            require(tokenOwner == _from, "tokenOwner should be _from");
            //require(tokenOwner != address(0), "owner should not be 0x0");

            //if(tokenOwner == msg.sender || idToAsset[tokenId_].approvedAddr == msg.sender){
            // } else if(allowedAmount > 0) {
            //     allowedAmount = allowedAmount.sub(1);
            // } else {
            //   revert("msg.sender should be tokenOwner, an approved, or a token operator has enough allowed amount");
            // }

            // require(
            // tokenOwner == msg.sender || idToAsset[tokenId_].approvedAddr == msg.sender 
            // || allowedAmount > amount, 
            // "msg.sender should be tokenOwner, an approved, or a token operator has enough allowed amount");

            idToAsset[tokenId_].owner = _to;
            clearApproval(tokenId_);

            accounts[_to].indexToId[i.add(idxStartReqT)] = tokenId_;
        }

        // if(allowedAmount < accounts[_from].allowed[msg.sender]){
        //     accounts[_from].allowed[msg.sender] = allowedAmount;
        // }

        //fix _from account
        if (idxEndF == idxStartF.add(amount).sub(1)) {
            accounts[_from].idxStart = 1;
            accounts[_from].idxEnd = 0;
        } else {
            accounts[_from].idxStart = idxStartF.add(amount);
        }

        emit SafeTransferFromBatch(_from, _to, amount, price, serverTime);
    }
<<<<<<< HEAD:ethereum/contracts/ERC721SPLC20190410.sol
    
=======


>>>>>>> livechain:ethereum/contracts/Archives/ERC721SPLC20190410.sol
    //-------------------------------==Approvals
    function approveAmount(address _operator, uint amount) external {
        require(_operator != address(0), "_operator should not be 0x0");
        accounts[msg.sender].allowed[_operator] = amount;
        emit ApprovalAmount(msg.sender, _operator, amount);
    }
    function allowance(address user, address _operator) 
        external view returns (uint remaining) {
        require(user != address(0), "user should not be 0x0");
        require(_operator != address(0), "_operator should not be 0x0");
        remaining = accounts[user].allowed[_operator];
    }
<<<<<<< HEAD:ethereum/contracts/ERC721SPLC20190410.sol
=======


>>>>>>> livechain:ethereum/contracts/Archives/ERC721SPLC20190410.sol
    //--------------==ID based
    /** $dev Clears the current approvedAddr of a given NFT ID.
     $param _tokenId ID of the NFT to be transferred. */
    function clearApproval(uint256 _tokenId) private {
        require(_tokenId > 0, "_tokenId should > 0");
        if(idToAsset[_tokenId].approvedAddr != address(0)) {
            delete idToAsset[_tokenId].approvedAddr;
        }
    }

    function getApproved(uint256 _tokenId) external view returns (address) {
        require(idToAsset[_tokenId].owner != address(0), "owner should not be 0x0");
        return idToAsset[_tokenId].approvedAddr;
    }

    function() external payable { revert("should not send any ether directly"); }

    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed tokenOwner, address indexed approvedUser, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed tokenOwner, address indexed _operator, bool isApproved);
    // event BurnNFT(address user, uint _tokenId, address msgsender);
    event ApprovalAmount(address indexed tokenOwner, address indexed _operator, uint amount);

<<<<<<< HEAD:ethereum/contracts/ERC721SPLC20190410.sol

=======
>>>>>>> livechain:ethereum/contracts/Archives/ERC721SPLC20190410.sol
    /** $dev Guarantees that the msg.sender is 
    an owner or operator of the given NFT.
    * $param _tokenId ID of the NFT to validate.   */
    modifier canOperate(uint256 _tokenId) {
        address tokenOwner = idToAsset[_tokenId].owner;
        require(
            tokenOwner == msg.sender || accounts[tokenOwner].allowed[msg.sender] > 0,
            "tokenOwner should be either msg.sender or is an approved operator");
        _;
    }

    /** $dev Guarantees that the msg.sender is allowed to transfer NFT.
    * $param _tokenId ID of the NFT to transfer.   */
    modifier canTransfer(uint256 _tokenId) {
        address tokenOwner = idToAsset[_tokenId].owner;
        require(
            tokenOwner == msg.sender || idToAsset[_tokenId].approvedAddr == msg.sender || accounts[tokenOwner].allowed[msg.sender] > 0, "msg.sender should be tokenOwner, an approved, or a token operator");
        _;
    }
    /** $dev Guarantees that _tokenId is a valid Token. Check if such _tokenId exists. $param _tokenId ID of the NFT to validate.   */
    modifier validNFToken(uint256 _tokenId) {
        require(idToAsset[_tokenId].owner != address(0), "owner should not be 0x0");
        _;
    }

}
<<<<<<< HEAD:ethereum/contracts/ERC721SPLC20190410.sol
=======

>>>>>>> livechain:ethereum/contracts/Archives/ERC721SPLC20190410.sol

//--------------------==
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) }
        // solium-disable-line security/no-inline-assembly
        return size > 0;
    }
<<<<<<< HEAD:ethereum/contracts/ERC721SPLC20190410.sol
}
=======
}

>>>>>>> livechain:ethereum/contracts/Archives/ERC721SPLC20190410.sol
