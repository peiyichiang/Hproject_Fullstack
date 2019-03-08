pragma solidity ^0.5.2;
/**
0.5.2+commit.1df8f40c.Emscripten.clang
*/

contract MultiSigAssetContract {
    
    uint constant public MAX_OWNER_COUNT = 3;

    event Confirmation(address indexed sender, uint indexed ProposalId);
    event Revocation(address indexed sender, uint indexed ProposalId);
    event Submission(uint indexed ProposalId);
    event Execution(uint indexed ProposalId);
    event ExecutionFailure(uint indexed ProposalId);
    event Deposit(address indexed sender, uint value);
    event OwnerAddition(address indexed addr);
    event OwnerRemoval(address indexed addr);
    event RequirementChange(uint required);

    mapping (uint => Proposal) public Proposals;
    mapping (uint => mapping (address => bool)) public voteResults;
    //voteResults[ProposalId][theGroup[i]]
    mapping (address => bool) public isInGroup;

    address public owner;
    address public ownerN;
    mapping (uint => address) public platformReps;
    mapping (uint => address) public platformRepsN;
    mapping (uint => address) public endorsers;
    mapping (uint => address) public endorsersN;

    uint public testCount;
    uint public ProposalCount;

    struct Proposal {
        uint funcNum;
        address addrNew;
        bool isExecuted;
    }
    event eventchangeEOA(address indexed previousOwner, address indexed newOwner);

    //---------------------==
    constructor (address _owner, address[2] _platformReps, address[3] _endorsers) public {
        //if (_owners[i] == 0 || isInGroup[_owners[i]]) require(false, "constructor");
        if (
            owner == address(0) || platformReps[0] == address(0) || platformReps[1] == address(0) || endorsers[0] == address(0) || endorsers[1] == address(0) || endorsers[2] == address(0)) {
            require(false, "input addresses have address(0) within");
        }

        owner = _owner;
        isInGroup[owner] = true;
        require(_platformReps.length > 1, "_platformReps has >1 account");
        platformReps = _platformReps;
        isInGroup[platformReps[0]] = true;
        isInGroup[platformReps[1]] = true;
        require(_endorsers.length > 2, "_endorsers has > 2 acounts");
        endorsers = _endorsers;
        isInGroup[endorsers[0]] = true;
        isInGroup[endorsers[1]] = true;
        isInGroup[endorsers[2]] = true;
    }

    //-----------------------==
    //-----------------------==
    function addProposal(uint _funcNum, address _addr)
        public isInTheGroup(msg.sender)
        returns (uint ProposalId)
    {
        ProposalId = _addProposal(_funcNum, _addr);
        voteOnProposal(ProposalId, true);
    }

    function _addProposal(uint _funcNum, address _addr)
        internal
        returns (uint ProposalId)
    {
        ProposalId = ProposalCount;
        Proposals[ProposalId] = Proposal({
            funcNum: _funcNum,
            addr: _addr,
            isExecuted: false
        });
        ProposalCount += 1;
        emit Submission(ProposalId);
    }

    function voteOnProposal(uint ProposalId, bool boolValue) public
        isInTheGroup(msg.sender) {
        voteResults[ProposalId][msg.sender] = boolValue;
        emit Confirmation(msg.sender, ProposalId);
        //executeProposal(ProposalId);
    }
    // mapping (uint => Proposal) public Proposals;
    // mapping (uint => mapping (address => bool)) public voteResults;

    function checkVotesNoOwner(uint ProposalId) public view returns (bool) {
        //if (voteResults[ProposalId][owner)
        if (voteResults[ProposalId][platformReps[0]] || voteResults[ProposalId][platformReps[1]]) {
            if (voteResults[ProposalId][endorsers[0]] || voteResults[ProposalId][endorsers[1]] || voteResults[ProposalId][endorsers[2]]) {
                return true;
            } else {return false;}
        } else {return false;}
    }

    function checkVotesNoPlatformRep(uint ProposalId) public view returns (bool) {
        //if (voteResults[ProposalId][owner)
        if (voteResults[ProposalId][owner]) {
            if (voteResults[ProposalId][endorsers[0]] || voteResults[ProposalId][endorsers[1]] || voteResults[ProposalId][endorsers[2]]) {
                return true;
            } else {return false;}
        } else {return false;}
    }
//[owner, platformReps[0], platformReps[1], endorsers[0], endorsers[1], endorsers[2]];


    function getTheGroup() public view returns (address[]) {
        return [owner, platformReps[0], platformReps[1], endorsers[0], endorsers[1], endorsers[2]];
    }

    function executeProposal(uint ProposalId)
        external nonReentrant
        notExecuted(ProposalId) returns (bool)
    {
        Proposal memory txn = Proposals[ProposalId];
        bool voteResult, txnResult;
        if (txn.funcNum == 0) {//
            txnResult = true;
        } else if (txn.funcNum == 9) {//
            txnResult = true;
        //nodata == 0x6e6f64617461 in hexdecimal, "0xabcdef"
        } else if (txn.funcNum == 1) {//change owner address
            voteResult = checkVotesNoOwner(ProposalId);
            if (voteResult) {
                owner = txn.addr;
                txnResult = true;
            }
        } else if (txn.funcNum == 2) {//change platformReps[0]
//[owner, platformReps[0], platformReps[1], endorsers[0], endorsers[1], endorsers[2]];
            platformReps[0] = txn.addr;
            txnResult = true;
        } else if (txn.funcNum == 3) {//change platformReps[1]
            platformReps[1] = txn.addr;
            txnResult = true;
        } else if (txn.funcNum == 4) {//change endorsersReps[0]
            endorsers[0] = txn.addr;
            txnResult = true;
        } else if (txn.funcNum == 5) {//change endorsersReps[1]
            endorsers[1] = txn.addr;
            txnResult = true;
        } else if (txn.funcNum == 6) {//change endorsersReps[2]
            endorsers[2] = txn.addr;
            txnResult = true;
        }

            require(destinationAddr != address(0), "destination cannot be Null");

            if (txnResult == true) {
                Proposals[ProposalId].isExecuted = true;//txn.executed = true;
                emit Execution(ProposalId);
                return true;

            } else {
                emit ExecutionFailure(ProposalId);
                return false;
            }

        } else {return false;}
    }
    // /// @dev Allows anyone to execute a votedYes Proposal.
    // /// @param ProposalId Proposal ID.
    // function executeProposal(uint ProposalId)
    //     public
    //     notExecuted(ProposalId)
    // {
    //     if (checkVotesNoOwner(ProposalId)) {
    //         Proposal memory txn = Proposals[ProposalId];
    //         txn.executed = true;
    //         if (txn.destination.call.value(txn.value)(txn.data))
    //             emit Execution(ProposalId);
    //         else {
    //             emit ExecutionFailure(ProposalId);
    //             Proposals[ProposalId].executed = false;
    //         }
    //     }
    // }



    modifier addrDoesNotExist(address addr) {
        require(!isInGroup[addr],"addrDoesNotExist");
        _;
    }

    modifier isInTheGroup(address addr) {
        require(isInGroup[addr],"isInTheGroup");
        _;
    }
    modifier onlyInTheGroup() {
        require(isInGroup[msg.sender], "msg.sender is not in the Group");
        _;
    }
    modifier votedYes(uint ProposalId, address addr) {
        require(voteResults[ProposalId][addr], "voted yes");
        _;
    }
    modifier votedNo(uint ProposalId, address addr) {
        require(!voteResults[ProposalId][addr], "voted no");
        _;
    }
    modifier notExecuted(uint ProposalId) {
        require(!Proposals[ProposalId].isExecuted, "proposal has been executed");
        _;
    }
    modifier notNull(address _address) {
        require(_address != address(0), "address should not be null");
        _;
    }

    //--------------------==OpenZeppelin
    bool private rentrancy_lock = false;
    /**
    * @dev Prevents a contract from calling itself, directly or indirectly.
    * @notice If you mark a function `nonReentrant`, you should also
    * mark it `external`. Calling one nonReentrant function from
    * another is not supported. Instead, you can implement a
    * `private` function doing the actual work, and a `external`
    * wrapper marked as `nonReentrant`.
    */
    modifier nonReentrant() {
        require(!rentrancy_lock, "reentry is not allowed");
        rentrancy_lock = true;
        _;
        rentrancy_lock = false;
    }


    //--------------------==
    function addNewAddr(address _addr) external {
        if (msg.sender == owner) {
            ownerN = _addr;
        } else if (msg.sender == platformReps[0]) {
            platformRepsN[0] = _addr;
        } else if (msg.sender == platformReps[0]) {
            platformRepsN[0] = _addr;
        } else if (msg.sender == endorsers[0]) {
            endorsersN[0] = _addr;
        } else if (msg.sender == endorsers[1]) {
            endorsersN[1] = _addr;
        } else if (msg.sender == endorsers[2]) {
            endorsersN[2] = _addr;
        } else {
            require(false, "only restricted personnel can call this function");
        }
    }

    function changeAddr() external {
        if (msg.sender == ownerN) {
            emit eventchangeEOA(owner, ownerN);
            owner = ownerN;
        } else if (msg.sender == platformRepsN[0]) {
            emit eventchangeEOA(platformReps[0], platformRepsN[0]);
            platformReps[0] = platformRepsN[0];
        } else if (msg.sender == platformRepsN[0]) {
            emit eventchangeEOA(platformReps[0], platformRepsN[0]);
            platformReps[0] = platformRepsN[0];
        } else if (msg.sender == endorsersN[0]) {
            emit eventchangeEOA(endorsers[0], endorsersN[0]);
            endorsers[0] = endorsersN[0];
        } else if (msg.sender == endorsersN[1]) {
            emit eventchangeEOA(endorsers[1], endorsersN[1]);
            endorsers[1] = endorsersN[1];
        } else if (msg.sender == endorsersN[2]) {
            emit eventchangeEOA(endorsers[2], endorsersN[2]);
            endorsers[2] = endorsersN[2];
        } else {
            require(false, "only restricted personnel can call this function");
        }
    }

    //-------------------------==
    //-------------------------==
    function readTestNewAddress() external returns (uint) {
        if (msg.sender == owner) {
            return 5;
        } else if (msg.sender == platformReps[0]) {
            return 10;
        } else if (msg.sender == platformReps[0]) {
            return 20;
        } else if (msg.sender == endorsers[0]) {
            return 30;
        } else if (msg.sender == endorsers[1]) {
            return 40;
        } else if (msg.sender == endorsers[2]) {
            return 50;
        } else {
            return 1;
        }
    }

    function writeTestNewAddress() external {
        if (msg.sender == owner) {
            testCount += 5;
        } else if (msg.sender == platformReps[0]) {
            testCount += 10;
        } else if (msg.sender == platformReps[0]) {
            testCount += 20;
        } else if (msg.sender == endorsers[0]) {
            testCount += 30;
        } else if (msg.sender == endorsers[1]) {
            testCount += 40;
        } else if (msg.sender == endorsers[2]) {
            testCount += 50;
        } else {
            testCount += 1;
        }
    }
}

    // function addOwner(address addr)
    //     internal
    //     addrDoesNotExist(addr)
    //     notNull(addr)
    //     returns (bool)
    // {
    //     isInGroup[addr] = true;
    //     theGroup.push(addr);
    //     emit OwnerAddition(addr);
    //     return true;
    // }

    // function removeOwner(address addr)
    //     internal isInTheGroup(addr) returns (bool)
    // {
    //     isInGroup[addr] = false;
    //     for (uint i = 0; i < owners.length - 1; i++)
    //         if (owners[i] == addr) {
    //             owners[i] = owners[owners.length - 1];
    //             break;
    //         }
    //     owners.length -= 1;
    //     if (required > owners.length)
    //         changeRequirement(owners.length);
    //     emit OwnerRemoval(addr);
    //     return true;
    // }

    //     function replaceOwner(address addr, address newOwner)
    //     internal isInTheGroup(addr)
    //     addrDoesNotExist(newOwner)
    //     notNull(newOwner) returns (bool)
    // {
    //     for (uint i = 0; i < owners.length; i++)
    //         if (owners[i] == addr) {
    //             owners[i] = newOwner;
    //             break;
    //         }
    //     isInGroup[addr] = false;
    //     isInGroup[newOwner] = true;
    //     emit OwnerRemoval(addr);
    //     emit OwnerAddition(newOwner);
    //     return true;
    // }