pragma solidity >0.4.18;

import './Proxy.sol';
import './IRegistry.sol';
import './UpgradeabilityStorage.sol';

/**
 * @title UpgradeabilityProxy
 * @dev This contract represents a proxy where the implementation address to which it will delegate can be upgraded
 */
contract UpgradeabilityProxy is Proxy, UpgradeabilityStorage {

  /**
  * @dev Constructor function
  */
  constructor(string memory _version) public {
    registry = IRegistry(msg.sender);
    upgradeTo(_version);
  }

  /**
  * @dev Upgrades the implementation to the requested version
  * @param _version representing the version name of the new implementation to be set
  */
  function upgradeTo(string memory _version) public {
    _implementation = registry.getVersion(_version);
  }
  
  function getAddress() public view returns (address){
    return address(this);
  }
}
