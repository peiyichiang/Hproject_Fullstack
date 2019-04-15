pragma solidity ^0.5.1;

interface Registry {
    function addUser(string calldata _uid, address _assetCtAddr, address _extoAddr) external;
    function setUser(string calldata _uid, address _assetCtAddr, address _extoAddr, uint _status) external;
    function setAssetCtAddr(string calldata _uid, address _assetCtAddr) external;
    function setExtoAddr(string calldata _uid, address _extoAddr) external;
    function setUserStatus(string calldata _uid, uint _status) external;
}

interface AssetBook {
    function platformVote() external;
    function addAsset(address _assetAddr, string calldata _symbol, uint _balance) external;
    function changeAssetOwner(address _assetOwnerNew) external;
    function updateAsset(address _assetAddr) external;
    function deleteAsset(address _assetAddr) external;
}

interface ProductManager {
    function addNewCtrtGroup(address _addrCrowdFundingCtrt, address _addrControllerCtrt, address _addrTokenCtrt, address _addrIncomeManagementCtrt)external;
}

interface CrowdFunding {
    function updateState(uint _serverTime) external;
    function makeFundingActive(uint _serverTime) external;
    function pauseFunding(uint _serverTime) external;
    function resumeFunding(uint _CFED2, uint _quantityMax, uint _serverTime) external;
    function Abort(string calldata _reason, uint _serverTime) external;
    function invest(address _assetbook, uint _quantityToInvest, uint _serverTime) external;
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
    
    constructor(address _registry, address _productmanager) public{
        PlatformAdmin = msg.sender;
        registry = Registry(_registry);
        productmanager = ProductManager(_productmanager);
    }
    
    //Helium
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
    
    //registry
    function helium_addUser(string memory _uid, address _assetCtAddr, address _extoAddr) public onlyCustomerService {
        registry.addUser(_uid, _assetCtAddr, _extoAddr);
    }

    function helium_setUser(string memory _uid, address _assetCtAddr, address _extoAddr, uint _status) public onlyCustomerService {
        registry.setUser(_uid, _assetCtAddr, _extoAddr, _status);
    }

    function helium_setAssetCtAddr(string memory _uid, address _assetCtAddr) public onlyCustomerService {
        registry.setAssetCtAddr(_uid, _assetCtAddr);
    }

    function helium_setExtoAddr(string memory _uid, address _extoAddr) public onlyCustomerService {
        registry.setExtoAddr(_uid, _extoAddr);
    }
    function helium_setUserStatus(string memory _uid, uint _status, uint _timeCurrent) public onlyCustomerService {
        registry.setUserStatus(_uid, _status);
    }

    //Assetbook 
    function helium_platformVote(address _AssetBookAddr) public {
        assetbook = AssetBook(_AssetBookAddr);
        assetbook.platformVote();
    }
    function helium_addAsset(address _AssetBookAddr, address _assetAddr, string memory _symbol, uint _balance) public {
        assetbook = AssetBook(_AssetBookAddr);
        assetbook.addAsset(_assetAddr, _symbol, _balance);
    }
    function helium_changeAssetOwner(address _AssetBookAddr, address _assetOwnerNew) public {
        assetbook = AssetBook(_AssetBookAddr);
        assetbook.changeAssetOwner(_assetOwnerNew);
    }
    function helium_updateAsset(address _AssetBookAddr, address _assetAddr) public {
        assetbook = AssetBook(_AssetBookAddr);

    }
    function helium_deleteAsset(address _AssetBookAddr, address _assetAddr) public {
        assetbook = AssetBook(_AssetBookAddr);

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