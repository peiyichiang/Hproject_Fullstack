pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
//deploy parameters: none
import "./Ownable.sol";
import "./SafeMath.sol";

contract Registry is Ownable {
    using SafeMath for uint256;
    using AddressUtils for address;

    /**@dev 註冊相關event */
    event SetNewUser(string uid, address assetbookAddr, uint authLevel, uint timeCurrent);
    event SetOldUser(string uid, address assetbookAddr, uint authLevel, uint timeCurrent);
    event SetAuthLevel(string uid, uint authLevel, uint timeCurrent);
    event SetAssetbookAddr(string uid, address assetbookAddr, uint timeCurrent);
    event SetExtOwnedAddr(string uid, address assetbookAddr, uint authLevel, uint timeCurrent);

    event SetRestrictions(uint authLevel, uint maxBuyAmountPublic, uint maxBalancePublic, uint maxBuyAmountPrivate, uint maxBalancePrivate);//amount in fiat

    /**@dev 資料結構 */
    //extOwnedAddr ... get it from Assetbook
    struct User{
        string uid;
        uint authLevel;//different level of authorization. 0 means not authorized at all. Starting from 1
        //mapping (uint => bool) authLevel;
    }
    mapping (address => User) public assetbookToUser;//to find user from its asset contract address. This is used in Legal Compliance check

    //Legal/Regulation Compliance
    mapping (string => address) uidToAssetbook;//string: 2 letters for country + 身分證字號, SSN, SIN
    uint public userCindex;//count of all users and the index of each users

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
    string public currencyType;
    uint public uintMax = 2**256 - 1;
    bool public isAfterDeployment;

    constructor(address[] memory management) public {
        require(management.length > 4, "management.length should be > 4");
        owner = management[4];
        chairman = management[3];
        director = management[2];
        manager = management[1];
        admin = management[0];

        currencyType = "NTD";
        //setRestrictions(uint authLevel, uint maxBuyAmountPublic, uint maxBalancePublic, uint maxBuyAmountPrivate, uint maxBalancePrivate); 
        setRestrictions(1, 0, 0, uintMax, uintMax);
        setRestrictions(2, uintMax, uintMax, uintMax, uintMax);
        setRestrictions(3, uintMax, uintMax, uintMax, uintMax);
        setRestrictions(4, uintMax, uintMax, uintMax, uintMax);
        setRestrictions(5, 100000, 100000, uintMax, uintMax);
        isAfterDeployment = true;
    }
/*
authLevel & STO investor classification on purchase amount and holding balance restrictions in case of public offering and private placement, for each symbol; currency = NTD
1 Natural person: 0, 0; UnLTD, UnLTD;
2 Professional institutional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
3 High Networth investment legal person: UnLTD, UnLTD; UnLTD, UnLTD; 
4 Legal person or fund of a professional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
5 Natural person of Professional investor: 100k, 100k; UnLTD, UnLTD;
*/

    /**@dev check uid value */
    modifier ckUidLength(string memory uid) {
        uint uidLength = bytes(uid).length;
        require(uidLength > 0, "uid cannot be zero length");
        require(uidLength <= 32, "uid cannot be longer than 32");//compatible to bytes32 format, too
        _;
    }
    /**@dev check asset contract address */
    modifier ckAssetbookValid(address assetbookAddr) {
        require(assetbookAddr != address(0), "assetbookAddr should not be zero");
        require(assetbookAddr.isContract(), "assetbookAddr should contain contract code");
        _;
    }
    /**@dev check time */
    modifier ckTime(uint timeCurrent) {
        require(timeCurrent > 201902010000, "timeCurrent should be greater than 201902010000");
        _;
    }

    /**@dev check if uid exists by checking its user's information */
    modifier uidToAssetbookExists(string memory uid) {
        require(uidToAssetbook[uid] != address(0), "user does not exist: assetbookAddr is empty");
        _;
    }

    /**@dev add user with his user Id(uid), asset contract address(assetbookAddr) */
    function addUser(string calldata uid, address assetbookAddr, uint authLevel) external
        onlyAdmin ckUidLength(uid) ckAssetbookValid(assetbookAddr) {

        require(uidToAssetbook[uid] == address(0), "user already exists: assetbookAddr not empty");
        userCindex = userCindex.add(1);

        assetbookToUser[assetbookAddr].uid = uid;
        assetbookToUser[assetbookAddr].authLevel = authLevel;
        //assetbookToUser[assetbookAddr].authLevel[1] = true;

        uidToAssetbook[uid] = assetbookAddr;
        emit SetNewUser(uid, assetbookAddr, 0, now);
    }

    /**@dev set existing user’s information: this uid, assetbookAddr, authLevel */
    function setUser(string calldata uid, address assetbookAddr, uint authLevel) 
        external onlyAdmin ckUidLength(uid) ckAssetbookValid(assetbookAddr) uidToAssetbookExists(uid) {

        uidToAssetbook[uid] = assetbookAddr;
        assetbookToUser[assetbookAddr].uid = uid;
        assetbookToUser[assetbookAddr].authLevel = authLevel;
        emit SetOldUser(uid, assetbookAddr, authLevel, now);
    }

    /**@dev get user’s information via user’s Id or uid*/
    function getUserFromUid(string memory uid) public view ckUidLength(uid) returns (address assetbookAddr, uint authLevel) {
        assetbookAddr = uidToAssetbook[uid];
        authLevel = assetbookToUser[assetbookAddr].authLevel;
    }
    /**@dev get user’s information via user’s Id or uid*/
    function getUserFromAssetbook(address assetbookAddr) public view ckAssetbookValid(assetbookAddr) returns (string memory uid, uint authLevel) {
        uid = assetbookToUser[assetbookAddr].uid;
        authLevel = assetbookToUser[assetbookAddr].authLevel;
    }

    /**@dev set user’s authLevel */
    function setUserAuthLevel(string calldata uid, uint authLevel) external
    onlyAdmin ckUidLength(uid) uidToAssetbookExists(uid) {
        assetbookToUser[uidToAssetbook[uid]].authLevel = authLevel;
    }



    /**@dev check if the user with uid is approved */
    function isUidApproved(string memory uid) public view 
        ckUidLength(uid) uidToAssetbookExists(uid) returns (bool) {
        return (assetbookToUser[uidToAssetbook[uid]].authLevel > 0);
    }

    /**@dev check if asset contract address is approved, by finding its uid then checking the uid’s info */
    function isAssetbookApproved(address assetbookAddr) public view returns (bool) {
        return assetbookToUser[assetbookAddr].authLevel > 0;
    }

    function isFundingApprovedDebug(address assetbookAddr, uint buyAmount, uint balance, uint fundingType) 
      external view returns (uint authLevel, uint, uint, bool, uint, uint balanceBuyAmount, bool) {
      //amount and balance are in token qty* price
        authLevel = assetbookToUser[assetbookAddr].authLevel;
        balanceBuyAmount = balance.add(buyAmount);

        if(fundingType == 1){// 1 PublicOffering
            uint maxBuyAmountPublic = restrictions[authLevel].maxBuyAmountPublic;
            uint maxBalancePublic = restrictions[authLevel].maxBalancePublic;

            return(authLevel, fundingType, maxBuyAmountPublic, maxBuyAmountPublic >= buyAmount, maxBalancePublic, balanceBuyAmount, maxBalancePublic >= balanceBuyAmount);

        } else if(fundingType == 2){// "PrivatePlacement"
            uint maxBuyAmountPrivate = restrictions[authLevel].maxBuyAmountPrivate;
            uint maxBalancePrivate = restrictions[authLevel].maxBalancePrivate;

            return(authLevel, fundingType, maxBuyAmountPrivate, maxBuyAmountPrivate >= buyAmount, maxBalancePrivate, balanceBuyAmount, maxBalancePrivate >= balanceBuyAmount);

        } else {
            return(authLevel, fundingType, 1618, false, 3398, balanceBuyAmount, false);
        }
    }

    /**@dev check if asset contract address & buyAmount & balance are approved, by finding its uid then checking the uid’s info */
    function isFundingApproved(address assetbookAddr, uint buyAmount, uint balance, uint fundingType) external view returns (bool) {
      //amount and balance are in token qty* price
        uint authLevel = assetbookToUser[assetbookAddr].authLevel;
        uint balanceBuyAmount = balance.add(buyAmount);

        require(buyAmount > 0, "buyAmount shoube be > 0");
        if(fundingType == 1){// 1 PublicOffering
            require(restrictions[authLevel].maxBuyAmountPublic >= buyAmount, "buyAmount should be <= maxBuyAmountPublic");
            require(restrictions[authLevel].maxBalancePublic >= balanceBuyAmount, "balance + buyAmount should be <= maxBalancePublic");

        } else if(fundingType == 2){// "PrivatePlacement"
            require(restrictions[authLevel].maxBuyAmountPrivate >= buyAmount, "buyAmount should be <= maxBuyAmountPrivate");
            require(restrictions[authLevel].maxBalancePrivate >= balanceBuyAmount, "balance + buyAmount should be <= maxBalancePrivate");
        } else {
            revert("fundingType value is out of range");
        }
        return (authLevel > 0);
    }

    /**@dev get regulation's restrictions, amount and balance in fiat */
    function setRestrictions(uint authLevel, uint maxBuyAmountPublic, uint maxBalancePublic, uint maxBuyAmountPrivate, uint maxBalancePrivate) public {
        if(isAfterDeployment) {
            require(msg.sender == admin, "only admin can call this function");
        }
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

    function setCurrencyType(string calldata _currencyType) external onlyAdmin {
        currencyType = _currencyType;
    }


    //function() external payable { revert("should not send any ether directly"); }
}
/*
authLevel & STO investor classification on purchase amount and holding balance restrictions in case of public offering(P.O.) and private placement(P.P.), for each symbol; currency = NTD
1 Natural person: 0, 0; UnLTD, UnLTD;
2 Professional institutional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
3 High Networth investment legal person: UnLTD, UnLTD; UnLTD, UnLTD; 
4 Legal person or fund of a professional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
5 Natural person of Professional investor: 10k, 10k; UnLTD, UnLTD;
*/

//--------------------==
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) }
        return size > 0;
    }
}