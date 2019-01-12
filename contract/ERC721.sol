pragma solidity ^0.4.25;


contract ERC721{
    
    struct token{
        address owner;
        string tokenSymbol;
        uint tokenAmount;
    }
    
    mapping (address => token) tokens;
    
    
    function addTokenOwner(address _owneraddr) external{
        tokens[_owneraddr].owner = _owneraddr;
        tokens[_owneraddr].tokenSymbol = "NCCU";
        tokens[_owneraddr].tokenAmount = 12345;
    }
    
    function getTokenSymbol(address _owneraddr)  external view returns (string){
        return tokens[_owneraddr].tokenSymbol;
    }
    
    function getBalance(address _owneraddr) external view returns(uint){
         return tokens[_owneraddr].tokenAmount;
    }
    
}