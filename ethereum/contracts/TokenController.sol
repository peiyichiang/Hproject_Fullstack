pragma solidity ^0.5.4;

import "./Ownable.sol";

contract TokenController is Ownable {
    // 201902180900, 201902180901, 201902180902, 201902180907
    uint public TimeAtDeployment;// Token Release date and time
    uint public TimeUnlock;//The time to unlock tokens from lock up period
    uint public TimeValid;// Token valid time or expiry time. e.g. 203903310000
    bool public isLockedForRelease;// true or false: check if the token is locked for release
    bool public isTokenApproved;// true or false: check if the token is active

    // check if the tokenState is in one of the following states: lockupPeriod, operational, or expired
    enum TokenState{lockupPeriod, operational, expired}
    TokenState public tokenState;

    // 201902190900, 201902190901, 201902190902, 201902191745
    constructor(uint _timeCurrent, 
      uint _TimeUnlock, uint _TimeValid,
      address[] memory management) public {
        TimeAtDeployment = _timeCurrent;
        TimeUnlock = _TimeUnlock;
        TimeValid = _TimeValid;
        tokenState = TokenState.lockupPeriod;
        isTokenApproved = true;
        require(management.length > 4, "management.length should be > 4");
        owner = management[4];
        chairman = management[3];
        director = management[2];
        manager = management[1];
        admin = management[0];
    }

    modifier ckTime(uint _time) {
        require(_time > 201903070000, "_time is <= 201903070000 or not in the format of yyyymmddhhmm");
        _;
    }

    // to check if the HCAT721 token is in good operational state, which is between the Lockup period end time and the invalid time, and isTokenApproved is to check if this token is still approved for trading
    function isTokenApprovedOperational() external view returns (bool){
        return (tokenState == TokenState.operational && isTokenApproved);
    }

    // to give variable values including TimeAtDeployment, TimeUnlock, TimeValid, isLockedForRelease
    function getHTokenControllerDetails() public view returns (
        uint TimeAtDeployment_, uint TimeUnlock_, uint TimeValid_, bool isLockedForRelease_) {
          TimeAtDeployment_ = TimeAtDeployment;
          TimeUnlock_ = TimeUnlock;
          TimeValid_ = TimeValid;
          isLockedForRelease_ = isLockedForRelease;
    }

    // to update the tokenState to be one of the three states: lockupPeriod, operational, expired
    function updateState(uint timeCurrent) external onlyAdmin ckTime(timeCurrent){
        if(timeCurrent < TimeUnlock){
            tokenState = TokenState.lockupPeriod;

        } else if(timeCurrent >= TimeUnlock && timeCurrent < TimeValid){
            tokenState = TokenState.operational;

        } else {//timeCurrent >= TimeValid
            tokenState = TokenState.expired;
        }       
    }

    //To extend validTime value
    function setTimeValid(uint _TimeValid) external onlyAdmin ckTime(_TimeValid) {
        TimeValid = _TimeValid;
    }
    //To set the value of isTokenApproved variable before isLockedForRelease becomes true
    function tokenApprove(bool _isTokenApproved) external onlyAdmin {
        isTokenApproved = _isTokenApproved;
    }

    //---------------------==subject to variable lockup
    //To set timeUnlock value before isLockedForRelease becomes true
    function setTimeUnlock(uint _TimeUnlock) external onlyAdmin ckTime(_TimeUnlock) ckLock {
        TimeUnlock = _TimeUnlock;
    }

    //To lock the above variable values so no further variable value change is possible
    function lockForTokenRelease() external onlyAdmin ckLock {
        isLockedForRelease = true;
    }

    //To set TimeAtDeployment before isLockedForRelease becomes true
    // function setReleaseTime(uint _TimeAtDeployment) external onlyAdmin ckTime(_TimeAtDeployment) ckLock {
    //     TimeAtDeployment = _TimeAtDeployment;
    // }

    modifier ckLock() {
        require(!isLockedForRelease, "only allowed before locked up");
        _;
    }

    //function() external payable { revert("should not send any ether directly"); }
}