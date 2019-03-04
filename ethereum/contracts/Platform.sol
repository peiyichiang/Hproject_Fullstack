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
        string platformManagerId; //platform admin id
        address platformManagerAddr; //platform admin address
    }
    mapping(string => Platforms) platforms;
    string[] platformManagerIds; //platform address list


    event addPlatformManagerEvent(address indexed adminAddr,string id, uint256 timestamp);
    event deletePlatformManagerEvent(address indexed adminAddr, string id, uint256 timestamp);
    event changePlatformManagerEvent(address indexed oldAdminAddr, address indexed newAdminAddr, string id, uint256 timestamp);


    constructor(address _platformCtAdmin) public{
        platformCtAdmin = _platformCtAdmin;
    }

    //檢查是否為 platformCtAdmin
    modifier isPlatformCtAdmin(){
        require(msg.sender == platformCtAdmin, "請檢查是否為合約 platformCtAdmin");
        _;
    }
    //檢查是否為platformManager
    modifier isPlatformManager(string memory _id){
        require(msg.sender == platforms[_id].platformManagerAddr || msg.sender == platformCtAdmin, "請檢查是否為平台管理員");
        _;
    }

    function setPlatformCtAdmin(address _platformCtAdmin) public onlyAdmin {
        platformCtAdmin = _platformCtAdmin;
    }

    //sign assetContract 的 multiSig
    function signAssetContract(address _assetContractAddr, string memory _id, uint256 _time) public isPlatformManager(_id){

        AssetBookITF_Platform _multiSig = AssetBookITF_Platform(address(uint160(_assetContractAddr)));
        _multiSig.platformSign(_time);
    }

    //新增admin
    function addPlatformManager(address _adminAddr, string memory _id, uint _time) public isPlatformCtAdmin{

        platforms[_id].platformManagerId = _id;
        platforms[_id].platformManagerAddr = _adminAddr;
        platformManagerIds.push(_id);
        adminNumber = adminNumber.add(1);

        emit addPlatformManagerEvent(_adminAddr, _id, _time);
    }

    //移除admin
    function deletePlatformManager(string memory _id, uint _time) public isPlatformCtAdmin{

        address _adminAddr = platforms[_id].platformManagerAddr;
        adminNumber = adminNumber.sub(1);
        delete platforms[_id];

        emit deletePlatformManagerEvent(_adminAddr, _id, _time);
    }

    //更改admin address
    function changePlatformManager(address _newAdminAddr, string memory _id, uint _time) public isPlatformCtAdmin{

        address _oldAdminNumber = platforms[_id].platformManagerAddr;
        platforms[_id].platformManagerAddr = _newAdminAddr;

        emit changePlatformManagerEvent(_oldAdminNumber, _newAdminAddr, _id, _time);
    }

    // function getPlatformManagerNumber() public view returns(uint platformManagerNumber){
    //     return adminNumber;
    // }

    function getPlatformManagerInfo(string memory _id) public view returns(address platformManagerAddr){
        return platforms[_id].platformManagerAddr;
    }

}