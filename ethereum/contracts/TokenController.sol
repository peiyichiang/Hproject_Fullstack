pragma solidity ^0.5.4;

interface Helium_Interface_TCC{
    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor);
}

contract TokenController {
    using AddressUtils for address;

    // 201902180900, 201902180901, 201902180902, 201902180907
    uint public TimeOfDeployment;// Time At Deployment
    uint public TimeUnlock;//The time to unlock tokens from lock up period
    uint public TimeValid;// Token valid time or expiry time. e.g. 203903310000
    bool public isLockedForRelease;// true or false: check if the token is locked for release
    bool public isTokenApproved;// true or false: check if the token is active
    address public addrHelium;

    // check if the tokenState is in one of the following states: lockup, normal, or expired
    enum TokenState{lockup, normal, expired}
    TokenState public tokenState;

    // 201902190900, 201902190901, 201902190902, 201902191745
    constructor(uint _TimeOfDeployment,
      uint _TimeUnlock, uint _TimeValid, address _addrHelium) public {
        TimeOfDeployment = _TimeOfDeployment;
        TimeUnlock = _TimeUnlock;
        TimeValid = _TimeValid;
        tokenState = TokenState.lockup;
        isTokenApproved = true;
        addrHelium = _addrHelium;
    }
    function checkDeploymentConditions(
        uint _TimeOfDeployment, uint _TimeUnlock,
        uint _TimeValid, address _addrHelium

      ) public view returns(bool[] memory boolArray) {
        boolArray = new bool[](4);
        boolArray[0] = _TimeOfDeployment > 201905281400;
        boolArray[1] = _TimeUnlock > _TimeOfDeployment;
        boolArray[2] = _TimeValid > _TimeUnlock;
        boolArray[3] = _addrHelium.isContract();
    }
    // to give variable values including TimeOfDeployment, TimeUnlock, TimeValid, isLockedForRelease
    function getHTokenControllerDetails() public view returns (
        uint TimeOfDeployment_, uint TimeUnlock_, uint TimeValid_, bool isLockedForRelease_, bool isTokenApproved_) {
        TimeOfDeployment_ = TimeOfDeployment;
        TimeUnlock_ = TimeUnlock;
        TimeValid_ = TimeValid;
        isLockedForRelease_ = isLockedForRelease;
        isTokenApproved_ = isTokenApproved;
    }

    modifier ckTime(uint _time) {
        require(_time > TimeOfDeployment, "_time should be > TimeOfDeployment or not in the format of yyyymmddhhmm");
        _;
    }

    modifier onlyPlatformSupervisor() {
        require(Helium_Interface_TCC(addrHelium).checkPlatformSupervisor(msg.sender), "only PlatformSupervisor is allowed to call this function");
        _;
    }
    function setAddrHelium(address _addrHelium) external onlyPlatformSupervisor{
        addrHelium = _addrHelium;
    }
    function checkPlatformSupervisorFromTCC() external view returns (bool){
        return (Helium_Interface_TCC(addrHelium).checkPlatformSupervisor(msg.sender));
    }
    // to check if the HCAT721 token is in good normal state, which is between the Lockup period end time and the invalid time, and isTokenApproved is to check if this token is still approved for trading
    function isTokenApprovedOperational() external view returns (bool){
        return (tokenState == TokenState.normal && isTokenApproved);
    }


    // to update the tokenState to be one of the three states: lockup, normal, expired
    function updateState(uint timeCurrent) external onlyPlatformSupervisor ckTime(timeCurrent){
        if(timeCurrent < TimeUnlock){
            tokenState = TokenState.lockup;

        } else if(timeCurrent >= TimeUnlock && timeCurrent < TimeValid){
            tokenState = TokenState.normal;

        } else {//timeCurrent >= TimeValid
            tokenState = TokenState.expired;
        }
    }

    //To extend validTime value
    function setTimeValid(uint _TimeValid) external onlyPlatformSupervisor ckTime(_TimeValid) {
        TimeValid = _TimeValid;
    }
    //To set the value of isTokenApproved variable before isLockedForRelease becomes true
    function tokenApprove(bool _isTokenApproved) external onlyPlatformSupervisor {
        isTokenApproved = _isTokenApproved;
    }

    //---------------------==subject to variable lockup
    //To set timeUnlock value before isLockedForRelease becomes true
    function setTimeUnlock(uint _TimeUnlock) external onlyPlatformSupervisor ckTime(_TimeUnlock) ckLock {
        TimeUnlock = _TimeUnlock;
    }

    //To lock the above variable values so no further variable value change is possible
    function lockForTokenRelease() external onlyPlatformSupervisor ckLock {
        isLockedForRelease = true;
    }

    //To set TimeOfDeployment before isLockedForRelease becomes true
    // function setReleaseTime(uint _TimeOfDeployment) external onlyPlatformSupervisor ckTime(_TimeOfDeployment) ckLock {
    //     TimeOfDeployment = _TimeOfDeployment;
    // }

    modifier ckLock() {
        require(!isLockedForRelease, "only allowed before locked up");
        _;
    }

    //function() external payable { revert("should not send any ether directly"); }
}
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) } // solium-disable-line security/no-inline-assembly
        return size > 0;
    }
}