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

    mapping (bytes32 => User) public users;//string: 2 letters for country + 身分證字號, SSN, SIN
    mapping (address => bytes32) public assetCtAddrToUidB32;
    uint public userCount;//count and index

    //Legal/Regulation Compliance
    uint public amountLegalMax;
    uint public amountLegalMin;
    bytes32 public emptyUID = 0x0000000000000000000000000000000000000000000000000000000000000000;

    modifier ckUid(string memory _uid) {
        require(bytes(_uid).length > 0, "_uid cannot be zero length");
        _;
    }
    modifier ckAssetCtAddr(address _assetCtAddr) {
        require(_assetCtAddr != address(0), "_assetCtAddr should not be zero");
        _;
    }
    modifier ckExtoAddr(address _extoAddr) {
        require(_extoAddr != address(0), "_extoAddr should not be zero");
        _;
    }
    modifier ckTime(uint _time) {
        require(_time > 201902010000, "_time should be greater than 201902010000");
        _;
    }

    /**@dev 新增user */
    function setNewUser(
        string calldata _uid, address _assetCtAddr, address _extoAddr, uint _time) 
        external onlyOwner ckUid(_uid) ckAssetCtAddr(_assetCtAddr) ckExtoAddr(_extoAddr) ckTime(_time) {

        bytes32 uidBytes32 = stringToBytes32(_uid);
        require(users[uidBytes32].assetCtAddr == address(0), "user already exists");
        userCount = userCount.add(1);

        users[uidBytes32].assetCtAddr = _assetCtAddr;
        users[uidBytes32].extoAddr = _extoAddr;
        users[uidBytes32].status = 0;

        assetCtAddrToUidB32[_assetCtAddr] = uidBytes32;
        emit SetNewUser(_uid, _assetCtAddr, _extoAddr, 0, _time);
    }

    function setOldUser(
        string calldata _uid, address _assetCtAddr, address _extoAddr, uint _status, uint _time)
        external onlyOwner ckUid(_uid) ckAssetCtAddr(_assetCtAddr) ckExtoAddr(_extoAddr) ckTime(_time) {

        bytes32 uidBytes32 = stringToBytes32(_uid);
        require(users[uidBytes32].assetCtAddr != address(0), "user does not exist");

        assetCtAddrToUidB32[users[uidBytes32].assetCtAddr] = emptyUID;

        users[uidBytes32].assetCtAddr = _assetCtAddr;
        users[uidBytes32].extoAddr = _extoAddr;
        users[uidBytes32].status = _status;

        assetCtAddrToUidB32[_assetCtAddr] = uidBytes32;
        emit SetOldUser(_uid, _assetCtAddr, _extoAddr, _status, _time);
    }

    /**@dev 設定user的 assetCtAddr */
    function setAssetCtAddr(string calldata _uid, address _assetCtAddr, uint _time) 
        external onlyOwner ckUid(_uid) ckAssetCtAddr(_assetCtAddr) ckTime(_time) {

        bytes32 uidBytes32 = stringToBytes32(_uid);
        require(users[uidBytes32].assetCtAddr != address(0), "user does not exist");

        assetCtAddrToUidB32[users[uidBytes32].assetCtAddr] = emptyUID;

        assetCtAddrToUidB32[_assetCtAddr] = uidBytes32;
        users[uidBytes32].assetCtAddr = _assetCtAddr;
        emit SetAssetCtAddr(_uid, _assetCtAddr, _time);
    }

    /**@dev 設定user的以太帳號 */
    function setExtoAddr(string calldata _uid, address _extoAddr, uint _time) 
        external onlyOwner ckUid(_uid) ckExtoAddr(_extoAddr) ckTime(_time) {

        bytes32 uidBytes32 = stringToBytes32(_uid);
        require(users[uidBytes32].extoAddr != address(0), "user does not exist");

        users[uidBytes32].extoAddr = _extoAddr;
        emit SetExtoAddr(_uid, users[uidBytes32].assetCtAddr, _extoAddr, users[uidBytes32].status, _time);
    }

    /**@dev 設定user的狀態 */
    function setUserStatus(string calldata _uid, uint _status, uint _time)
        external onlyOwner ckUid(_uid) ckTime(_time) {

        bytes32 uidBytes32 = stringToBytes32(_uid);
        require(users[uidBytes32].assetCtAddr != address(0), "user does not exist");

        users[uidBytes32].status = _status;
        emit SetUserStatus(_uid, _status, _time);
    }

    /**@dev 取得user數量 */
    function getUserCount() public view returns(uint){
        return userCount;
    }

    /**@dev get user information */
    function getUser(string memory _uid) public view returns (
        string memory, address, address, uint) {

        bytes32 uidBytes32 = stringToBytes32(_uid);
        return(_uid, users[uidBytes32].assetCtAddr, users[uidBytes32].extoAddr, users[uidBytes32].status);
    }

    function getUidFromAssetCtAddr(address _assetCtAddr) public view returns (bytes32) {
        return assetCtAddrToUidB32[_assetCtAddr];
    }

    //--------------------==Legal Compliance
    /* # A whitelist could be implemented to ensure that both sender and receiver have been cleared to transact. # Certain addresses could be blacklisted⁹.
    # Transfers of over / under certain amounts could be prohibited.
      //Partial token transfers could be restricted.*/
    /**@dev 設定user的 LegaCompliance */
    event SetLegalAmount(uint _amountLegalMax, uint _amountLegalMin);
    function setLegaAmount(uint _amountLegalMax, uint _amountLegalMin) external onlyOwner {
        require(_amountLegalMax > _amountLegalMin, "_amountLegalMax should be greater than _amountLegalMin");
        amountLegalMax = _amountLegalMax;
        amountLegalMin = _amountLegalMin;
        emit SetLegalAmount(_amountLegalMax, _amountLegalMin);
    }

    function isUserApproved(string calldata _uid) external view returns (bool) {
        bytes32 uidBytes32 = stringToBytes32(_uid);
        if(users[uidBytes32].status == 0) {
            return true;
        } else {return false;}
    }
    function isAddrApproved(address _addr) external view returns (bool) {
        bytes32 uidBytes32 = assetCtAddrToUidB32[_addr];//EOA or AssetCtrt
        if(users[uidBytes32].status == 0) {
            return true;
        } else {return false;}
    }

    //To be called by token transfer functions
    function isUnderCompliance(address _to, address _from, uint _amount) external view returns (bool) {
        //require(msg.sender == tokenCtrt, "msg.sender is not tokenCtrt");
        bytes32 uidTo = assetCtAddrToUidB32[_to];//toAssetCtrt
        bytes32 uidFrom = assetCtAddrToUidB32[_from];//fromAssetCtrt

        if(users[uidTo].status == 0 && users[uidFrom].status == 0 && amountLegalMin <= _amount && _amount <= amountLegalMax) {
            return true;
        } else {
            return false;
        }
    }
    
    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }
    function bytes32ToString(bytes32 x) public pure returns (string memory) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (uint j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
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
