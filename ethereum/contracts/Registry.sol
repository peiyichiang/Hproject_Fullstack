pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
//deploy parameters: none
import "./Ownable.sol";
import "./SafeMath.sol";

contract Registry is Ownable {
    using SafeMath for uint256;
    using AddressUtils for address;

    /**@dev 資料結構 */
    struct User{
        address assetCtAddr; //user assetContract address
        address extoAddr; //user Externally Owned Address(EOA);
        uint status; //用數字分狀態，0=>合法、1=>停權 可能會有多種狀態
    }

    /**@dev 註冊相關event */
    event SetNewUser(string uid, address assetCtAddr, address extoAddr, uint status, uint timeCurrent);
    event SetOldUser(string uid, address assetCtAddr, address extoAddr, uint status, uint timeCurrent);
    event SetUserStatus(string uid, uint status, uint timeCurrent);
    event SetAssetCtAddr(string uid, address assetCtAddr, uint timeCurrent);
    event SetExtoAddr(string uid, address assetCtAddr, address extoAddr, uint status, uint timeCurrent);

    mapping (string => User) users;//string: 2 letters for country + 身分證字號, SSN, SIN
    uint public userCount;//count the number of users

    //Legal/Regulation Compliance
    mapping (address => string) public assetCtAddrToUid;//to find user id from its asset contract address. This is used in Legal Compliance check

    constructor(address[] memory management) public {
        require(management.length > 4, "management.length should be > 4");
        owner = management[4];
        chairman = management[3];
        director = management[2];
        manager = management[1];
        admin = management[0];
    }

    /**@dev check uid value */
    modifier ckUid(string memory uid) {
        uint uidLength = bytes(uid).length;
        require(uidLength > 0, "uid cannot be zero length");
        require(uidLength <= 32, "uid cannot be longer than 32");//compatible to bytes32 format, too
        _;
    }
    /**@dev check asset contract address */
    modifier ckAssetCtAddr(address assetCtAddr) {
        require(assetCtAddr != address(0), "assetCtAddr should not be zero");
        _;
    }
    /**@dev check EOA address */
    modifier ckExtoAddr(address extoAddr) {
        require(extoAddr != address(0), "extoAddr should not be zero");
        _;
    }
    /**@dev check time */
    modifier ckTime(uint timeCurrent) {
        require(timeCurrent > 201902010000, "timeCurrent should be greater than 201902010000");
        _;
    }
    /**@dev check address value not zero */
    modifier ckAddr(address addr) {
        require(addr != address(0), "addr should not be zero");
        _;
    }

    /**@dev check if uid exists by checking its user's information */
    modifier uidExists(string memory uid) {
        require(users[uid].assetCtAddr != address(0), "user does not exist: assetCtAddr is empty");
        require(users[uid].extoAddr != address(0), "user does not exist: extoAddr is empty");
        _;
    }


    /**@dev 新增user */
    function addUser(
        string calldata uid, address assetCtAddr, address extoAddr, uint timeCurrent) external
        onlyAdmin ckUid(uid) ckAssetCtAddr(assetCtAddr) ckExtoAddr(extoAddr) ckTime(timeCurrent) {

        require(users[uid].assetCtAddr == address(0), "user already exists: assetCtAddr not empty");
        require(users[uid].extoAddr == address(0), "user already exists: extoAddr not empty");
        userCount = userCount.add(1);

        users[uid].assetCtAddr = assetCtAddr;
        users[uid].extoAddr = extoAddr;
        users[uid].status = 0;

        assetCtAddrToUid[assetCtAddr] = uid;
        emit SetNewUser(uid, assetCtAddr, extoAddr, 0, timeCurrent);
    }

    /**@dev set existing user 的 information */
    function setUser(
        string calldata uid, address assetCtAddr, address extoAddr,
        uint status, uint timeCurrent)
        external onlyAdmin ckUid(uid) ckAssetCtAddr(assetCtAddr) ckExtoAddr(extoAddr) ckTime(timeCurrent) uidExists(uid) {

        assetCtAddrToUid[users[uid].assetCtAddr] = "";

        users[uid].assetCtAddr = assetCtAddr;
        users[uid].extoAddr = extoAddr;
        users[uid].status = status;

        assetCtAddrToUid[assetCtAddr] = uid;
        emit SetOldUser(uid, assetCtAddr, extoAddr, status, timeCurrent);
    }

    /**@dev 設定user的 assetCtAddr */
    function setAssetCtAddr(string calldata uid, address assetCtAddr, uint timeCurrent) external
    onlyAdmin ckUid(uid) ckAssetCtAddr(assetCtAddr) ckTime(timeCurrent) uidExists(uid) {

        assetCtAddrToUid[users[uid].assetCtAddr] = "";

        assetCtAddrToUid[assetCtAddr] = uid;
        users[uid].assetCtAddr = assetCtAddr;
        emit SetAssetCtAddr(uid, assetCtAddr, timeCurrent);
    }

    /**@dev 設定user的以太帳號 */
    function setExtoAddr(string calldata uid, address extoAddr, uint timeCurrent) external
    onlyAdmin ckUid(uid) ckExtoAddr(extoAddr) ckTime(timeCurrent) uidExists(uid) {
        users[uid].extoAddr = extoAddr;
        emit SetExtoAddr(uid, users[uid].assetCtAddr, extoAddr, users[uid].status, timeCurrent);
    }

    /**@dev 設定user的狀態 */
    function setUserStatus(string calldata uid, uint status, uint timeCurrent) external
    onlyAdmin ckUid(uid) ckTime(timeCurrent) uidExists(uid) {
        users[uid].status = status;
        emit SetUserStatus(uid, status, timeCurrent);
    }

    /**@dev 取得user數量 */
    function getUserCount() public view returns(uint){
        return userCount;
    }

    /**@dev get user information */
    function getUser(string memory u_id) public view ckUid(u_id) returns (
        string memory uid, address assetCtAddr, address extoAddr, uint userStatus) {
        return(u_id, users[u_id].assetCtAddr, users[u_id].extoAddr, users[u_id].status);
    }

    /**@dev get uid from Asset contract address */
    function getUidFromAssetCtAddr(address assetCtAddr) public view 
        ckAssetCtAddr(assetCtAddr) returns (string memory u_id) {
        return assetCtAddrToUid[assetCtAddr];
    }

    //--------------------==Legal Compliance
    /* # A Whitelist: check both sender and receiver have been cleared to make transactions
       # A Blacklist: if the status is not approved
       # Check if transfer amount is over or under certain amounts
       # Partial token transfers could be restricted... Not applicable to ERC721
    */

    // amountMax/Min should be set inside the token contracts
    // /**@dev 設定user的 LegaCompliance */
    // event SetLegalAmount(uint amountLegalMax, uint amountLegalMin);
    // function setLegaAmount(uint _amountLegalMax, uint _amountLegalMin) external onlyOwner {
    //     require(amountLegalMax > amountLegalMin, "amountLegalMax should be greater than amountLegalMin");
    //     amountLegalMax = _amountLegalMax;
    //     amountLegalMin = _amountLegalMin;
    //     emit SetLegalAmount(amountLegalMax, amountLegalMin);
    // }

    /**@dev check if uid is approved */
    function isUserApproved(string memory uid) public view 
      ckUid(uid) uidExists(uid) returns (bool) {
        return (users[uid].status == 0);
    }

    /**@dev check if asset contract address is approved, by finding its uid then checking it */
    function isAddrApproved(address assetCtAddr) external view returns (bool) {
        require(assetCtAddr.isContract(), "assetCtAddr should contain contract code");
        require(assetCtAddr != address(0), "assetCtAddr should not be zero");
        string memory uid = assetCtAddrToUid[assetCtAddr];
        return isUserApproved(uid);
    }

}
//--------------------==
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) }
        return size > 0;
    }
}