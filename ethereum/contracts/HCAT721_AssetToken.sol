pragma solidity ^0.5.4;
import "./SafeMath.sol";

interface HeliumITF_HCAT{
    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor);
}

/*An application MUST implement the wallet interface if it will accept safe transfers. $dev Note: the ERC-165 identifier for this interface is 0x150b7a02.*/
interface ERC721TokenReceiverITF {
    function onERC721Received(address operator, address _from, uint256 _tokenId, bytes calldata _data) external pure returns(bytes4);
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

//RegistryITF_HCAT(addrRegistry).isAddrApproved(_to);
interface RegistryITF_HCAT {
    function isAssetbookApproved(address assetbookAddr) external view returns (bool);
    function isFundingApproved(
        address assetbookAddr, uint buyAmount, uint balance, uint fundingType) external view returns (bool isOkBuyAmount, bool isOkBalanceNew, uint authLevel, uint maxBuyAmount, uint maxBalance);
}

interface TokenControllerITF {
    function isTokenApprovedOperational() external view returns (bool);
}

//------------------------HCAT721: Helium Cryptic Asset Token
contract HCAT721_AssetToken is SupportsInterface {//ERC721ITF,
    using SafeMath for uint256;
    using AddressUtils for address;
    address public addrHelium;

    mapping(address => Account) internal accounts;//accounts[user]
    struct Account {
        uint idxStart;
        uint idxEnd;
        mapping (uint => uint) indexToId;
        //account index to _tokenId: accounts[user].indexToId[index] //For First In First Out(FIFO) transfer rule
        mapping (address => uint) allowed;
        //each operator has given quota to send certain account's N amount of tokens
    }
    mapping(uint256 => Asset) public idToAsset;//NFT ID to token assets
    struct Asset {
        address owner;
    }

    uint public tokenId;//same as tokenCindex, the last submitted index and total count of current Token ID. Its value starts from 1
    uint public siteSizeInKW;//the physical site electrical output in Kw. Typ 300kw
    uint public maxTotalSupply;// total allowed tokens for this contract. 790 Assets
    uint public totalSupply;//total generated tokens - destroyed tokens
    uint public initialAssetPricing;// initial asset pricing, which is the pricing published during the crowdfunding event. Typical value 17000
    bytes32 public pricingCurrency;// the currency name that the initialAssetPricing is based on, e.g. NTD or USD
    uint public IRR20yrx100;// 470 represents 4.7;  20 years (per year) IRR times 100;

    address public addrRegistry;// address of Registry contract
    address public addrTokenController;// address of TokenController contract

    bytes32 public name;//descriptive name for the issued tokens
    bytes32 public symbol;//abbreviated name for issued tokens
    bytes32 public tokenURI;//location that stores additional token specific information

    bytes4 constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;
    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))` ... which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`

    /** Contract code size over limit of 24576 bytes.
    0x0348538441, 0x0348538441, 300, 900, 17000, 0x0348538441, 470, "0x0dcd2f752394c41875e259e00bb44fd505297caf",
    "0xbbf289d846208c16edc8474705c748aff07732db", 0x0348538441, "0x0dcd2f752394c41875e259e00bb44fd505297caf"  */
    constructor(
        bytes32 _nftName, bytes32 _nftSymbol,
        uint _siteSizeInKW, uint _maxTotalSupply, uint _initialAssetPricing,
        bytes32 _pricingCurrency, uint _IRR20yrx100,
        address _addrRegistry, address _addrTokenController,
        bytes32 _tokenURI, address _addrHelium) public {

        name = _nftName;
        symbol = _nftSymbol;//may need to check symbol length > 8...
        tokenURI = _tokenURI;

        siteSizeInKW = _siteSizeInKW;
        maxTotalSupply = _maxTotalSupply;
        initialAssetPricing = _initialAssetPricing;
        pricingCurrency = _pricingCurrency;
        IRR20yrx100 = _IRR20yrx100;
        addrRegistry = _addrRegistry;
        addrTokenController = _addrTokenController;
        addrHelium = _addrHelium;
        supportedInterfaces[0x80ac58cd] = true;// ERC721ITF
        supportedInterfaces[0x5b5e139f] = true;// ERC721Metadata
        supportedInterfaces[0x780e9d63] = true;// ERC721Enumerable
    }
    function checkDeploymentConditions(
        bytes32 _nftName, bytes32 _nftSymbol,
        uint _siteSizeInKW, uint _maxTotalSupply, uint _initialAssetPricing,
        bytes32 _pricingCurrency, uint _IRR20yrx100,
        address _addrRegistry, address _addrTokenController,
        bytes32 _tokenURI, address _addrHelium
      ) public view returns(bool[] memory boolArray) {
        boolArray = new bool[](11);
        boolArray[0] = _nftName[0] != 0;
        boolArray[1] = _nftSymbol[0] != 0;
        boolArray[5] = _pricingCurrency[0] != 0;
        boolArray[10] = _tokenURI[0] != 0;
        boolArray[2] = _siteSizeInKW > 0;
        boolArray[3] = _maxTotalSupply > 0;
        boolArray[4] = _initialAssetPricing > 0;
        boolArray[6] = _IRR20yrx100 > 1;
        boolArray[7] = _addrRegistry.isContract();
        boolArray[8] = _addrTokenController.isContract();
        boolArray[9] = _addrHelium.isContract();
    }

    function getTokenContractDetails() external view returns (
        uint tokenId_, uint siteSizeInKW_, uint maxTotalSupply_,
        uint totalSupply_, uint initialAssetPricing_,
        bytes32 pricingCurrency_, uint IRR20yrx100_, bytes32 name_, bytes32 symbol_, bytes32 tokenURI_) {
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
        external view returns (address ownerAddr) {
        ownerAddr = idToAsset[_tokenId].owner;
        require(ownerAddr != address(0), "ownerAddr should not be 0x0");
    }
    function getIdToAsset(uint _tokenId) external view returns (
        address ownerAddr) {
        ownerAddr = idToAsset[_tokenId].owner;
        require(ownerAddr != address(0), "ownerAddr should not be 0x0");
    }

    //去ERC721合約中撈 持幣user資料
    function getTokenOwners(uint indexStart, uint amount)
        external view returns(address[] memory ownerAddrs) {
        uint indexStart_;
        uint amount_;
        if(indexStart == 0 && amount == 0) {
            indexStart_ = 1;
            amount_ = tokenId;

        } else {
            require(indexStart > 0, "Token indexStart must be > 0");
            require(amount > 0, "amount must be > 0");

            if(indexStart.add(amount).sub(1) > tokenId) {
                indexStart_ = indexStart;
                amount_ = tokenId.sub(indexStart).add(1);
            } else {
                indexStart_ = indexStart;
                amount_ = amount;
            }
        }
        ownerAddrs = new address[](amount_);
        for(uint i = 0; i < amount_; i = i.add(1)) {
            Asset memory asset = idToAsset[i.add(indexStart_)];
            ownerAddrs[i] = asset.owner;
        }
    }


    //---------------------------==Account
    function getAccount(address user) external view
      returns (uint idxStart, uint idxEnd) {
        idxStart = accounts[user].idxStart;
        idxEnd = accounts[user].idxEnd;
    }

    function balanceOf(address user) public view returns (uint balance) {
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

    function getAccountIds(address user, uint indexStart, uint amount)
    external view returns (uint[] memory arrayOut) {
        //indexStart == 0 and amount == 0 for all Ids(min idxStart and max amount)
        require(user != address(0), "user should not be address(0)");

        uint idxStart = accounts[user].idxStart;
        uint idxEnd = accounts[user].idxEnd;

        if(idxStart == 0 && idxEnd == 0 && accounts[user].indexToId[0] == 0) {
            //arrayOut = [];
        } else if(idxStart > idxEnd) {
            //arrayOut = [];
        } else {
            uint amount_;
            uint indexStart_;
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

        }
    }

    modifier onlyPlatformSupervisor() {
        require(HeliumITF_HCAT(addrHelium).checkPlatformSupervisor(msg.sender), "only PlatformSupervisor is allowed to call this function");
        _;
    }
    function setAddrHelium(address _addrHelium) external onlyPlatformSupervisor{
        require(HeliumITF_HCAT(addrHelium).checkPlatformSupervisor(msg.sender), "only PlatformSupervisor is allowed to call this function");
        addrHelium = _addrHelium;
    }
    function checkPlatformSupervisor() external view returns (bool){
        return (HeliumITF_HCAT(addrHelium).checkPlatformSupervisor(msg.sender));
    }


    //Legal Compliance, also block address(0)
    //fundingType: 1 Public Offering, 2 Private Placement
    function checkMintSerialNFT(
        address _to, uint amount, uint price, uint fundingType, uint serverTime) external view returns(bool[] memory boolArray, uint[] memory uintArray) {
        //uint[] memory uintArray  , uint authLevel, uint maxBuyAmount, uint maxBalance
        boolArray = new bool[](10);
        uintArray = new uint[](3);
        boolArray[0] = _to.isContract();
        boolArray[1] = ERC721TokenReceiverITF(_to).onERC721Received(
        msg.sender, address(this), 1, "") == MAGIC_ON_ERC721_RECEIVED;
        boolArray[2] = amount > 0;
        boolArray[3] = price > 0;
        boolArray[4] = fundingType > 0;
        boolArray[5] = serverTime > 201905240900;
        boolArray[6] = tokenId.add(amount) <= maxTotalSupply;
        boolArray[7] = HeliumITF_HCAT(addrHelium).checkPlatformSupervisor(msg.sender);
        
        (boolArray[8], boolArray[9], uintArray[0], uintArray[1],
        uintArray[2]) = RegistryITF_HCAT(addrRegistry).isFundingApproved(_to, amount.mul(price), balanceOf(_to).mul(price), fundingType);
        //bool isApprovedBuyAmount, bool isApprovedBalancePlusBuyAmount
        //function isFundingApproved(address assetbookAddr, uint buyAmount, uint balance, uint fundingType) external view returns (bool isOkBuyAmount, bool isOkBalanceNew, uint authLevel, uint maxBuyAmount, uint maxBalance)
    }

    function mintSerialNFT(address _to, uint amount, uint price, uint fundingType, uint serverTime) public onlyPlatformSupervisor{

        (bool isOkBuyAmount, bool isOkBalanceNew,
        , ,) = RegistryITF_HCAT(addrRegistry).isFundingApproved(_to, amount.mul(price), balanceOf(_to).mul(price), fundingType);

        require(isOkBuyAmount && isOkBalanceNew, "[Registry Compliance] isFundingApproved() failed");

        if (_to.isContract()) {//also checks for none zero address
            bytes4 retval = ERC721TokenReceiverITF(_to).onERC721Received(
                msg.sender, address(this), 1, "");
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        }

        require(amount > 0, "amount must be > 0");
        totalSupply = tokenId.add(amount);
        require(totalSupply <= maxTotalSupply, "max allowed token amount has been reached");
        emit MintSerialNFT(_to, amount, price, serverTime, fundingType);

        uint idxEnd = accounts[_to].idxEnd;
        uint idxStart = accounts[_to].idxStart;
        uint idxStartReq;
        uint idxEndReq;
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
    event MintSerialNFT(address indexed newOwner, uint amountMinted, uint price, uint indexed serverTime, uint fundingType);


    //---------------------------==Transfer
    function checkSafeTransferFromBatch(
        address _from, address _to, uint amount, uint price, uint serverTime) external view returns(bool[] memory boolArray) {
        boolArray = new bool[](9);
        boolArray[0] = _to.isContract();
        boolArray[1] = ERC721TokenReceiverITF(_to).onERC721Received(
        msg.sender, _from, 1, "") == MAGIC_ON_ERC721_RECEIVED;
        boolArray[2] = amount > 0;
        boolArray[3] = price > 0;
        boolArray[4] = _from != _to;
        boolArray[5] = serverTime > 201905240900;
        boolArray[6] = TokenControllerITF(addrTokenController).isTokenApprovedOperational();
        boolArray[7] = RegistryITF_HCAT(addrRegistry).isAssetbookApproved(_to);
        boolArray[8] = RegistryITF_HCAT(addrRegistry).isAssetbookApproved(_from);
    }
    function safeTransferFromBatch(address _from, address _to, uint amount, uint price, uint serverTime) external {
        //require(_from != address(0), "_to should not be 0x0");//replaced by registry check
        //require(_to != address(0), "_to should not be 0x0");//replaced by registry check
        require(amount > 0, "amount should be > 0");
        require(price > 0, "price should be > 0");
        require(_from != _to, "_from should not be equal to _to");

        if (_to.isContract()) {
            bytes4 retval = ERC721TokenReceiverITF(_to).onERC721Received(
                msg.sender, _from, 1, "");
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        }

        require(
            TokenControllerITF(addrTokenController).isTokenApprovedOperational(),
            "token cannot be transferred due to either unlock period or after valid date");
        //Legal Compliance
        require(RegistryITF_HCAT(addrRegistry).isAssetbookApproved(_to), "_to is not in compliance");

        require(RegistryITF_HCAT(addrRegistry).isAssetbookApproved(_from), "_from is not in compliance");

        _safeTransferFromBatch(_from, _to, amount, price, serverTime);
    }


    event SafeTransferFromBatch(
    address indexed _from, address indexed _to, uint amount, uint price, uint indexed serverTime);//this function should be called by an Exchange contract, which should be trustworthy enough to give the correct price and serverTime


    function _safeTransferFromBatch(
        address _from, address _to, uint amount, uint price, uint serverTime) internal {
          //price will be the same as acquiredCost, assuming no transaction fee

        uint[] memory idxX = new uint[](4);
        idxX[0] = accounts[_from].idxStart;//idxStartF = idxX[0]
        idxX[1] = accounts[_from].idxEnd;// idxEndF = idxX[1]
        require(idxX[0] <= idxX[1], "not enough asset to transfer: balance = 0");
        require(idxX[1].sub(idxX[0]).add(1) >= amount, "not enough asset to transfer: balance < amount");

        //fix _to account
        idxX[2] = accounts[_to].idxStart;// idxStartT = idxX[2]
        idxX[3] = accounts[_to].idxEnd;// idxEndT = idxX[3]
        uint idxStartReqT; //uint idxEndReqT;
        if (idxX[2] > idxX[3]) {
            accounts[_to].idxStart = 0;
            accounts[_to].idxEnd = amount.sub(1);
            //idxStartReqT = 0;
            //idxEndReqT = amount.sub(1);
        } else if (idxX[2] == 0 && idxX[3] == 0 && accounts[_to].indexToId[0] == 0) {
            accounts[_to].idxEnd = amount.sub(1);
            //idxStartReqT = 0;
            //idxEndReqT = amount.sub(1);
        } else {
            idxStartReqT = idxX[3].add(1);
            accounts[_to].idxEnd = idxX[3].add(amount);
            //idxEndReqT = idxX[3].add(amount);
        }//accounts[_to].indexToId[0]


        uint allowedAmount = accounts[_from].allowed[msg.sender];
        for(uint i = 0; i < amount; i = i.add(1)) {
            //inside _from account
            uint idxFrom = i.add(idxX[0]);
            uint tokenId_ = accounts[_from].indexToId[idxFrom];
            delete accounts[_from].indexToId[idxFrom];

            address tokenOwner = idToAsset[tokenId_].owner;
            require(tokenOwner == _from, "tokenOwner should be _from");
            //require(tokenOwner != address(0), "owner should not be 0x0");

            if(tokenOwner == msg.sender){

            } else if (allowedAmount > 0){
                allowedAmount = allowedAmount.sub(1);
            } else {
                revert("msg.sender is not tokenOwner, or a token caller does not have enough allowed amount");
            }
            // require(
            // tokenOwner == msg.sender ||
            // idToAsset[tokenId_].approvedAddr == msg.sender ||
            // allowedAmount > amount,
            // "msg.sender should be tokenOwner, an approved, or a token operator has enough allowed amount");

            idToAsset[tokenId_].owner = _to;

            accounts[_to].indexToId[i.add(idxStartReqT)] = tokenId_;
        }

        if(allowedAmount < accounts[_from].allowed[msg.sender]){
            accounts[_from].allowed[msg.sender] = allowedAmount;
        }

        //fix _from account
        if (idxX[1] == idxX[0].add(amount).sub(1)) {
            accounts[_from].idxStart = 1;
            accounts[_from].idxEnd = 0;
        } else {
            accounts[_from].idxStart = idxX[0].add(amount);
        }

        emit SafeTransferFromBatch(_from, _to, amount, price, serverTime);
    }


    //-------------------------------==Approve Functions
    function allowance(address user, address operator)
        external view returns (uint remaining) {
        require(user != address(0), "user should not be 0x0");
        require(operator != address(0), "operator should not be 0x0");
        remaining = accounts[user].allowed[operator];
    }
    function checkTokenApprove(address operator) external pure returns(bool isOperatorNoneZero) {
        isOperatorNoneZero = operator != address(0);
    }
    function tokenApprove(address operator, uint amount) external {
        require(operator != address(0), "operator should not be 0x0");
        accounts[msg.sender].allowed[operator] = amount;
        emit TokenApprove(msg.sender, operator, amount);
    }
    event TokenApprove(address indexed tokenOwner, address indexed operator, uint amount);

    function ckStringLength(string memory _str, uint _minStrLen, uint _maxStrLen) public pure returns(bool) {
        return (bytes(_str).length >= _minStrLen && bytes(_str).length <= _maxStrLen);
        //require(bytes(_str).length >= _minStrLen && bytes(_str).length <= _maxStrLen, "input string. Check mimimun & maximum length");
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