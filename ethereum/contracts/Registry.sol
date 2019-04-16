pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
//deploy parameters: none
import "./Ownable.sol";
import "./SafeMath.sol";

contract Registry is Ownable {
    using SafeMath for uint256;
    using AddressUtils for address;

    /**@dev 註冊相關event */
    event SetNewUser(string uid, address assetCtrtAddr, address extOwnedAddr, uint authLevel, uint timeCurrent);
    event SetOldUser(string uid, address assetCtrtAddr, address extOwnedAddr, uint authLevel, uint timeCurrent);
    event SetAuthLevel(string uid, uint authLevel, uint timeCurrent);
    event SetAssetCtrtAddr(string uid, address assetCtrtAddr, uint timeCurrent);
    event SetExtOwnedAddr(string uid, address assetCtrtAddr, address extOwnedAddr, uint authLevel, uint timeCurrent);

    event SetRestrictions(uint authLevel, uint maxBuyAmountPublic, uint maxBalancePublic, uint maxBuyAmountPrivate, uint maxBalancePrivate);//amount in fiat

    /**@dev 資料結構 */
    struct User{
        address assetCtrtAddr; //user assetContract address
        address extOwnedAddr; //user Externally Owned Address(EOA);
        uint authLevel; //0=>revoked, 1, 2, 3,...=> different level of authorization
    }
    mapping (string => User) users;//string: 2 letters for country + 身分證字號, SSN, SIN
    uint public userCindex;//count of all users and the index of each users

    //Legal/Regulation Compliance
    mapping (address => string) public assetCtrtAddrToUid;//to find user id from its asset contract address. This is used in Legal Compliance check

    mapping (uint => Restriction) public restrictions;//uint classNum
    //restrictions[classification] .mpaPF .mhbPF .mpaPP .mhbPP
    struct Restriction{
      uint maxBuyAmountPublic;//max Buy Amount in fiat.. Public Funding;
      uint maxBalancePublic;//max Holding Balance in fiat .. Public Funding;
      //uint maxSellAmountPublic;//max Sell Amount in fiat .. Public Funding;
      uint maxBuyAmountPrivate;//max Buy Amount in fiat .. Private Placement;
      uint maxBalancePrivate;//max Holding Balance in fiat .. Private Placement;
      //uint maxSellAmountPrivate;//max Sell Amount in fiat .. Private Placement;
    }

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
    modifier ckExtOwnedAddr(address _extOwnedAddr) {
        require(_extOwnedAddr != address(0), "extOwnedAddr should not be zero");
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
        require(users[uid].extOwnedAddr != address(0), "user does not exist: extOwnedAddr is empty");
        _;
    }

    /**@dev add user with his user Id(uid), asset contract address(assetCtrtAddr), external Address(extOwnedAddr) */
    function addUser(string calldata uid, address assetCtrtAddr, address extOwnedAddr, uint authLevel) external
        onlyAdmin ckUid(uid) ckAssetCtrtAddr(assetCtrtAddr) ckExtOwnedAddr(extOwnedAddr) {

        require(users[uid].assetCtrtAddr == address(0), "user already exists: assetCtrtAddr not empty");
        require(users[uid].extOwnedAddr == address(0), "user already exists: extOwnedAddr not empty");
        userCindex = userCindex.add(1);

        users[uid].assetCtrtAddr = assetCtrtAddr;
        users[uid].extOwnedAddr = extOwnedAddr;
        users[uid].authLevel = authLevel;

        assetCtrtAddrToUid[assetCtrtAddr] = uid;
        emit SetNewUser(uid, assetCtrtAddr, extOwnedAddr, 0, now);
    }

    /**@dev set existing user’s information: this uid, assetCtrtAddr, extOwnedAddr, authLevel */
    function setUser(
        string calldata uid, address assetCtrtAddr, address extOwnedAddr,
        uint authLevel)
        external onlyAdmin ckUid(uid) ckAssetCtrtAddr(assetCtrtAddr) ckExtOwnedAddr(extOwnedAddr) uidExists(uid) {

        assetCtrtAddrToUid[users[uid].assetCtrtAddr] = "";
        users[uid].assetCtrtAddr = assetCtrtAddr;
        users[uid].extOwnedAddr = extOwnedAddr;
        users[uid].authLevel = authLevel;

        assetCtrtAddrToUid[assetCtrtAddr] = uid;
        emit SetOldUser(uid, assetCtrtAddr, extOwnedAddr, authLevel, now);
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
    function setExtOwnedAddr(string calldata uid, address extOwnedAddr) external
    onlyAdmin ckUid(uid) ckExtOwnedAddr(extOwnedAddr) uidExists(uid) {
        users[uid].extOwnedAddr = extOwnedAddr;
        emit SetExtOwnedAddr(uid, users[uid].assetCtrtAddr, extOwnedAddr, users[uid].authLevel, now);
    }

    /**@dev set user’s authLevel */
    function setUserAuthLevel(string calldata uid, uint authLevel) external
    onlyAdmin ckUid(uid) uidExists(uid) {
        users[uid].authLevel = authLevel;
    }

    /**@dev get user’s information via user’s Id or uid*/
    function getUser(string memory uid) public view ckUid(uid) returns (
        string memory uid_, address assetCtrtAddr, address extOwnedAddr, uint authLevel) {
          uid_ = uid;
        return(uid_, users[uid].assetCtrtAddr, users[uid].extOwnedAddr, users[uid].authLevel);
    }

    /**@dev get uid from user’s asset contract address */
    function getUidFromAssetCtrtAddr(address assetCtrtAddr) public view 
        ckAssetCtrtAddr(assetCtrtAddr) returns (string memory uid) {
        uid = assetCtrtAddrToUid[assetCtrtAddr];
    }



    /**@dev check if the user with uid is approved */
    function isUserApproved(string memory uid) public view 
      ckUid(uid) uidExists(uid) returns (bool) {
        return (users[uid].authLevel > 0);
    }

    /**@dev check if asset contract address is approved, by finding its uid then checking the uid’s info */
    function isAddrApproved(address assetCtrtAddr) public view returns (bool, string memory uid) {
        require(assetCtrtAddr.isContract(), "assetCtrtAddr should contain contract code");
        //require(assetCtrtAddr != address(0), "assetCtrtAddr should not be zero");
        uid = assetCtrtAddrToUid[assetCtrtAddr];
        return (isUserApproved(uid), uid);
    }


    /**@dev check if asset contract address & buyAmount & balance are approved, by finding its uid then checking the uid’s info */
    function isFundingApproved(address assetCtrtAddr, uint buyAmount, uint balance, uint fundingType) external view returns (bool) {//amount and balance are in token qty* price

        (bool boolAddrApproved, string memory uid) = isAddrApproved(assetCtrtAddr);

        uint authLevel = users[uid].authLevel;
        require(buyAmount > 0, "buyAmount shoube be > 0");
        if(fundingType == 1){ //public crowdfunding
            require(restrictions[authLevel].maxBuyAmountPublic >= buyAmount, "buyAmount should be <= maxBuyAmountPublic");
            require(restrictions[authLevel].maxBalancePublic >= balance.add(buyAmount), "balance should be <= maxBalancePublic");
        } else if(fundingType == 2) { //private placement
            require(restrictions[authLevel].maxBuyAmountPrivate >= buyAmount, "buyAmount should be <= maxBuyAmountPrivate");
            require(restrictions[authLevel].maxBalancePrivate >= balance.add(buyAmount), "balance should be <= maxBalancePrivate");
        } else {
            revert("fundingType value is out of range");
        }
        return boolAddrApproved;
    }

    /**@dev get regulation's restrictions, amount and balance in fiat */
    function setRestrictions(uint authLevel, uint maxBuyAmountPublic, uint maxBalancePublic, uint maxBuyAmountPrivate, uint maxBalancePrivate) external onlyAdmin {
        restrictions[authLevel].maxBuyAmountPublic = maxBuyAmountPublic;
        restrictions[authLevel].maxBalancePublic = maxBalancePublic;
        restrictions[authLevel].maxBuyAmountPrivate = maxBuyAmountPrivate;
        restrictions[authLevel].maxBalancePrivate = maxBalancePrivate;
        emit SetRestrictions(authLevel, maxBuyAmountPublic, maxBalancePublic, maxBuyAmountPrivate, maxBalancePrivate);
    }
    function setMaxBuyAmountPublic(uint authLevel, uint maxBuyAmountPublic) external onlyAdmin {
        restrictions[authLevel].maxBuyAmountPublic = maxBuyAmountPublic;
        emit SetMaxBuyAmountPublic(authLevel, maxBuyAmountPublic);
    }
    event SetMaxBuyAmountPublic(uint authLevel, uint maxBuyAmountPublic);//amount in fiat

    function setMaxBalancePublic(uint authLevel, uint maxBalancePublic) external onlyAdmin {
        restrictions[authLevel].maxBalancePublic = maxBalancePublic;
        emit SetMaxBalancePublic(authLevel, maxBalancePublic);
    }
    event SetMaxBalancePublic(uint authLevel, uint maxBalancePublic);//amount in fiat

    function setMaxBuyAmountPrivate(uint authLevel, uint maxBuyAmountPrivate) external onlyAdmin {
        restrictions[authLevel].maxBuyAmountPrivate = maxBuyAmountPrivate;
        emit SetMaxBuyAmountPrivate(authLevel, maxBuyAmountPrivate);
    }
    event SetMaxBuyAmountPrivate(uint authLevel, uint maxBuyAmountPrivate);//amount in fiat

    function setMaxBalancePrivate(uint authLevel, uint maxBalancePrivate) external onlyAdmin {
        restrictions[authLevel].maxBalancePrivate = maxBalancePrivate;
        emit SetMaxBalancePrivate(authLevel, maxBalancePrivate);
    }
    event SetMaxBalancePrivate(uint authLevel, uint maxBalancePrivate);//amount in fiat

    // function getRestrictions(uint authLevel) external onlyAdmin returns (uint maxBuyAmountPublic, uint maxBalancePublic, uint maxBuyAmountPrivate, uint maxBalancePrivate){
    //     maxBuyAmountPublic = restrictions[authLevel].maxBuyAmountPublic;
    //     maxBalancePublic = restrictions[authLevel].maxBalancePublic;
    //     maxBuyAmountPrivate = restrictions[authLevel].maxBuyAmountPrivate;
    //     maxBalancePrivate = restrictions[authLevel].maxBalancePrivate;
    // }

    function() external payable { revert("should not send any ether directly"); }
}
/*
authLevel & STO investor classification on purchase amount and holding balance restrictions in case of public funding and private placement, for each symbol; currency = NTD
0 Natural person: 0, 0; UnLTD, UnLTD;
1 Professional institutional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
2 High Networth investment legal person: UnLTD, UnLTD; UnLTD, UnLTD; 
3 Legal person or fund of a professional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
4 Natural person of Professional investor: 10k, 10k; UnLTD, UnLTD;
*/

//--------------------==
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) }
        return size > 0;
    }
}