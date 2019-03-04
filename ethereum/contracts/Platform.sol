pragma solidity ^0.5.4;

import "./SafeMath.sol";
import "./Ownable.sol";

interface AssetBookITF_Platform {
  function platformSign(uint256 _timeCurrent) external;
}

contract Platform is Ownable {
    using SafeMath for uint256;
    uint public adminNumber;
    address public platformCtAdmin;

    struct Platforms{
        string platformAdminId; //platform admin id
        address platformAdminAddr; //platform admin address
    }
    mapping(string => Platforms) platforms;
    string[] platformAdminIds; //platform address list


    event addPlatformAdminEvent(address indexed adminAddr,string id, uint256 timestamp);
    event deletePlatformAdminEvent(address indexed adminAddr, string id, uint256 timestamp);
    event changePlatformAdminEvent(address indexed oldAdminAddr, address indexed newAdminAddr, string id, uint256 timestamp);


    constructor(address _platformCtAdmin) public{
        platformCtAdmin = _platformCtAdmin;
    }

    //檢查是否為 platformCtAdmin
    modifier isPlatformCtAdmin(){
        require(msg.sender == platformCtAdmin, "請檢查是否為合約 platformCtAdmin");
        _;
    }
    //檢查是否為platformAdmin
    modifier isPlatformAdmin(string memory _id){
        require(msg.sender == platforms[_id].platformAdminAddr || msg.sender == platformCtAdmin, "請檢查是否為平台管理員");
        _;
    }

    function setPlatformCtAdmin(address _platformCtAdmin) public onlyAdmin {
        platformCtAdmin = _platformCtAdmin;
    }

    //sign assetContract 的 multiSig
    function signAssetContract(address _assetContractAddr, string memory _id, uint256 _time) public isPlatformAdmin(_id){

        AssetBookITF_Platform _multiSig = AssetBookITF_Platform(address(uint160(_assetContractAddr)));
        _multiSig.platformSign(_time);
    }

    //新增admin
    function addPlatformAdmin(address _adminAddr, string memory _id, uint _time) public isPlatformCtAdmin{

        platforms[_id].platformAdminId = _id;
        platforms[_id].platformAdminAddr = _adminAddr;
        platformAdminIds.push(_id);
        adminNumber = adminNumber.add(1);

        emit addPlatformAdminEvent(_adminAddr, _id, _time);
    }

    //移除admin
    function deletePlatformAdmin(string memory _id, uint _time) public isPlatformCtAdmin{

        address _adminAddr = platforms[_id].platformAdminAddr;
        adminNumber = adminNumber.sub(1);
        delete platforms[_id];

        emit deletePlatformAdminEvent(_adminAddr, _id, _time);
    }

    //更改admin address
    function changePlatformAdmin(address _newAdminAddr, string memory _id, uint _time) public isPlatformCtAdmin{

        address _oldAdminNumber = platforms[_id].platformAdminAddr;
        platforms[_id].platformAdminAddr = _newAdminAddr;

        emit changePlatformAdminEvent(_oldAdminNumber, _newAdminAddr, _id, _time);
    }

    // function getPlatformAdminNumber() public view returns(uint platformAdminNumber){
    //     return adminNumber;
    // }

    function getPlatformAdminInfo(string memory _id) public view returns(address platformAdminAddr){
        return platforms[_id].platformAdminAddr;
    }

}