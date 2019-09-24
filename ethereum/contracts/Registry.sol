pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;
//deploy parameters: none
import "./SafeMath.sol";

interface HeliumITF_Reg{
    function checkCustomerService(address _eoa) external view returns(bool _isCustomerService);
}

contract Registry {
    using SafeMath for uint256;
    using AddressUtils for address;

    /**@dev 註冊相關event */
    event SetNewUser(string uid, address assetbookAddr, uint authLevel, uint timeCurrent);
    event SetOldUser(string uid, address assetbookAddr, uint authLevel, uint timeCurrent);
    event SetAuthLevel(string uid, uint authLevel, uint timeCurrent);
    event SetAssetbookAddr(string uid, address assetbookAddr, uint timeCurrent);
    event SetExtOwnedAddr(string uid, address assetbookAddr, uint authLevel, uint timeCurrent);

    event SetRestrictions(
    uint authLevel, uint maxBuyAmountPublic, uint maxBalancePublic, uint maxBuyAmountPrivate, uint maxBalancePrivate);//amount in fiat

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
    address public addrHelium;

    constructor(address _addrHelium) public {
        addrHelium = _addrHelium;
        currencyType = "NTD";
        //setRestrictions(uint authLevel, uint maxBuyAmountPublic, uint
        //maxBalancePublic, uint maxBuyAmountPrivate, uint maxBalancePrivate);
        setRestrictions(1, 0, 0, uintMax, uintMax);
        setRestrictions(2, uintMax, uintMax, uintMax, uintMax);
        setRestrictions(3, uintMax, uintMax, uintMax, uintMax);
        setRestrictions(4, uintMax, uintMax, uintMax, uintMax);
        setRestrictions(5, 300000, 300000, uintMax, uintMax);
        isAfterDeployment = true;
    }
    function checkDeploymentConditions(
        address _addrHelium
      ) public view returns(bool[] memory boolArray) {
        boolArray = new bool[](2);
        boolArray[0] = _addrHelium.isContract();
        boolArray[1] = bytes(currencyType).length > 2;
    }
/*
authLevel & STO investor classification on purchase amount and holding balance restrictions in case of public offering and private placement, for each symbol; currency = NTD
1 Natural person: 0, 0; UnLTD, UnLTD;
2 Professional institutional investor: UnLTD, UnLTD; UnLTD, UnLTD;
3 High Networth investment legal person: UnLTD, UnLTD; UnLTD, UnLTD;
4 Legal person or fund of a professional investor: UnLTD, UnLTD; UnLTD, UnLTD;
5 Natural person of Professional investor: 100k, 100k; UnLTD, UnLTD;
*/

    modifier onlyCustomerService() {
        require(HeliumITF_Reg(addrHelium).checkCustomerService(msg.sender), "only customerService is allowed to call this function");
        _;
    }
    function setAddrHelium(address _addrHelium) external onlyCustomerService{
        addrHelium = _addrHelium;
    }
    function checkCustomerServiceFromReg() external view returns (bool){
        return (HeliumITF_Reg(addrHelium).checkCustomerService(msg.sender));
    }


    /**@dev check uid value */
    modifier ckUidLength(string memory uid) {
        require(bytes(uid).length > 0, "uid cannot be zero length");
        require(bytes(uid).length <= 32, "uid cannot be longer than 32");//compatible to bytes32 format, too
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
    function checkAddSetUser(string calldata uid, address assetbookAddr, uint authLevel) external view returns(bool[] memory boolArray) {
        boolArray = new bool[](7);
        boolArray[0] = HeliumITF_Reg(addrHelium).checkCustomerService(msg.sender);
        //ckUidLength(uid)
        boolArray[1] = bytes(uid).length > 0;
        boolArray[2] = bytes(uid).length <= 32;//compatible to bytes32 format, too

        //ckAssetbookValid(assetbookAddr)
        boolArray[3] = assetbookAddr != address(0);
        boolArray[4] = assetbookAddr.isContract();
        boolArray[5] = uidToAssetbook[uid] == address(0);
        boolArray[6] = authLevel > 0 && authLevel < 10;
    }
    function addUser(string calldata uid, address assetbookAddr, uint authLevel) external onlyCustomerService
        ckUidLength(uid) ckAssetbookValid(assetbookAddr) {

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
    external ckUidLength(uid) ckAssetbookValid(assetbookAddr) uidToAssetbookExists(uid) onlyCustomerService{

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
    function getUserFromAssetbook(address assetbookAddr) public view
    ckAssetbookValid(assetbookAddr) returns (string memory uid, uint authLevel) {
        uid = assetbookToUser[assetbookAddr].uid;
        authLevel = assetbookToUser[assetbookAddr].authLevel;
    }

    /**@dev set user’s authLevel */
    function setUserAuthLevel(string calldata uid, uint authLevel) external ckUidLength(uid) uidToAssetbookExists(uid) onlyCustomerService{
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


    /**@dev check if asset contract address & buyAmount & balance are approved, by finding its uid then checking the uid’s info */
    function isFundingApproved(address assetbookAddr, uint buyAmount, uint balance, uint fundingType)
        external view returns (bool isOkBuyAmount, bool isOkBalanceNew, uint authLevel, uint maxBuyAmount, uint maxBalance) {
      //amount and balance are in token qty* price
        authLevel = assetbookToUser[assetbookAddr].authLevel;
        uint balanceNew = balance.add(buyAmount);

        if(fundingType == 1){// 1: PublicOffering
            maxBuyAmount = restrictions[authLevel].maxBuyAmountPublic;
            maxBalance = restrictions[authLevel].maxBalancePublic;
            isOkBuyAmount = maxBuyAmount >= buyAmount;
            isOkBalanceNew = maxBalance >= balanceNew;

        } else if(fundingType == 2){// 2: PrivatePlacement
            maxBuyAmount = restrictions[authLevel].maxBuyAmountPrivate;
            maxBalance = restrictions[authLevel].maxBalancePrivate;
            isOkBuyAmount = maxBuyAmount >= buyAmount;
            isOkBalanceNew = maxBalance >= balanceNew;

        } else {
            maxBuyAmount = 90000;
            maxBalance = 900000000000;
            isOkBuyAmount = maxBuyAmount >= buyAmount;
            isOkBalanceNew = maxBalance >= balanceNew;
        }
    }

    /**@dev get regulation's restrictions, amount and balance in fiat */
    function setRestrictions(
        uint authLevel, uint maxBuyAmountPublic,
        uint maxBalancePublic, uint maxBuyAmountPrivate,
        uint maxBalancePrivate) public {
        if(isAfterDeployment) {
            require(HeliumITF_Reg(addrHelium).checkCustomerService(msg.sender), "only customerService is allowed to call this function");
        }
        restrictions[authLevel].maxBuyAmountPublic = maxBuyAmountPublic;
        restrictions[authLevel].maxBalancePublic = maxBalancePublic;
        restrictions[authLevel].maxBuyAmountPrivate = maxBuyAmountPrivate;
        restrictions[authLevel].maxBalancePrivate = maxBalancePrivate;
        emit SetRestrictions(authLevel, maxBuyAmountPublic, maxBalancePublic, maxBuyAmountPrivate, maxBalancePrivate);
    }
    function setMaxBuyAmountPublic(uint authLevel, uint maxBuyAmountPublic) external onlyCustomerService{
        restrictions[authLevel].maxBuyAmountPublic = maxBuyAmountPublic;
        emit SetMaxBuyAmountPublic(authLevel, maxBuyAmountPublic);
    }
    event SetMaxBuyAmountPublic(uint authLevel, uint maxBuyAmountPublic);//amount in fiat

    function setMaxBalancePublic(uint authLevel, uint maxBalancePublic) external onlyCustomerService{
        restrictions[authLevel].maxBalancePublic = maxBalancePublic;
        emit SetMaxBalancePublic(authLevel, maxBalancePublic);
    }
    event SetMaxBalancePublic(uint authLevel, uint maxBalancePublic);//amount in fiat

    function setMaxBuyAmountPrivate(uint authLevel, uint maxBuyAmountPrivate) external onlyCustomerService{
        restrictions[authLevel].maxBuyAmountPrivate = maxBuyAmountPrivate;
        emit SetMaxBuyAmountPrivate(authLevel, maxBuyAmountPrivate);
    }
    event SetMaxBuyAmountPrivate(uint authLevel, uint maxBuyAmountPrivate);//amount in fiat

    function setMaxBalancePrivate(uint authLevel, uint maxBalancePrivate) external onlyCustomerService{
        restrictions[authLevel].maxBalancePrivate = maxBalancePrivate;
        emit SetMaxBalancePrivate(authLevel, maxBalancePrivate);
    }
    event SetMaxBalancePrivate(uint authLevel, uint maxBalancePrivate);//amount in fiat

    // function getRestrictions(uint authLevel) external returns (uint maxBuyAmountPublic, uint maxBalancePublic, uint maxBuyAmountPrivate, uint maxBalancePrivate){
    //     maxBuyAmountPublic = restrictions[authLevel].maxBuyAmountPublic;
    //     maxBalancePublic = restrictions[authLevel].maxBalancePublic;
    //     maxBuyAmountPrivate = restrictions[authLevel].maxBuyAmountPrivate;
    //     maxBalancePrivate = restrictions[authLevel].maxBalancePrivate;
    // }

    function setCurrencyType(string calldata _currencyType) external onlyCustomerService{
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