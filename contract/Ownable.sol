pragma solidity ^0.5.3;

contract Ownable {
    address public owner;
    address public chairman;
    address public director;
    address public manager;
    address public admin;
    uint public ownerVote;
    uint public chairmanVote;
    uint public directorVote;
    uint public managerVote;
    uint public adminVote;
    uint public minVotes = 3;

    constructor() public {
        owner = msg.sender;
        chairman = msg.sender;
        director = msg.sender;
        manager = msg.sender;
        admin = msg.sender;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can call this function");
        _;
    }
    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin can call this function");
        _;
    }
    bool public locked;// initialized as false
    modifier noReentrancy() {
        require(!locked, "noReentrancy failed");
        locked = true;
        _;
        locked = false;
    }
    event SetManagement(address indexed addrOld, address indexed addrNew, uint personIdx);

    function ownerApprove(bool boolValue) external {
        require(msg.sender == owner, "restricted to owner");
        if (boolValue){
            ownerVote = 1;
        } else {ownerVote = 0;}
    }
    function chairmanApprove(bool boolValue) external {
        require(msg.sender == chairman, "restricted to chairman");
        if (boolValue){
            chairmanVote = 1;
        } else {chairmanVote = 0;}
    }
    function directorApprove(bool boolValue) external {
        require(msg.sender == director, "restricted to director");
        if (boolValue){
            directorVote = 1;
        } else {directorVote = 0;}
    }
    function managerApprove(bool boolValue) external {
        require(msg.sender == manager, "restricted to manager");
        if (boolValue){
            managerVote = 1;
        } else {managerVote = 0;}
    }
    function adminApprove(bool boolValue) external {
        require(msg.sender == admin, "restricted to admin");
        if (boolValue){
            adminVote = 1;
        } else {adminVote = 0;}
    }
    modifier isMultiSig(){
        require(ownerVote + chairmanVote + directorVote + managerVote + adminVote >= minVotes, "isMultiSig failed due to not enough votes");
        _;
    }

    function setManagement(uint8 managementIdx, address addrNew, uint8 itg) external isMultiSig noReentrancy{
        require(
            msg.sender == owner || msg.sender == chairman || msg.sender == director || msg.sender == manager || msg.sender == admin, "only management team can access");
        require(addrNew != address(0), "new address cannot be zero");
        if (managementIdx == 1) {
            owner = addrNew;
            emit SetManagement(owner, addrNew, managementIdx);
        } else if (managementIdx == 2) {
            chairman = addrNew;
            emit SetManagement(chairman, addrNew, managementIdx);
        } else if (managementIdx == 3) {
            director = addrNew;
            emit SetManagement(director, addrNew, managementIdx);
        } else if (managementIdx == 4) {
            manager = addrNew;
            emit SetManagement(manager, addrNew, managementIdx);
        } else if (managementIdx == 5) {
            admin = addrNew;
            emit SetManagement(admin, addrNew, managementIdx);
        } else if (managementIdx == 6) {
            minVotes = itg;
        } else {
            require(false, "not valid option");
        }
        ownerVote = 0;
        chairmanVote = 0;
        directorVote = 0;
        managerVote = 0;
        adminVote = 0;
    }
    function getVotes() public view returns(uint,uint,uint,uint,uint){
        return (ownerVote, chairmanVote, directorVote, managerVote, adminVote);
    }
}