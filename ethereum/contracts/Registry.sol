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
        address assetCtrtAddr; //user assetContract address
        address extoAddr; //user Externally Owned Address(EOA);
        uint status; //用數字分狀態，0=>合法、1=>停權 可能會有多種狀態
    }

    /**@dev 註冊相關event */
    event SetNewUser(string uid, address assetCtrtAddr, address extoAddr, uint status, uint timeCurrent);
    event SetOldUser(string uid, address assetCtrtAddr, address extoAddr, uint status, uint timeCurrent);
    event SetUserStatus(string uid, uint status, uint timeCurrent);
    event SetAssetCtrtAddr(string uid, address assetCtrtAddr, uint timeCurrent);
    event SetExtoAddr(string uid, address assetCtrtAddr, address extoAddr, uint status, uint timeCurrent);

    mapping (string => User) users;//string: 2 letters for country + 身分證字號, SSN, SIN
    uint public userCount;//count the number of users

    //Legal/Regulation Compliance
    mapping (address => string) public assetCtrtAddrToUid;//to find user id from its asset contract address. This is used in Legal Compliance check

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
    modifier ckAssetCtrtAddr(address assetCtrtAddr) {
        require(assetCtrtAddr != address(0), "assetCtrtAddr should not be zero");
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
        require(users[uid].assetCtrtAddr != address(0), "user does not exist: assetCtrtAddr is empty");
        require(users[uid].extoAddr != address(0), "user does not exist: extoAddr is empty");
        _;
    }


    /**@dev add user with his user Id(uid), asset contract address(assetCtrtAddr), external Address(extoAddr) */
    function addUser(
        string calldata uid, address assetCtrtAddr, address extoAddr) external
        onlyAdmin ckUid(uid) ckAssetCtrtAddr(assetCtrtAddr) ckExtoAddr(extoAddr) {

        require(users[uid].assetCtrtAddr == address(0), "user already exists: assetCtrtAddr not empty");
        require(users[uid].extoAddr == address(0), "user already exists: extoAddr not empty");
        userCount = userCount.add(1);

        users[uid].assetCtrtAddr = assetCtrtAddr;
        users[uid].extoAddr = extoAddr;
        users[uid].status = 0;

        assetCtrtAddrToUid[assetCtrtAddr] = uid;
        emit SetNewUser(uid, assetCtrtAddr, extoAddr, 0, now);
    }

    /**@dev set existing user’s information: this uid, assetCtrtAddr, extoAddr, status */
    function setUser(
        string calldata uid, address assetCtrtAddr, address extoAddr,
        uint status)
        external onlyAdmin ckUid(uid) ckAssetCtrtAddr(assetCtrtAddr) ckExtoAddr(extoAddr) uidExists(uid) {

        assetCtrtAddrToUid[users[uid].assetCtrtAddr] = "";

        users[uid].assetCtrtAddr = assetCtrtAddr;
        users[uid].extoAddr = extoAddr;
        users[uid].status = status;

        assetCtrtAddrToUid[assetCtrtAddr] = uid;
        emit SetOldUser(uid, assetCtrtAddr, extoAddr, status, now);
    }

    /**@dev set user’s assetCtrtAddr */
    function setAssetCtrtAddr(string calldata uid, address assetCtrtAddr) external
    onlyAdmin ckUid(uid) ckAssetCtrtAddr(assetCtrtAddr) uidExists(uid) {

        assetCtrtAddrToUid[users[uid].assetCtrtAddr] = "";

        assetCtrtAddrToUid[assetCtrtAddr] = uid;
        users[uid].assetCtrtAddr = assetCtrtAddr;
        emit SetAssetCtrtAddr(uid, assetCtrtAddr, now);
    }

    /**@dev set user’s EOA Ethereum externally owned address*/
    function setExtoAddr(string calldata uid, address extoAddr) external
    onlyAdmin ckUid(uid) ckExtoAddr(extoAddr) uidExists(uid) {
        users[uid].extoAddr = extoAddr;
        emit SetExtoAddr(uid, users[uid].assetCtrtAddr, extoAddr, users[uid].status, now);
    }

    /**@dev set user’s status */
    function setUserStatus(string calldata uid, uint status) external
    onlyAdmin ckUid(uid) uidExists(uid) {
        users[uid].status = status;
        emit SetUserStatus(uid, status, now);
    }

    /**@dev get user’s information via user’s Id or uid*/
    function getUser(string memory uid) public view ckUid(uid) returns (
        string memory uid_, address assetCtrtAddr, address extoAddr, uint userStatus) {
          uid_ = uid;
        return(uid_, users[uid].assetCtrtAddr, users[uid].extoAddr, users[uid].status);
    }

    /**@dev get uid from user’s asset contract address */
    function getUidFromAssetCtrtAddr(address assetCtrtAddr) public view 
        ckAssetCtrtAddr(assetCtrtAddr) returns (string memory uid) {
        uid = assetCtrtAddrToUid[assetCtrtAddr];
    }



    /**@dev check if the user with uid is approved */
    function isUserApproved(string memory uid) public view 
      ckUid(uid) uidExists(uid) returns (bool) {
        return (users[uid].status == 0);
    }

    /**@dev check if asset contract address is approved, by finding its uid then checking the uid’s info */
    function isAddrApproved(address assetCtrtAddr) external view returns (bool) {
        require(assetCtrtAddr.isContract(), "assetCtrtAddr should contain contract code");
        require(assetCtrtAddr != address(0), "assetCtrtAddr should not be zero");
        string memory uid = assetCtrtAddrToUid[assetCtrtAddr];
        return isUserApproved(uid);
    }


    function() external payable { revert("should not send any ether directly"); }
}
//--------------------==
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) }
        return size > 0;
    }
}