
            //require(indexStart.add(amount).sub(1) <= tokenId, "indexStart or amount is too big");

    //-----------------------==Mint
    // function mintSerialNFTBatch(address[] calldata _tos, uint amount) external {
    //     for(uint i=0; i < _tos.length; i = i.add(1)) {
    //         for(uint j=0; j < amount; j.add(1)) {
    //             mintSerialNFT(_tos[i], amount);
    //         }
    //     }
    // }

    /*
    }
    struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => uint) allowed;
    }
    struct Asset { // idToAsset[tokenId]
        address owner;
        address approvedAddr;

        accounts[_to].indexToId[i] = tokenId;
        accounts[_to].idxEnd = idxEndReq;

    canTransfer()
        require(
            tokenOwner == msg.sender || idToAsset[tokenId_].approvedAddr == msg.sender || accounts[tokenOwner].allowed[msg.sender] > amount, "msg.sender should be tokenOwner, an approved, or a token operator");

      validToken()
        require(idToAsset[tokenId_].owner != address(0), "owner should not be 0x0");
    */


    // function setApprovalForAll(address _operator, bool isApproved) 
    //     external {
    //     require(_operator != address(0), "_operator should not be 0x0");
    //     accounts[msg.sender].operators[_operator] = isApproved;
    //     emit ApprovalForAll(msg.sender, _operator, isApproved);
    // }
    // function isApprovedForAll(address user, address _operator) 
    //     external view returns (bool) {
    //     require(user != address(0), "user should not be 0x0");
    //     require(_operator != address(0), "_operator should not be 0x0");
    //     return accounts[user].operators[_operator];
    // }

    // function approve(address approvedUser, uint256 _tokenId) external {//payable
    //     //require(approvedUser != address(0), "approvedUser should not be 0x0");
    //     require(_tokenId > 0, "_tokenId should > 0");

    //     address tokenOwner = idToAsset[_tokenId].owner;//canOperate(_tokenId)
    //     require(tokenOwner != address(0), "owner should not be 0x0");//validNFToken(_tokenId)
    //     require(
    //         tokenOwner == msg.sender || accounts[tokenOwner].operators[msg.sender],
    //         "msg.sender should be either tokenOwner or an approved operator");

    //     require(approvedUser != tokenOwner, "approvedUser should not be tokenOwner");
    //     //require(idToAsset[_tokenId].approvedAddr == address(0), "approved address should be 0x0 OR should be cleared of approval first");

    //     idToAsset[_tokenId].approvedAddr = approvedUser;
    //     emit Approval(tokenOwner, approvedUser, _tokenId);
    // }


    //-------------------------------==
    // function safeTransferFrom(
    //     address _from, address _to, uint256 _tokenId, bytes calldata _data) 
    //     external {
    //     _safeTransferFrom(_from, _to, _tokenId, _data);
    // }
    // function safeTransferFrom(address _from, address _to, uint256 _tokenId) external {
    //     _safeTransferFrom(_from, _to, _tokenId, "");
    // }
    // function transferFrom(address _from, address _to, uint256 _tokenId) external {
    //     _safeTransferFrom(_from, _to, _tokenId, "");
    // }

    // function _safeTransferFrom(
    //     address _from, address _to, uint256 _tokenId, bytes memory _data)
    //     internal canTransfer(_tokenId) validNFToken(_tokenId) {

    //     address tokenOwner = idToAsset[_tokenId].owner;
    //     require(tokenOwner == _from, "tokenOwner should be _from");
    //     require(_to != address(0), "_to should not be 0x0");

    //     if (_to.isContract()) {
    //         bytes4 retval = ERC721TokenReceiverITF(_to).onERC721Received(
    //             msg.sender, _from, _tokenId, _data);
    //         require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
    //     }
    //     _transfer(_to, _tokenId);
    // }
    /*canTransfer()
        require(
            tokenOwner == msg.sender || idToAsset[_tokenId].approvedAddr == msg.sender || accounts[tokenOwner].operators[msg.sender], "msg.sender should be tokenOwner, an approved, or a token operator");

      validToken()
        require(idToAsset[_tokenId].owner != address(0), "owner should not be 0x0");
    */
    // function _transfer(address _to, uint256 _tokenId) private {
    //     address _from = idToAsset[_tokenId].owner;

    //     require(TokenControllerITF(addrTokenController).isUnlockedValid(),'token cannot be transferred due to either unlock period or after valid date');
    //     //Legal Compliance
    //     require(RegistryITF(addrRegistry).isAddrApproved(_to), "_to is not in compliance");
    //     require(RegistryITF(addrRegistry).isAddrApproved(_from), "_from is not in compliance");

    //     clearApproval(_tokenId);
    //     // removeNFToken(_from);
    //     // addNFToken(_to, _tokenId);
    //     emit Transfer(_from, _to, _tokenId);
    // }
    /*struct Account { // accounts[user]
        uint idxStart;// 0, 1, 2, ...
        uint idxEnd;
        mapping (uint => uint) indexToId;
        mapping (address => uint) allowed;
    }*/
    /*struct Asset { // idToAsset[tokenId]
        address owner;
        address approvedAddr;
    }*/




    // function burnNFT(address user, uint256 _tokenId) external onlyAdmin {
    //     delete idToAsset[_tokenId];
    //     _burn(user, _tokenId);
    //     totalSupply = totalSupply.sub(1);
    //     emit BurnNFT(user, _tokenId, msg.sender);
    // }

    // function _burn(address user, uint256 _tokenId) 
    //     internal validNFToken(_tokenId) {
    //     clearApproval(_tokenId);
    //     require(TokenControllerITF(addrTokenController).isAdmin(msg.sender), 'only H-Token admin can remove tokens');
    //         //only contract owner can destroy the token
    //     removeNFToken(user);
    //     emit Transfer(user, address(0), _tokenId);
    //     // if (bytes(idToUri[_tokenId]).length != address(0)) {
    //     //     delete idToUri[_tokenId];
    //     // }
    // }

    /**
$ Transfers may be initiated by:
The owner of an NFT, The approved address of an NFT, An authorized operator of an NFT
Additionally, an authorized operator may set the approved address for an NFT.

$ only allow two-step ERC-20 style transaction, require that transfer functions never throw, require all functions to return a boolean indicating the success of the operation.

$ The URI MAY be mutable (i.e. it changes from time to time).
*/

/**
    * 0x80ac58cd ===
    *   bytes4(keccak256('balanceOf(address)')) ^
    *   bytes4(keccak256('ownerOf(uint256)')) ^
    *   bytes4(keccak256('approve(address,uint256)')) ^
    *   bytes4(keccak256('getApproved(uint256)')) ^
    *   bytes4(keccak256('setApprovalForAll(address,bool)')) ^
    *   bytes4(keccak256('isApprovedForAll(address,address)')) ^
    *   bytes4(keccak256('transferFrom(address,address,uint256)')) ^
    *   bytes4(keccak256('safeTransferFrom(address,address,uint256)')) ^
    *   bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)'))

https://github.com/0xcert/ethereum-erc721/blob/master/LICENSE
0xcert/ethereum-erc721 is licensed under the MIT License
A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.
Permissions

yes for Commercial use, Modification, Distribution, Private use
no for Limitations including Liability, Warranty
=================
The MIT License

Copyright (c) 2017-2018 0xcert, d.o.o. https://0xcert.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

 */