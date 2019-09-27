pragma solidity ^0.5.4;
/*
interface Helium_Interface_CtrtX{
    function checkCustomerService(address _eoa) external view returns(bool _isCustomerService);
    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor);
    function checkAdmin(address _eoa) external view returns(bool _isAdmin);
}*/

contract Helium {
    bool public isAfterDeployment;
    address public Helium_Admin;
    address public Helium_Chairman;
    address public Helium_Director;
    address public Helium_Manager;
    address public Helium_Owner;

    uint8 public Helium_OwnerVote;
    uint8 public Helium_ChairmanVote;
    uint8 public Helium_DirectorVote;
    uint8 public Helium_ManagerVote;
    uint8 public Helium_AdminVote;

    uint8 public MinimumVotesForMultiSig = 3;
    bool public locked;// to prevent re-entry attack

    struct PermissionTable {
        uint permissionCode;
        bool permissionStatus;
    }

    mapping(address => PermissionTable) public PermissionList;
    mapping(address => bool) public isAddrAddedMapping;
    bool[] public isAddrAddedArray;// = new bool[](5);

    constructor(address[] memory management) public {
        if(management.length > 0){
            Helium_Admin = management[0];
            addPlatformSupervisor(Helium_Admin);
            isAddrAddedArray.push(isAddrAddedMapping[Helium_Admin]);
            isAddrAddedMapping[Helium_Admin] = true;
        }
        if(management.length > 1){
            Helium_Chairman = management[1];
            addPlatformSupervisor(Helium_Chairman);
            isAddrAddedArray.push(isAddrAddedMapping[Helium_Chairman]);
            isAddrAddedMapping[Helium_Chairman] = true;
        }
        if(management.length > 2){
            Helium_Director = management[2];
            addPlatformSupervisor(Helium_Director);
            isAddrAddedArray.push(isAddrAddedMapping[Helium_Director]);
            isAddrAddedMapping[Helium_Director] = true;
        }
        if(management.length > 3){
            Helium_Manager = management[3];
            addCustomerService(Helium_Manager);
            isAddrAddedArray.push(isAddrAddedMapping[Helium_Manager]);
            isAddrAddedMapping[Helium_Manager] = true;
        }
        if(management.length > 4){
            Helium_Owner = management[4];
            addCustomerService(Helium_Owner);
            isAddrAddedArray.push(isAddrAddedMapping[Helium_Owner]);
            isAddrAddedMapping[Helium_Owner] = true;
        }

        isAfterDeployment = true;
    }
    function checkDeploymentConditions(
        address[] memory management
      ) public view returns(bool, bool[] memory) {
        return (management.length > 4, isAddrAddedArray);
    }
    function getHeliumDetails() public view returns(
        address, address, address, address, address,
        bool, bool, uint8, uint8, uint8, uint8, uint8, uint8) {
        return (Helium_Admin, Helium_Chairman, Helium_Director, Helium_Manager,Helium_Owner, isAfterDeployment, locked,
        Helium_OwnerVote, Helium_ChairmanVote, Helium_DirectorVote, Helium_ManagerVote, Helium_AdminVote, MinimumVotesForMultiSig);
    }

    //"only Admin or Customer Service can call this function"
    function checkCustomerService(address _eoa) external view returns(bool _isCustomerService){
        _isCustomerService = (_eoa == Helium_Admin ||
        (PermissionList[_eoa].permissionCode == 1 && PermissionList[_eoa].permissionStatus == true));
    }
    //"only Admin or Supervisor can call this function"
    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor){
        _isPlatformSupervisor = (_eoa == Helium_Admin ||
        (PermissionList[_eoa].permissionCode == 2 && PermissionList[_eoa].permissionStatus == true));
    }
    function checkAdmin(address _eoa) external view returns(bool) {
        return (_eoa == Helium_Admin);
    }

    modifier onlyAdmin(){
        require(msg.sender == Helium_Admin, "only admin can call this function");
        _;
    }

    //Helium
    function addCustomerService(address _eoa) public {
        if(isAfterDeployment){
            require(msg.sender == Helium_Admin, "only admin can call this function");
        }
        PermissionList[_eoa].permissionCode = 1;
        PermissionList[_eoa].permissionStatus = true;
    }

    function addPlatformSupervisor(address _eoa) public {
        if(isAfterDeployment){
            require(msg.sender == Helium_Admin, "only admin can call this function");
        }
        PermissionList[_eoa].permissionCode = 2;
        PermissionList[_eoa].permissionStatus = true;
    }

    function changePermissionToCS(address _eoa) public onlyAdmin {
        PermissionList[_eoa].permissionCode = 1;
    }

    function changePermissionToPS(address _eoa) public onlyAdmin {
        PermissionList[_eoa].permissionCode = 2;
    }

    function removePermission(address _eoa) public onlyAdmin{
        PermissionList[_eoa].permissionStatus = false;
    }

    function showPermissionCode(address _eoa) public view returns(uint _permissionCode){
        require(
            msg.sender == Helium_Admin ||
        PermissionList[msg.sender].permissionCode == 1 || PermissionList[msg.sender].permissionCode == 2,
            "Only Platform Role can call this function");
        return PermissionList[_eoa].permissionCode;
    }

    //Vote to change EOAs
    function HeliumOwnerApprove(bool boolValue) external {
        require(msg.sender == Helium_Owner, "restricted to owner");
        if (boolValue){
            Helium_OwnerVote = 1;
        } else {Helium_OwnerVote = 0;}
    }

    function HeliumChairmanApprove(bool boolValue) external {
        require(msg.sender == Helium_Chairman, "restricted to chairman");
        if (boolValue){
            Helium_ChairmanVote = 1;
        } else {Helium_ChairmanVote = 0;}
    }

    function HeliumDirectorApprove(bool boolValue) external {
        require(msg.sender == Helium_Director, "restricted to director");
        if (boolValue){
            Helium_DirectorVote = 1;
        } else {Helium_DirectorVote = 0;}
    }

    function HeliumManagerApprove(bool boolValue) external {
        require(msg.sender == Helium_Manager, "restricted to manager");
        if (boolValue){
            Helium_ManagerVote = 1;
        } else {Helium_ManagerVote = 0;}
    }

    function HeliumAdminApprove(bool boolValue) external {
        require(msg.sender == Helium_Admin, "restricted to admin");
        if (boolValue){
            Helium_AdminVote = 1;
        } else {Helium_AdminVote = 0;}
    }

    function getEachVoteResult() public view returns(uint,uint,uint,uint,uint){
        return (Helium_OwnerVote, Helium_ChairmanVote, Helium_DirectorVote, Helium_ManagerVote, Helium_AdminVote);
    }

    function isVotedApproved() public view returns (bool isVotedApproved_){
        isVotedApproved_= Helium_OwnerVote +
        Helium_ChairmanVote +
        Helium_DirectorVote + Helium_ManagerVote + Helium_AdminVote
        >= MinimumVotesForMultiSig;
    }
    event SetManagement(address indexed addrOld, address indexed addrNew, uint personIdx);

    function setManagement(uint8 managementIdx, address addrNew, uint8 itg) external {
        require(!locked, "noReentrancy failed");
        locked = true;

        require(isVotedApproved(),"isVotedApproved failed due to not enough votes");

        require(
            msg.sender == Helium_Admin || msg.sender == Helium_Chairman || msg.sender == Helium_Director || msg.sender == Helium_Manager || msg.sender == Helium_Owner, "only management team can access");

        require(addrNew != address(0), "new address cannot be zero");

        if (managementIdx == 1) {
            Helium_Owner = addrNew;
            emit SetManagement(Helium_Owner, addrNew, managementIdx);
        } else if (managementIdx == 2) {
            Helium_Chairman = addrNew;
            emit SetManagement(Helium_Chairman, addrNew, managementIdx);
        } else if (managementIdx == 3) {
            Helium_Director = addrNew;
            emit SetManagement(Helium_Director, addrNew, managementIdx);
        } else if (managementIdx == 4) {
            Helium_Manager = addrNew;
            emit SetManagement(Helium_Manager, addrNew, managementIdx);
        } else if (managementIdx == 5) {
            Helium_Admin = addrNew;
            emit SetManagement(Helium_Admin, addrNew, managementIdx);
        } else if (managementIdx == 6) {
            MinimumVotesForMultiSig = itg;
        } else {
            require(false, "not valid option");
        }
        Helium_OwnerVote = 0;
        Helium_ChairmanVote = 0;
        Helium_DirectorVote = 0;
        Helium_ManagerVote = 0;
        Helium_AdminVote = 0;
        locked = false;
    }
}