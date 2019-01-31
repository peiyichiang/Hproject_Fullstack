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
    mapping (address => string) public assetCtAddrToUid;
    uint public userCount;//count and index

    //Legal/Regulation Compliance
    uint public amountLegalMax;
    uint public amountLegalMin;

    modifier ckUid(string memory uid) {
        uint uidLength = bytes(uid).length;
        require(uidLength > 0, "uid cannot be zero length");
        require(uidLengthh <= 32, "uid cannot be longer than 32");
        _;
    }
    modifier ckAssetCtAddr(address assetCtAddr) {
        require(assetCtAddr != address(0), "assetCtAddr should not be zero");
        _;
    }
    modifier ckExtoAddr(address extoAddr) {
        require(extoAddr != address(0), "extoAddr should not be zero");
        _;
    }
    modifier ckTime(uint time) {
        require(time > 201902010000, "time should be greater than 201902010000");
        _;
    }

    /**@dev 新增user */
    function setNewUser(
        string calldata uid, address assetCtAddr, address extoAddr, uint time) 
        external onlyOwner ckUid(uid) ckAssetCtAddr(assetCtAddr) ckExtoAddr(extoAddr) ckTime(time) {
        
        require(users[uid].assetCtAddr == address(0), "user already exists");
        userCount = userCount.add(1);

        users[uid].assetCtAddr = assetCtAddr;
        users[uid].extoAddr = extoAddr;
        users[uid].status = 0;

        assetCtAddrToUid[assetCtAddr] = uid;
        emit SetNewUser(uid, assetCtAddr, extoAddr, 0, time);
    }

    function setOldUser(
        string calldata uid, address assetCtAddr, address extoAddr, uint status, uint time)
        external onlyOwner ckUid(uid) ckAssetCtAddr(assetCtAddr) ckExtoAddr(extoAddr) ckTime(time) {

        require(users[uid].assetCtAddr != address(0), "user does not exist");
        assetCtAddrToUid[users[uid].assetCtAddr] = "";

        users[uid].assetCtAddr = assetCtAddr;
        users[uid].extoAddr = extoAddr;
        users[uid].status = status;

        assetCtAddrToUid[assetCtAddr] = uid;
        emit SetOldUser(uid, assetCtAddr, extoAddr, status, time);
    }

    /**@dev 設定user的 assetCtAddr */
    function setAssetCtAddr(string calldata uid, address assetCtAddr, uint time) 
        external onlyOwner ckUid(uid) ckAssetCtAddr(assetCtAddr) ckTime(time) {
        
        require(users[uid].assetCtAddr != address(0), "user does not exist");
        assetCtAddrToUid[users[uid].assetCtAddr] = "";

        assetCtAddrToUid[assetCtAddr] = uid;
        users[uid].assetCtAddr = assetCtAddr;
        emit SetAssetCtAddr(uid, assetCtAddr, time);
    }

    /**@dev 設定user的以太帳號 */
    function setExtoAddr(string calldata uid, address extoAddr, uint time) 
        external onlyOwner ckUid(uid) ckExtoAddr(extoAddr) ckTime(time) {
        
        require(users[uid].extoAddr != address(0), "user does not exist");
        users[uid].extoAddr = extoAddr;
        emit SetExtoAddr(uid, users[uid].assetCtAddr, extoAddr, users[uid].status, time);
    }

    /**@dev 設定user的狀態 */
    function setUserStatus(string calldata uid, uint status, uint time)
        external onlyOwner ckUid(uid) ckTime(time) {

        require(users[uid].assetCtAddr != address(0), "user does not exist");
        users[uid].status = status;
        emit SetUserStatus(uid, status, time);
    }

    /**@dev 取得user數量 */
    function getUserCount() public view returns(uint){
        return userCount;
    }

    /**@dev get user information */
    function getUser(string memory uid) public view returns (
        string memory, address, address, uint) {
        return(uid, users[uid].assetCtAddr, users[uid].extoAddr, users[uid].status);
    }

    function getUidFromAssetCtAddr(address assetCtAddr) public view returns (string memory) {
        return assetCtAddrToUid[assetCtAddr];
    }

    //--------------------==Legal Compliance
    /* # A whitelist could be implemented to ensure that both sender and receiver have been cleared to transact. # Certain addresses could be blacklisted⁹.
    # Transfers of over / under certain amounts could be prohibited.
      //Partial token transfers could be restricted.*/
    /**@dev 設定user的 LegaCompliance */
    event SetLegalAmount(uint amountLegalMax, uint amountLegalMin);
    function setLegaAmount(uint _amountLegalMax, uint _amountLegalMin) external onlyOwner {
        require(amountLegalMax > amountLegalMin, "amountLegalMax should be greater than amountLegalMin");
        amountLegalMax = _amountLegalMax;
        amountLegalMin = _amountLegalMin;
        emit SetLegalAmount(amountLegalMax, amountLegalMin);
    }

    function isUserApproved(string calldata uid) external view returns (bool) {
        if(users[uid].status == 0) {
            return true;
        } else {return false;}
    }
    function isAddrApproved(address addr) external view returns (bool) {
        string memory uid = assetCtAddrToUid[addr];
        if(users[uid].status == 0) {
            return true;
        } else {return false;}
    }

    //To be called by token transfer functions
    function isUnderCompliance(address to, address from, uint amount) external view returns (bool) {
        //require(msg.sender == tokenCtrt, "msg.sender is not tokenCtrt");
        string memory uidTo = assetCtAddrToUid[to];//toAssetCtrt
        string memory uidFrom = assetCtAddrToUid[from];//fromAssetCtrt

        if(users[uidTo].status == 0 && users[uidFrom].status == 0 && amountLegalMin <= amount && amount <= amountLegalMax) {
            return true;
        } else {
            return false;
        }
    }
    
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
