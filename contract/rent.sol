pragma solidity ^0.5.2;

contract Ownable {
    address public owner;
    address public ownerNew;
    address public chairman;
    address public director;
    address public manager;
    address public admin;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() public {
        owner = msg.sender;
        chairman = msg.sender;
        director = msg.sender;
        manager = msg.sender;
        admin = msg.sender;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can call this function");
        _;
    }
    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin can call this function");
        _;
    }
    function addNewOwner(address _newOwner) external onlyOwner {
        ownerNew = _newOwner;
    }
    function transferOwnership() external {
        require(ownerNew == msg.sender, "only new owner can call this function");
        emit OwnershipTransferred(owner, ownerNew);
        owner = ownerNew;
    }
    function setNewChairman(address _newChairman) external onlyOwner {
        chairman = _newChairman;
    }
    function setNewDirector(address _newDirector) external {
        require(msg.sender == chairman, "only chairman can call this function");
        director = _newDirector;
    }
    function setNewManager(address _newMgr) external {
        require(msg.sender == director, "only director can call this function");
        manager = _newMgr;
    }
    function setNewAdmin(address _newAdmin) external {
        require(msg.sender == manager, "only manager can call this function");
        admin = _newAdmin;
    }
}

contract Rent is Ownable {
    using SafeMath for uint256;
    //using AddressUtils for address;
    //re-entry attack??
    uint public nextRentTxnIndex = 1;//rent issuing index

    address public platformAdmin;
    mapping(uint256 => RentTxn) public idToRentTxn;
    mapping(address => address) public tokenToFMXA;
    
    // cash flow: FMX -> platform -> investors
    struct RentTxn {
        uint rentIndex;
        address tokenCtrt;
        uint amountToSend;//given by FMXA, sending rent from platform to investors
        uint timeToSend;//the time to send rent
        bool isApproved;//by PA
        uint amountSent;//confirmed after platform's bank confirming rent has been sent
        uint timeOfSentTxn;
        uint8 errorCode;//0 to 255
    }
    /*
    -->每季底FMX結帳後FMXA通知平台該期應該發放的租金是多少-->PBD-->PA審核, 確認.
    -->平台發出訊息給user, 即將於x月底發放租金至指定帳戶, 請user確認.
    -->發放租金資訊鏈接bank-->回報訊息.
    -->異常處理.
    -->二級市場交易時, 租金分配規則制定.
    -->外部還要寫一隻BE程式專門與銀行對接收/ 付款資訊.
    */

    function makeRentTxn(address _tokenCtrt, uint _amountToSend, uint _timeToSend, uint _timeOfSentTxn) external {
        require(tokenToFMXA[_tokenCtrt] == msg.sender, "sender is not the admin for this token");
        RentTxn newRentTxn = RentTxn({ 
            rentIndex: nextRentTxnIndex,
            tokenCtrt: _tokenCtrt,
            amountToSend: _amountToSend,
            timeToSend: _timeToSend,
            isApproved: false,
            amountSent: 0,
            timeOfSentTxn: _timeOfSentTxn,
            errorCode: 0
        });
        idToRentTxn[nextRentTxnIndex] = newRentTxn;
        nextRentTxnIndex = nextRentTxnIndex.add(1);
    }

    function approveRentSchedule(uint rentTxnIndex, bool boolValue) external {
        require(platformAdmin == msg.sender, "only platform admin can execute this function");
        idToRentTxn[rentTxnIndex].isApproved = boolValue;
    
    }



    function generateToken(uint pairId, string _uri) external onlyAdmin {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        htoken.mintSerialNFT(_uri);
    }
    function setNewSafeVault(uint pairId, address _newSafeVault) 
    external onlyAdmin {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        htoken.setNewSafeVault(_newSafeVault);
    }
/*  //ERC721
    event MintSerialNFT(uint tokenId, string nftName, string nftSymbol, string pricingCurrency, string uri, uint initialAssetPricing);
    function mintSerialNFT(string _uri) external;
    event BurnNFT(address _owner, uint _tokenId, address msgsender);
    function burnNFT(address _owner, uint256 _tokenId) external;
    event SetNewSafeVault(address _SafeVault, address _SafeVaultNew);
    function setNewSafeVault(address _newSafeVault) external;
    function setNewSafeVault() external;
    function disablePreDelivery() external;
    function setLockUpPeriod(
        uint _LockUpPeriod_inMins, uint _LockUpPeriod_inWeeks) 
        external;
    function setTokenMintTime(uint _tokenMintTime) external;
    function setTokenStatus(bool _tokenStatus) external;
 */

    function balanceOf(uint pairId, address _owner) public returns (uint256) {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        return htoken.balanceOf(_owner);
    }

    function ownerOf(uint pairId, uint256 _tokenId) public returns (address) {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        return htoken.ownerOf(_tokenId);
    }

    function safeTransferFrom(
        uint pairId, address _from, address _to, uint256 _tokenId, bytes _data) public onlyAdmin{
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        htoken.safeTransferFrom(_from, _to, _tokenId, _data);
    }
//safeTransferFrom(address _from, address _to, uint256 _tokenId) external;
    function safeTransferFrom(
        uint pairId, address _from, address _to, uint256 _tokenId) public onlyAdmin {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        htoken.safeTransferFrom(_from, _to, _tokenId);
    }
//transferFrom(address _from, address _to, uint256 _tokenId) external;
    function transferFrom(
        uint pairId, address _from, address _to, uint256 _tokenId) public onlyAdmin {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        htoken.transferFrom(_from, _to, _tokenId);
    }

//approve(address _approved, uint256 _tokenId) external;
    function approve(
        uint pairId, address _approved, uint256 _tokenId) public onlyAdmin {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        htoken.approve(_approved, _tokenId);
    }

//setApprovalForAll(address _operator, bool _approved) external;
    function setApprovalForAll(
        uint pairId, address _operator, bool _approved) public onlyAdmin {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        htoken.setApprovalForAll(_operator, _approved);
    }

//getApproved(uint256 _tokenId) external view returns (address);
    function getApproved(
        uint pairId, uint256 _tokenId) 
        external returns (address) {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        return htoken.getApproved(_tokenId);
    }

//isApprovedForAll(address _owner, address _operator) external view returns (bool);
    function isApprovedForAll(
        uint pairId, address _owner, address _operator) 
        external returns (bool) {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        return htoken.isApprovedForAll(_owner, _operator);
    }


    function transferOwnership(uint pairId) public {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        htoken.transferOwnership();
    }


// get_ownerToIds(address _owner) external view returns (uint[]) {
    function get_ownerToIds(uint pairId, address _owner) public returns(uint[]) {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        return htoken.get_ownerToIds(_owner);
    }

// getNFT(uint _id) external view returns (string, string, string, string, uint) {
    function getNFT(uint pairId, uint _tokenId) public returns (string, string, string, string, uint){
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        return htoken.getNFT(_tokenId);
    }
    
    function getCtrtDetails(uint pairId) public returns (
        bool, uint, uint, uint,
        uint, uint, string, 
        uint, string, bool, address,
        uint, uint) {
        htoken = NFTokenSPLC(idToCtrtPair[pairId].tokenCtrt);
        return htoken.getCtrtDetails();
    }

}

//==================
/*https://github.com/0xcert/ethereum-erc721/blob/master/contracts/tokens/NFTokenMetadata.sol
contract SPLC is NFToken, ERC721Metadata {
}*/

library SafeMath {
    function mul(uint256 _a, uint256 _b) internal pure returns (uint256) {
        if (_a == 0) {
            return 0;
        }
        uint256 c = _a * _b;
        require(c / _a == _b, "safeMath mul failed");
        return c;
    }
    function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
        uint256 c = _a / _b;
        // require(b > 0); // Solidity automatically throws when dividing by 0
        // require(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }
    function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
        require(_b <= _a, "safeMath sub failed");
        return _a - _b;
    }
    function add(uint256 _a, uint256 _b) internal pure returns (uint256) {
        uint256 c = _a + _b;
        require(c >= _a, "safeMath add failed");
        return c;
    }
}