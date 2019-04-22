pragma solidity ^0.5.4;

import "./SafeMath.sol";
import "./Ownable.sol";

//MultiSigITF_Platform(addrMultiSigITF_Platform).platformVote(_timeCurrent)
interface MultiSigITF_Platform {
    function platformCtrtVote(uint256 _timeCurrent) external;
}


contract Platform is Ownable {
    using SafeMath for uint256;
    uint public managerAmount;
    address public platformSupervisor;

    struct Platforms{
        string platformManagerId; //platform Manager id
        address platformManagerAddr; //platform Manager address
    }
    mapping(string => Platforms) platformManagers;
    string[] platformManagerIds; //platform address list


    event addPlatformManagerEvent(address indexed managerAddr,string id, uint256 timestamp);
    event deletePlatformManagerEvent(address indexed managerAddr, string id, uint256 timestamp);
    event changePlatformManagerEvent(address indexed oldManagerAddr, address indexed newManagerAddr, string id, uint256 timestamp);


    constructor(address _platformSupervisor, address[] memory managementTeam) public{
        platformSupervisor = _platformSupervisor;
        require(managementTeam.length > 4, "managementTeam.length should be > 4");
        owner = managementTeam[4];
        chairman = managementTeam[3];
        director = managementTeam[2];
        manager = managementTeam[1];
        admin = managementTeam[0];
    }

    //檢查是否為 platformSupervisor
    modifier onlyPlatformSupervisor(){
        require(msg.sender == platformSupervisor, "請檢查是否為合約 platformSupervisor");
        _;
    }

    function setPlatformSupervisor(address _platformSupervisor) public onlyPlatformSupervisor {
        platformSupervisor = _platformSupervisor;
    }

    //vote MultiSig
    function voteMultiSigContract(address _multiSigContractAddr, string memory _id, uint256 _timeCurrent) public {
        require(msg.sender == platformManagers[_id].platformManagerAddr || msg.sender == platformSupervisor, "請檢查是否為平台管理員");

        MultiSigITF_Platform multiSig = MultiSigITF_Platform(address(uint160(_multiSigContractAddr)));
        multiSig.platformCtrtVote(_timeCurrent);
    }


    //新增manager
    function addPlatformManager(address _managerAddr, string memory _id, uint _time) public onlyPlatformSupervisor{
        require(platformManagers[_id].platformManagerAddr != _managerAddr, "此管理員已存在");

        platformManagers[_id].platformManagerId = _id;
        platformManagers[_id].platformManagerAddr = _managerAddr;
        platformManagerIds.push(_id);
        managerAmount = managerAmount.add(1);

        emit addPlatformManagerEvent(_managerAddr, _id, _time);
    }

    //移除manager
    function deletePlatformManager(string memory _id, uint _time) public onlyPlatformSupervisor{

        address _managerAddr = platformManagers[_id].platformManagerAddr;
        managerAmount = managerAmount.sub(1);
        delete platformManagers[_id];

        emit deletePlatformManagerEvent(_managerAddr, _id, _time);
    }

    //更改manager address
    function changePlatformManager(address _newManagerAddr, string memory _id, uint _time) public onlyPlatformSupervisor{

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

    function() external payable { revert("should not send any ether directly"); }

}