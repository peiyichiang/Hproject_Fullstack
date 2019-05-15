pragma solidity ^0.5.4;

interface HeliumITF{
    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor);
}

contract TokenController {
    // 201902180900, 201902180901, 201902180902, 201902180907
    uint public TimeAtDeployment;// Token Release date and time
    uint public TimeUnlock;//The time to unlock tokens from lock up period
    uint public TimeValid;// Token valid time or expiry time. e.g. 203903310000
    bool public isLockedForRelease;// true or false: check if the token is locked for release
    bool public isTokenApproved;// true or false: check if the token is active
    address public addrHelium;

    // check if the tokenState is in one of the following states: inInitialLockUpPeriod, normal, or expired
    enum TokenState{inInitialLockUpPeriod, normal, expired}
    TokenState public tokenState;

    // 201902190900, 201902190901, 201902190902, 201902191745
    constructor(uint _timeCurrent, 
      uint _TimeUnlock, uint _TimeValid, address _addrHelium) public {
        TimeAtDeployment = _timeCurrent;
        TimeUnlock = _TimeUnlock;
        TimeValid = _TimeValid;
        tokenState = TokenState.inInitialLockUpPeriod;
        isTokenApproved = true;
        addrHelium = _addrHelium;
    }

    modifier ckTime(uint _time) {
        require(_time > 201903070000, "_time is <= 201903070000 or not in the format of yyyymmddhhmm");
        _;
    }

    modifier onlyPlatformSupervisor() {
        require(HeliumITF(addrHelium).checkPlatformSupervisor(msg.sender), "only PlatformSupervisor is allowed to call this function");
        _;
    }
    function setAddrHelium(address _addrHelium) external onlyPlatformSupervisor{
        addrHelium = _addrHelium;
    }
    function checkPlatformSupervisor() external view returns (bool){
        return (HeliumITF(addrHelium).checkPlatformSupervisor(msg.sender));
    }
    // to check if the HCAT721 token is in good normal state, which is between the Lockup period end time and the invalid time, and isTokenApproved is to check if this token is still approved for trading
    function isTokenApprovedOperational() external view returns (bool){
        return (tokenState == TokenState.normal && isTokenApproved);
    }

    // to give variable values including TimeAtDeployment, TimeUnlock, TimeValid, isLockedForRelease
    function getHTokenControllerDetails() public view returns (
        uint TimeAtDeployment_, uint TimeUnlock_, uint TimeValid_, bool isLockedForRelease_, bool isTokenApproved_) {
          TimeAtDeployment_ = TimeAtDeployment;
          TimeUnlock_ = TimeUnlock;
          TimeValid_ = TimeValid;
          isLockedForRelease_ = isLockedForRelease;
          isTokenApproved_ = isTokenApproved;
    }

    // to update the tokenState to be one of the three states: inInitialLockUpPeriod, normal, expired
    function updateState(uint timeCurrent) external onlyPlatformSupervisor ckTime(timeCurrent){
        if(timeCurrent < TimeUnlock){
            tokenState = TokenState.inInitialLockUpPeriod;

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

    //To set TimeAtDeployment before isLockedForRelease becomes true
    // function setReleaseTime(uint _TimeAtDeployment) external onlyPlatformSupervisor ckTime(_TimeAtDeployment) ckLock {
    //     TimeAtDeployment = _TimeAtDeployment;
    // }

    modifier ckLock() {
        require(!isLockedForRelease, "only allowed before locked up");
        _;
    }

    //function() external payable { revert("should not send any ether directly"); }
}