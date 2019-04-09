pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;

import "./Ownable.sol";

contract TokenController is Ownable {
    // 201902180900, 201902180901, 201902180902, 201902180907
    uint public timeCurrent;
    uint public TimeRelease;// Release Date
    uint public TimeUnlock;
    uint public TimeValid;// Valid Date or token expiry time 203903310000
    bool public isReleased;
    bool public isActive;

    // 201902190900, 201902190901, 201902190902, 201902191745
    constructor(uint _timeCurrent, uint _TimeRelease, 
      uint _TimeUnlock, uint _TimeValid,
      address[] memory management) public {
        timeCurrent = _timeCurrent;
        TimeRelease = _TimeRelease;
        TimeUnlock = _TimeUnlock;
        TimeValid = _TimeValid;
        isActive = true;
        require(management.length > 4, "management.length should be > 4");
        owner = management[4];
        chairman = management[3];
        director = management[2];
        manager = management[1];
        admin = management[0];
    }

    modifier ckReleased() {
        require(!isReleased, "only allowed before Release time");
        _;
    }
    modifier ckTime(uint _time) {
        require(_time > 201903070000, "_time is <= 201903070000 or not in the format of yyyymmddhhmm");
        _;
    }
    modifier onlyUnlockedValid() {
        //will block all token tranfers either before the lockup time, 
        //or until a time when SPLC's power plant contract is finished
        require(TimeUnlock < timeCurrent && timeCurrent < TimeValid && isActive, "token in lockup time or over valid date or not active");
        _;
    }
    function isUnlockedValid() external view returns (bool){
        return (TimeUnlock < timeCurrent && timeCurrent < TimeValid && isActive);
    }
    function isUnlocked() external view returns (bool){
        return (TimeUnlock < timeCurrent);
    }
    function isValid() external view returns (bool){
        return (timeCurrent < TimeValid);
    }

    function getHTokenControllerDetails() public view returns (
        uint, uint, uint, uint, bool) {
        return (
            timeCurrent, TimeRelease, TimeUnlock, TimeValid, isReleased);
    }

    //For TimeServer injecting current time
    //event SetTimeCurrent(uint _timeCurrent);
    function setTimeCurrent(uint _timeCurrent) external onlyAdmin ckTime(_timeCurrent){
        timeCurrent = _timeCurrent;
        //emit SetTimeCurrent(_timeCurrent);
    }

    //To extend valid time if token operation is paused
    //event SetTimeValid(uint _TimeValid);
    function setTimeValid(uint _TimeValid) external onlyAdmin ckTime(_TimeValid) ckReleased {
        TimeValid = _TimeValid;
        //emit SetTimeValid(_TimeValid);
    }

    //event SetTimeUnlock(uint _TimeUnlock);
    function setTimeUnlock(uint _TimeUnlock) external onlyAdmin ckTime(_TimeUnlock) ckReleased {
        TimeUnlock = _TimeUnlock;
        //emit SetTimeUnlock(_TimeUnlock);
    }

    //event SetReleaseTime(uint _TimeRelease);
    function setReleaseTime(uint _TimeRelease) external onlyAdmin ckTime(_TimeRelease) ckReleased {
        TimeRelease = _TimeRelease;
        isReleased = true;
        //emit SetReleaseTime(_TimeRelease);
    }

    function setIsActive(bool _isActive) external onlyAdmin ckReleased {
        isActive = _isActive;
        //emit SetReleaseTime(_TimeRelease);
    }

    function() external payable { revert("should not send any ether directly"); }
}