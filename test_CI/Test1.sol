pragma solidity ^0.5.4;

contract Test1 {
    address public assetOwner;
    uint public userCount;

    struct eachAccount {
        uint count;
        bool bValue;
    }
    mapping(address => eachAccount) public accounts;

    constructor() public {
        assetOwner = msg.sender;
    }

    function checkAssetOwner() public view returns (bool){
        return (msg.sender == assetOwner);
    }

    function addUser(address _user) external {
        require(msg.sender == _user, "only user himself can add");
        accounts[_user].count = accounts[_user].count + 1;
        accounts[_user].bValue = true;
    }

}