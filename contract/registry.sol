pragma solidity ^0.4.25;
//pragma experimental ABIEncoderV2;

contract RegistryContract{

    address owner;
    uint totalUser;

    struct User{
        string u_id;
        address assetAccount;
        address etherAddr;
        uint accountStatus; //用數字分狀態，0=>合法、1=>停權
    }

    event setNewUser(string u_id, address assetAccount, address etherAddr, uint accountStatus, uint now);
    event changeAccountStatus(string u_id, uint accountStatus, uint now);
    event changeEthAddr(string u_id, address assetAccount, address etherAddr, uint accountStatus, uint now);

    mapping (string=>User) users;
    string[] userIndex;

    constructor() public{
        owner = msg.sender;
    }

    modifier isOwner(){
        require(msg.sender == owner);
        _;
    }

    function getOwner() public view returns (address){
        return owner;
    }

    //新增user
    function registerUser(string _u_id, address _assetAccount, address _etherAddr) public isOwner{
        users[_u_id].u_id = _u_id;
        users[_u_id].assetAccount = _assetAccount;
        users[_u_id].etherAddr = _etherAddr;
        users[_u_id].accountStatus = 0;
        userIndex.push(_u_id);
        emit setNewUser(_u_id, _assetAccount, _etherAddr, users[_u_id].accountStatus, now);
    }

    //設定user的狀態
    function setAccountStatus(string _u_id, uint _accountStatus) public isOwner{
        users[_u_id].accountStatus = _accountStatus;
        emit changeAccountStatus(_u_id, _accountStatus, now);
    }

    //設定user的以太帳號
    function setEthAddr(string _u_id, address _newEtherAddr) public isOwner{
        users[_u_id].etherAddr = _newEtherAddr;
        emit changeEthAddr(users[_u_id].u_id, users[_u_id].assetAccount, _newEtherAddr, users[_u_id].accountStatus, now);
    }

    //取得user數量
    function getUserCount() public constant returns(uint userCount){
    	return userIndex.length;
	}

    //get user information
    function getUserInfo(string _u_id) public isOwner view returns (string u_id, address assetAccount, address etherAddr, uint accountStatus) {
        return(users[_u_id].u_id, users[_u_id].assetAccount, users[_u_id].etherAddr, users[_u_id].accountStatus);
    }

/*尚未支援回傳string[]
    //get 所有user
    function getAllUserInfo() public isOwner view  returns (string[], address[], address[], uint[]){
        string[] memory u_ids = new string[](userIndex.length);
        address[] memory assetAccounts = new address[](userIndex.length);
        address[] memory etherAddrs = new address[](userIndex.length);
        uint[]    memory accountStatus = new uint[](userIndex.length);

        for (uint i = 0; i < userIndex.length; i++) {
            User storage user = users[userIndex[i]];
            u_ids[i] = user.u_id;
            assetAccounts[i] = user.assetAccount;
            etherAddrs[i] = user.etherAddr;
            accountStatus[i] = user.accountStatus;
        }

        return (u_ids, assetAccounts, etherAddrs, accountStatus);
    }
*/

}
