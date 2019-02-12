pragma solidity ^0.5.3;
//pragma experimental ABIEncoderV2;

import "./Ownable.sol";
import "./SafeMath.sol";

contract RegistryContract is Ownable {
    using SafeMath for uint256;

    /**@dev 資料結構 */
    struct User{
        address assetCtAddr; //user assetContract address
        address extoAddr; //user Externally Owned Address(EOA);
        uint status; //用數字分狀態，0=>合法、1=>停權 可能會有多種狀態
    }

    /**@dev 註冊相關event */
    event SetNewUser(string uid, address assetCtAddr, address extoAddr, uint status, uint time);
    event SetOldUser(string uid, address assetCtAddr, address extoAddr, uint status, uint time);
    event SetUserStatus(string uid, uint status, uint time);
    event SetAssetCtAddr(string uid, address assetCtAddr, uint time);
    event SetExtoAddr(string uid, address assetCtAddr, address extoAddr, uint status, uint time);

    mapping (string => User) users;//string: 2 letters for country + 身分證字號, SSN, SIN
    uint public userCount;//count the number of users

    //Legal/Regulation Compliance
    mapping (address => string) public assetCtAddrToUid;//to find user id from its asset contract address. This is used in Legal Compliance check

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
    modifier ckTime(uint time) {
        require(time > 201902010000, "time should be greater than 201902010000");
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
    function setNewUser(
        string calldata uid, address assetCtAddr, address extoAddr, uint time) external 
        onlyOwner ckUid(uid) ckAssetCtAddr(assetCtAddr) ckExtoAddr(extoAddr) ckTime(time) {
        
        require(users[uid].assetCtAddr == address(0), "user already exists: assetCtAddr not empty");
        require(users[uid].extoAddr == address(0), "user already exists: extoAddr not empty");
        userCount = userCount.add(1);

        users[uid].assetCtAddr = assetCtAddr;
        users[uid].extoAddr = extoAddr;
        users[uid].status = 0;

        assetCtAddrToUid[assetCtAddr] = uid;
        emit SetNewUser(uid, assetCtAddr, extoAddr, 0, time);
    }

    /**@dev set user的 information */
    function setOldUser(
        string calldata uid, address assetCtAddr, address extoAddr, uint status, uint time)
        external onlyOwner ckUid(uid) ckAssetCtAddr(assetCtAddr) ckExtoAddr(extoAddr) ckTime(time) 
        uidExists(uid) {

        assetCtAddrToUid[users[uid].assetCtAddr] = "";

        users[uid].assetCtAddr = assetCtAddr;
        users[uid].extoAddr = extoAddr;
        users[uid].status = status;

        assetCtAddrToUid[assetCtAddr] = uid;
        emit SetOldUser(uid, assetCtAddr, extoAddr, status, time);
    }

    /**@dev 設定user的 assetCtAddr */
    function setAssetCtAddr(string calldata uid, address assetCtAddr, uint time) external 
      onlyOwner ckUid(uid) ckAssetCtAddr(assetCtAddr) ckTime(time) uidExists(uid) {
        
        assetCtAddrToUid[users[uid].assetCtAddr] = "";

        assetCtAddrToUid[assetCtAddr] = uid;
        users[uid].assetCtAddr = assetCtAddr;
        emit SetAssetCtAddr(uid, assetCtAddr, time);
    }

    /**@dev 設定user的以太帳號 */
    function setExtoAddr(string calldata uid, address extoAddr, uint time) external 
      onlyOwner ckUid(uid) ckExtoAddr(extoAddr) ckTime(time) uidExists(uid) {
        users[uid].extoAddr = extoAddr;
        emit SetExtoAddr(uid, users[uid].assetCtAddr, extoAddr, users[uid].status, time);
    }

    /**@dev 設定user的狀態 */
    function setUserStatus(string calldata uid, uint status, uint time) external 
      onlyOwner ckUid(uid) ckTime(time) uidExists(uid) {
        users[uid].status = status;
        emit SetUserStatus(uid, status, time);
    }

    /**@dev 取得user數量 */
    function getUserCount() public view returns(uint){
        return userCount;
    }

    /**@dev get user information */
    function getUser(string memory uid) public view ckUid(uid) returns (
        string memory, address, address, uint) {
        return(uid, users[uid].assetCtAddr, users[uid].extoAddr, users[uid].status);
    }

    /**@dev get uid from Asset contract address */
    function getUidFromAssetCtAddr(address assetCtAddr) public view 
        ckAssetCtAddr(assetCtAddr) returns (string memory) {
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
    function isAddrApproved(address assetCtAddr) public view 
      ckAssetCtAddr(assetCtAddr) returns (bool) {
        string memory uid = assetCtAddrToUid[assetCtAddr];
        return isUserApproved(uid);
    }

    //amount checking should be done inside the token transfer function!
    /**@dev check token transfer in compliance by using isApproved() */
    // function isUnderCompliance(address to, address from, uint amount) external view 
    //   ckAddr(to) ckAddr(from) returns (bool) {
    //     return (isAddrApproved(to) && isAddrApproved(from) && amountLegalMin <= amount && amount <= amountLegalMax);
    // }
    
/**@dev 尚未支援回傳string[] */
/*
    //get 所有user
    function getAllUserInfo() public onlyOwner view  returns (string[], address[], address[], uint[]){
        string[] memory uids = new string[](userIndex.length);
        address[] memory assetCtAddrs = new address[](userIndex.length);
        address[] memory extoAddrs = new address[](userIndex.length);
        uint[]    memory status = new uint[](userIndex.length);

        for (uint i = 0; i < userIndex.length; i++) {
            User storage user = users[userIndex[i]];
            uids[i] = user.uid;
            assetCtAddrs[i] = user.assetCtAddr;
            extoAddrs[i] = user.extoAddr;
            status[i] = user.status;
        }

        return (uids, assetCtAddrs, extoAddrs, status);
    }
*/

}
