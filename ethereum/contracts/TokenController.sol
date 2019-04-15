pragma solidity ^0.5.4;

import "./Ownable.sol";

contract TokenController is Ownable {
    // 201902180900, 201902180901, 201902180902, 201902180907
    uint public TimeRelease;// Token Release date and time
    uint public TimeUnlock;//The time to unlock tokens from lock up period
    uint public TimeValid;// Token valid time or expiry time. e.g. 203903310000
    bool public isLockedForRelease;// true or false: check if the token is locked for release
    bool public isActive;// true or false: check if the token is active

    // check if the tokenState is in one of the following states: underLockupPeriod, operational, or expired
    enum TokenState{underLockupPeriod, operational, expired}
    TokenState public tokenState;

    // 201902190900, 201902190901, 201902190902, 201902191745
    constructor(uint _TimeRelease, 
      uint _TimeUnlock, uint _TimeValid,
      address[] memory management) public {
        TimeRelease = _TimeRelease;
        TimeUnlock = _TimeUnlock;
        TimeValid = _TimeValid;
        tokenState = TokenState.underLockupPeriod;
        isActive = true;
        require(management.length > 4, "management.length should be > 4");
        owner = management[4];
        chairman = management[3];
        director = management[2];
        manager = management[1];
        admin = management[0];
    }

    modifier ckLock() {
        require(!isLockedForRelease, "only allowed before locked up");
        _;
    }
    modifier ckTime(uint _time) {
        require(_time > 201903070000, "_time is <= 201903070000 or not in the format of yyyymmddhhmm");
        _;
    }

    // to check if the HCAT721 token is in good operational state, which is between the Lockup period end time and the invalid time
    function isActiveOperational() external view returns (bool){
        return (tokenState == TokenState.operational && isActive);
    }

    // to give variable values including TimeRelease, TimeUnlock, TimeValid, isLockedForRelease
    function getHTokenControllerDetails() public view returns (
        uint TimeRelease_, uint TimeUnlock_, uint TimeValid_, bool isLockedForRelease_) {
          TimeRelease_ = TimeRelease;
          TimeUnlock_ = TimeUnlock;
          TimeValid_ = TimeValid;
          isLockedForRelease_ = isLockedForRelease;
    }

    // to update the tokenState to be one of the three states: underLockupPeriod, operational, expired
    function updateState(uint timeCurrent) external onlyAdmin ckTime(timeCurrent){
        if(timeCurrent < TimeUnlock){
            tokenState = TokenState.underLockupPeriod;

        } else if(timeCurrent > TimeUnlock && timeCurrent < TimeValid && isActive){
            tokenState = TokenState.operational;

        } else if(timeCurrent > TimeValid){
            tokenState = TokenState.expired;
        }       
    }

    //To set the value of IsActive variable before isLockedForRelease becomes true
    function setIsActive(bool _isActive) external onlyAdmin ckLock {
        isActive = _isActive;
    }

    //To set validTime value before isLockedForRelease becomes true
    function setTimeValid(uint _TimeValid) external onlyAdmin ckTime(_TimeValid) ckLock {
        TimeValid = _TimeValid;
    }

    //To set timeUnlock value before isLockedForRelease becomes true
    function setTimeUnlock(uint _TimeUnlock) external onlyAdmin ckTime(_TimeUnlock) ckLock {
        TimeUnlock = _TimeUnlock;
    }

    //To set timeRelease before isLockedForRelease becomes true
    function setReleaseTime(uint _TimeRelease) external onlyAdmin ckTime(_TimeRelease) ckLock {
        TimeRelease = _TimeRelease;
    }

    //To lock the above variable values so no further variable value change is possible
    function lockForTokenRelease() external onlyAdmin ckLock {
        isLockedForRelease = true;
    }

    function() external payable { revert("should not send any ether directly"); }
}