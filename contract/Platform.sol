pragma solidity ^0.5.3;

import "./Asset.sol";
//import "browser/asset.sol";


contract platform{

    address owner;
    uint adminNumber = 0;
    struct Platform{
        string platformAdminId; /** @dev platform admin id */
        address platformAdminAddr; /** @dev platform admin address */
    }

    mapping(string => Platform) platforms;
    string[] platformsIndex; /** @dev platform address list */

    /** @dev platform相關event */
    event addPlatformAdminEvent(address indexed adminAddr,string id, uint256 timestamp);
    event deletePlatformAdminEvent(address indexed adminAddr, string id, uint256 timestamp);
    event changePlatformAdminEvent(address indexed oldAdminAddr, address indexed newAdminAddr, string id, uint256 timestamp);


    constructor() public{
        owner = msg.sender;
    }

    /** @dev 檢查是否為owner */
    modifier isOwner(){
        require(msg.sender == owner, "請檢查是否為合約擁有者");
        _;
    }

    /** @dev 檢查是否為platformAdmin */
    modifier isPlatformAdmin(string memory _id){
        require(msg.sender == platforms[_id].platformAdminAddr || msg.sender == owner, "請檢查是否為平台管理員");
        _;
    }

    /** @dev sign assetContract's platformSign */
    function signAssetContract(address _assetContractAddr, string memory _id, uint _time) public isPlatformAdmin(_id){
        AssetContract _multiSig = AssetContract(address(uint160(_assetContractAddr)));
        _multiSig.platformSign(_time);
    }

    /** @dev 新增admin */
    function addPlatformAdmin(address _adminAddr, string memory _id, uint _time) public isOwner(){

        platforms[_id].platformAdminId = _id;
        platforms[_id].platformAdminAddr = _adminAddr;
        platformsIndex.push(_id);
        adminNumber++;

        emit addPlatformAdminEvent(_adminAddr, _id, _time);
    }

    /** @dev 移除admin */
    function deletePlatformAdmin(string memory _id, uint _time) public isOwner(){

        address _adminAddr = platforms[_id].platformAdminAddr;
        adminNumber--;
        delete platforms[_id];

        emit deletePlatformAdminEvent(_adminAddr, _id, _time);
    }

    /** @dev 更改admin address */
    function changePlatformAdmin(address _newAdminAddr, string memory _id, uint _time) public isOwner(){

        address _oldAdminNumber = platforms[_id].platformAdminAddr;
        platforms[_id].platformAdminAddr = _newAdminAddr;

        emit changePlatformAdminEvent(_oldAdminNumber, _newAdminAddr, _id, _time);
    }

    /** @dev get Admin number */
    function getPlatformAdminNumber() public view returns(uint platformAdminNumber){
        return adminNumber;
    }

    /** @dev get 某個admin 資訊 */
    function getPlatformAdminInfo(string memory _id) public view returns(address platformAdminAddr){
        return platforms[_id].platformAdminAddr;
    }

}