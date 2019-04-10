pragma solidity ^0.5.1;

interface Registry {
    function addUser(string calldata uid, address assetCtAddr, address extoAddr, uint timeCurrent) external;
    function setUser(string calldata uid, address assetCtAddr, address extoAddr, uint status, uint timeCurrent) external;
    function setAssetCtAddr(string calldata uid, address assetCtAddr, uint timeCurrent) external;
    function setExtoAddr(string calldata uid, address extoAddr, uint timeCurrent) external;
    function setUserStatus(string calldata uid, uint status, uint timeCurrent) external;
}

interface AssetBook {
    function platformVote(uint _timeCurrent) external;
    function addAsset(address _assetAddr, string calldata symbol, uint balance) external;
    function changeAssetOwner(address _assetOwnerNew, uint256 _timeCurrent) external;
    function updateAsset(address _assetAddr) external;
    function deleteAsset(address _assetAddr) external;
}

interface ProductManager {
    function addNewCtrtGroup(address _addrCrowdFundingCtrt, address _addrControllerCtrt, address _addrTokenCtrt, address _addrIncomeManagementCtrt)external;
}

interface CrowdFunding {
    function makeFundingActive(uint serverTime) external;
    function pauseFunding(uint serverTime) external;
    function resumeFunding(uint _CFED2, uint _quantityMax, uint serverTime) external;
    function Abort(string calldata _reason, uint serverTime) external;
    function invest(address _assetbook, uint _quantityToInvest, uint serverTime) external;
}

interface TokenController {
    function setTimeValid(uint _TimeValid) external;
    function setTimeUnlock(uint _TimeUnlock) external;
    function setReleaseTime(uint _TimeRelease) external;
    function setIsActive(bool _isActive) external;
}

interface ERC721SPLC_HToken {
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function getAccountIds(address user, uint idxS, uint idxE) external;

    function approve(address _approved, uint256 _tokenId) external;
    function setApprovalForAll(address _operator, bool _approved) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);

    function nftName() external view returns (string memory _name);
    function nftSymbol() external view returns (string memory _symbol);
    function getTokenOwners(uint idStart, uint idCount) external view returns(address[] memory);
    function safeTransferFromBatch(address _from, address _to, uint amount, uint price, uint serverTime) external;

}

interface IncomeManager {
    function addSchedule(uint _payableDate, uint _payableAmount) external;
    function AddScheduleBatch(uint[] calldata _payableDates, uint[] calldata _payableAmounts) external;
    function editIncomeSchedule(uint _index, uint _payableDate, uint _payableAmount) external;
    function removeIncomeSchedule(uint _index, uint _payableDate) external;
    function setIsApproved(uint _index, uint _payableDate, bool boolValue) external;
    function setPaymentReleaseResults(uint _index, uint _paymentDate, uint _paymentAmount, uint8 _errorCode) external;
    function setErrResolution(uint _index, uint _paymentDate, bool boolValue) external;
}

contract Helium {
    
    address public PlatformAdmin;
    Registry public registry;
    ProductManager public productmanager;
    AssetBook public assetbook;
    CrowdFunding public crowdfunding;
    TokenController public tokencontroller;
    ERC721SPLC_HToken public HCAT721;
    IncomeManager public incomemanager;
    

    struct PermissionTable {
        address platformEOA;
        uint permission;
        bool status;
    }
    
    mapping(address => PermissionTable) public PermissionList;
    
    constructor(address _registry) public{
        PlatformAdmin = msg.sender;
        //registry = Registry(_registry);
        
        
    }
    
    function addCustomerService (address _eoa) public onlyAdmin {
        PermissionList[_eoa].platformEOA = _eoa;
        PermissionList[_eoa].permission = 1;
        PermissionList[_eoa].status = true;
    }
    
    function addPlatformSupervisor (address _eoa) public onlyAdmin {
        PermissionList[_eoa].platformEOA = _eoa;
        PermissionList[_eoa].permission = 2;
        PermissionList[_eoa].status = true;
    }
    
    function changePermissionToCS(address _eoa) public onlyAdmin {
        PermissionList[_eoa].permission = 1;
    }
    
    function changePermissionToPS(address _eoa) public onlyAdmin {
        PermissionList[_eoa].permission = 2;
    }
    
    function removePermission(address _eoa) public onlyAdmin{
        PermissionList[_eoa].status = false;
    }
    
    modifier onlyAdmin(){
        require(msg.sender==PlatformAdmin);
        _;
    }
    
    modifier onlyCustomerService(){
        require(msg.sender==PlatformAdmin||(PermissionList[msg.sender].permission == 1 && PermissionList[msg.sender].status == true));
        _;
    }
    
    modifier onlyPlatformSupervisor(){
        require(msg.sender==PlatformAdmin||(PermissionList[msg.sender].permission== 2 && PermissionList[msg.sender].status == true));
        _;
    }
}