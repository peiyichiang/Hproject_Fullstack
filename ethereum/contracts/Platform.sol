pragma solidity ^0.5.4;

import "./SafeMath.sol";
import "./Ownable.sol";

//MultiSigITF_Platform(addrMultiSigITF_Platform).platformVote(_timeCurrent)
interface MultiSigITF_Platform {
    function platformVote(uint256 _timeCurrent) external;
}

//AssetBookITF_Platform(addrMultiSigITF_Platform).setAssetCtrtApproval(_assetAddr, _isApprovedToWrite)
interface AssetBookITF_Platform {
    function setAssetCtrtApproval(address _assetAddr, bool _isApprovedToWrite) external;
}

contract Platform is Ownable {
    using SafeMath for uint256;
    uint public managerAmount;
    address public platformCtAdmin;

    struct Platforms{
        string platformManagerId; //platform Manager id
        address platformManagerAddr; //platform Manager address
    }
    mapping(string => Platforms) platformManagers;
    string[] platformManagerIds; //platform address list


    event addPlatformManagerEvent(address indexed managerAddr,string id, uint256 timestamp);
    event deletePlatformManagerEvent(address indexed managerAddr, string id, uint256 timestamp);
    event changePlatformManagerEvent(address indexed oldManagerAddr, address indexed newManagerAddr, string id, uint256 timestamp);


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
        require(msg.sender == platformManagers[_id].platformManagerAddr || msg.sender == platformCtAdmin, "請檢查是否為平台管理員");
        _;
    }

    function setPlatformCtAdmin(address _platformCtAdmin) public onlyAdmin {
        platformCtAdmin = _platformCtAdmin;
    }

    //vote MultiSig
    function voteMultiSigContract(address _multiSigContractAddr, string memory _id, uint256 _timeCurrent) public isPlatformManager(_id){
        MultiSigITF_Platform multiSig = MultiSigITF_Platform(address(uint160(_multiSigContractAddr)));
        multiSig.platformVote(_timeCurrent);
    }

    //approve asset/token contract to write to AssetBook contract
    function setAssetCtrtApproval(address _addrAssetBook, address _assetAddr, bool _isApprovedToWrite) public {
        AssetBookITF_Platform assetBook = AssetBookITF_Platform(address(uint160(_addrAssetBook)));
        assetBook.setAssetCtrtApproval(_assetAddr, _isApprovedToWrite);
    }

    //新增manager
    function addPlatformManager(address _managerAddr, string memory _id, uint _time) public isPlatformCtAdmin{
        require(platformManagers[_id].platformManagerAddr != _managerAddr, "此管理員已存在");

        platformManagers[_id].platformManagerId = _id;
        platformManagers[_id].platformManagerAddr = _managerAddr;
        platformManagerIds.push(_id);
        managerAmount = managerAmount.add(1);

        emit addPlatformManagerEvent(_managerAddr, _id, _time);
    }

    //移除manager
    function deletePlatformManager(string memory _id, uint _time) public isPlatformCtAdmin{

        address _managerAddr = platformManagers[_id].platformManagerAddr;
        managerAmount = managerAmount.sub(1);
        delete platformManagers[_id];

        emit deletePlatformManagerEvent(_managerAddr, _id, _time);
    }

    //更改manager address
    function changePlatformManager(address _newManagerAddr, string memory _id, uint _time) public isPlatformCtAdmin{

        address _oldManagerAddr = platformManagers[_id].platformManagerAddr;
        platformManagers[_id].platformManagerAddr = _newManagerAddr;

        emit changePlatformManagerEvent(_oldManagerAddr, _newManagerAddr, _id, _time);
    }

    function getPlatformManagerAmount() public view returns(uint platformmanagerAmount){
        return managerAmount;
    }

    function getPlatformManagerInfo(string memory _id) public view returns(address platformManagerAddr){
        return platformManagers[_id].platformManagerAddr;
    }

}