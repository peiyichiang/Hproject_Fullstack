pragma solidity ^0.5.1;
contract eDocumentVerification {
  // 通過文件的Hash值 對應到 是否存在
  mapping (string => bool) private hashTable;
  function sethashTable(string memory _Hash) public{
      hashTable[_Hash]= true;
  }
  //通過Hash值查看是否有存在鏈上
  function searchHash(string memory _Hash) public view returns(bool) {
     return hashTable[_Hash];
  }
  function test() public pure returns(string memory str1){
      str1= "123";
  }
}