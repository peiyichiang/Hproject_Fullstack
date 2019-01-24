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
    uint public maxVotes = 5;
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

    function ownerSign() public {
        require(msg.sender == owner, "restricted to owner");
        ownerVote = 1;
    }
    function chairmanSign() public {
        require(msg.sender == chairman, "restricted to chairman");
        chairmanVote = 1;
    }
    function directorSign() public {
        require(msg.sender == director, "restricted to director");
        directorVote = 1;
    }
    function managerSign() public {
        require(msg.sender == manager, "restricted to manager");
        managerVote = 1;
    }
    function adminSign() public {
        require(msg.sender == admin, "restricted to admin");
        adminVote = 1;
    }
    modifier isMultiSig(){
        require(ownerVote + chairmanVote + directorVote + managerVote + adminVote >= minVotes, "isMultiSig failed due to not enough votes");
        _;
    }
    function resetSignStatus() internal {
        ownerVote = 0;
        chairmanVote = 0;
        directorVote = 0;
        managerVote = 0;
        adminVote = 0;
    }
    function setManagement(uint managementIdx, address addrNew) public isMultiSig noReentrancy{
        require(
            msg.sender == owner || msg.sender == chairman || msg.sender == director || msg.sender == manager || msg.sender == admin, "only management team can access");
        require(managementIdx > 0 && managementIdx <= maxVotes, "managementIdx is out of range");
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
        } else {require(false, "not valid option");}
        resetSignStatus();
    }
    function getVotes() public view returns(uint,uint,uint,uint,uint){
        return (ownerVote, chairmanVote, directorVote, managerVote, adminVote);
    }
}