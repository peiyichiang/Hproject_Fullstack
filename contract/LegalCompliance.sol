pragma solidity ^0.5.3;
//pragma experimental ABIEncoderV2;
import "./Ownable.sol";
import "./SafeMath.sol";

contract Htoken {
    function getTokenOwners(uint idStart, uint idCount) external returns(address[] memory) {}
}
/**
# A whitelist could be implemented to ensure that both sender and receiver have been cleared to transact. 
# Certain addresses could be blacklisted⁹.

# Transfers of over / under certain amounts could be prohibited.
  //Partial token transfers could be restricted.
*/
contract LegalCompliance is Ownable {
    using SafeMath for uint256;
    address public registryCtrtAddr;//both whitelist and blacklist
    //2 letters for country + 身分證字號, SSN, SIN, ...
    uint public amountLegalMax;
    uint public amountLegalMin;

    constructor(
        address _tokenCtrtAddr, address _registryCtrtAddr, address _platformCtrtAddr,
        uint _amountLegalMax, uint _amountLegalMin
        ) public {

        RegistryCtrt registryCtrt = RegistryCtrt(_registryCtrtAddr);
        tokenCtrt = _tokenCtrtAddr;
        platformCtrt = _platformCtrt;
        amountLegalMax = _amountLegalMax;
        amountLegalMin = _amountLegalMin;
    }

    /*
    */
    function isUserApproved(string _udx) public view returns (bool) {
        if(registryCtrt.users[_udx].accountStatus == 0) {
            return true;
        } else {return false;}
    }


    function isUnderCompliance(string _udxTo, string _udxFrom, uint _amount) external returns (bool) {
        //require(msg.sender == tokenCtrt, "msg.sender is not tokenCtrt");
        if(isUserApproved(_udxTo) && isUserApproved(_udxFrom) && amountLegalMin <= _amount && _amount <= amountLegalMax) {
            return true;
        } else {
            return false;
        }
    }
    /**
     */
}
