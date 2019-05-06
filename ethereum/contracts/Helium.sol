pragma solidity ^0.5.1;


interface Helium_interface{
    function checkCustomerService(address _eoa) external view returns(bool _isCustomerService);
    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor);
}

contract Helium {
    
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
    
    struct PermissionTable {
        address platformEoA;
        uint permissionCode;
        bool permissionStatus;
    }
    
    mapping(address => PermissionTable) public PermissionList;
    
    constructor(address _Helium_Chairman, address _Helium_Director, address _Helium_Manager, address _Helium_Owner) public{
        Helium_Admin = msg.sender;
        Helium_Chairman = _Helium_Chairman;
        Helium_Director = _Helium_Director;
        Helium_Manager = _Helium_Manager;
        Helium_Owner = _Helium_Owner;
    }
    
    //Helium
    function addCustomerService (address _eoa) public onlyAdmin {
        PermissionList[_eoa].platformEoA = _eoa;
        PermissionList[_eoa].permissionCode = 1;
        PermissionList[_eoa].permissionStatus = true;
    }
    
    function addPlatformSupervisor (address _eoa) public onlyAdmin {
        PermissionList[_eoa].platformEoA = _eoa;
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
        require(msg.sender == Helium_Admin || PermissionList[msg.sender].permissionCode == 1 || PermissionList[msg.sender].permissionCode == 2, "Only Platform Role can call this function");
        return PermissionList[_eoa].permissionCode;
    }

    //Vote for MultiSig 
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
    
    event SetManagement(address indexed addrOld, address indexed addrNew, uint personIdx);
    bool public locked;// initialized as false
    function setManagement(uint8 managementIdx, address addrNew, uint8 itg) external isMultiSig {
        require(!locked, "noReentrancy failed");
        locked = true;
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

    function getMultiVotes() public view returns(uint,uint,uint,uint,uint){
        return (Helium_OwnerVote, Helium_ChairmanVote, Helium_DirectorVote, Helium_ManagerVote, Helium_AdminVote);
    }


    function checkCustomerService(address _eoa) external view returns(bool _isCustomerService){
        require(_eoa == Helium_Admin || (PermissionList[_eoa].permissionCode == 1 && PermissionList[msg.sender].permissionStatus == true), "only Admin or Customer Service can call this function");
        return true;
    }

    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor){
        require(_eoa == Helium_Admin || (PermissionList[_eoa].permissionCode == 2 && PermissionList[msg.sender].permissionStatus == true), "only Admin or Supervisor can call this function");
        return true;
    }

    function checkAdmin(address _eoa) external view returns(bool _isAdmin) {
        require(_eoa == Helium_Admin);
        return true;
    }

    modifier onlyAdmin(){
        require(msg.sender == Helium_Admin, "only admin can call this function");
        _;
    }

    modifier isMultiSig(){
        require(Helium_OwnerVote + Helium_ChairmanVote + Helium_DirectorVote + Helium_ManagerVote + Helium_AdminVote >= MinimumVotesForMultiSig, "isMultiSig failed due to not enough votes");
        _;
    }
}