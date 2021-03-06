pragma solidity >0.4.18;

import './IRegistry.sol';
import './Upgradeable.sol';
import './UpgradeabilityProxy.sol';

/**
 * @title RegistryProxy
 * @dev This contract works as a registry of versions, it holds the implementations for the registered versions.
 */
contract RegistryProxy is IRegistry {
  // Mapping of versions to implementations of different functions
  mapping (string => address) internal versions;

  /**
  * @dev Registers a new version with its implementation address
  * @param version representing the version name of the new implementation to be registered
  * @param implementation representing the address of the new implementation to be registered
  */
  function addVersion(string memory version, address implementation) public {
    require(versions[version] == address(0));
    versions[version] = implementation;
    emit VersionAdded(version, implementation);
  }

  /**
  * @dev Tells the address of the implementation for a given version
  * @param version to query the implementation of
  * @return address of the implementation registered for the given version
  */
  function getVersion(string memory version) public view returns (address) {
    return versions[version];
  }

  /**
  * @dev Creates an upgradeable proxy
  * @param version representing the first version to be set for the proxy
  * @return address of the new proxy created
  */
  function createProxy(string memory version) public payable returns (UpgradeabilityProxy) {
    UpgradeabilityProxy proxy = new UpgradeabilityProxy(version);
    Upgradeable(proxy.getAddress()).initialize(msg.sender);
    emit ProxyCreated(proxy.getAddress());
    return proxy;
  }
}
