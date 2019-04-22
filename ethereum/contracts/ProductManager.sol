pragma solidity ^0.5.4;
/*
deploy parameters: none
*/
import "./Ownable.sol";
import "./SafeMath.sol";

contract ProductManager is Ownable {
    using SafeMath for uint256;

    uint public groupCindex;
    mapping(bytes32 => CtrtGroup) public symbolToCtrtGroup;
    mapping(uint => bytes32) public idxToSymbol;

    struct CtrtGroup {
        uint index;
        address CrowdFundingCtrt;
        address TokenControllerCtrt;
        address TokenCtrt;
        address IncomeManagerCtrt;
    }
    constructor(address[] memory management) public {
        require(management.length > 4, "management.length should be > 4");
        owner = management[4];
        chairman = management[3];
        director = management[2];
        manager = management[1];
        admin = management[0];
    }

    function addNewCtrtGroup(bytes32 symbol,
        address addrCrowdFundingCtrt, address addrTokenControllerCtrt,
        address addrTokenCtrt, address addrIncomeManagerCtrt)
        external onlyAdmin {
        groupCindex = groupCindex.add(1);
        idxToSymbol[groupCindex] = symbol;
        symbolToCtrtGroup[symbol] = CtrtGroup(groupCindex, addrCrowdFundingCtrt, addrTokenControllerCtrt, addrTokenCtrt, addrIncomeManagerCtrt);
    }

    function getCtrtGroup(bytes32 symbol) view external returns(uint groupIndex, address addrCrowdFundingCtrt, address addrTokenControllerCtrt, address addrTokenCtrt, address addrIncomeManagerCtrt){
        CtrtGroup memory ctrtGroup = symbolToCtrtGroup[symbol];
        return (ctrtGroup.index, ctrtGroup.CrowdFundingCtrt, ctrtGroup.TokenControllerCtrt, ctrtGroup.TokenCtrt, ctrtGroup.IncomeManagerCtrt);
    }

    function() external payable { revert("should not send any ether directly"); }

}