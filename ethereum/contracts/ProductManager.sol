pragma solidity ^0.5.4;
/*
deploy parameters: none
*/
import "./Ownable.sol";
import "./SafeMath.sol";

contract ProductManager is Ownable {
    using SafeMath for uint256;

    uint public pairId;
    mapping(uint256 => CtrtGroup) public idToCtrtGroup;//ID to contract pair

    struct CtrtGroup {
        address addrCrowdFundingCtrt;
        address addrControllerCtrt;
        address addrTokenCtrt;
        address addrIncomeManagementCtrt;
    }
    constructor(address[] memory management) public {
        require(management.length > 4, "management.length should be > 4");
        owner = management[4];
        chairman = management[3];
        director = management[2];
        manager = management[1];
        admin = management[0];
    }
    function addNewCtrtGroup(
        address _addrCrowdFundingCtrt, address _addrControllerCtrt,
        address _addrTokenCtrt, address _addrIncomeManagementCtrt)
        external onlyAdmin {
        pairId = pairId.add(1);
        idToCtrtGroup[pairId] = CtrtGroup(_addrCrowdFundingCtrt, _addrControllerCtrt, _addrTokenCtrt, _addrIncomeManagementCtrt);
    }

    function() external payable { revert("should not send any ether directly"); }

}