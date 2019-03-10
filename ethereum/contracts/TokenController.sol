pragma solidity ^0.5.4;
//pragma experimental ABIEncoderV2;

import "./Ownable.sol";

contract TokenController is Ownable {
    // 201902180900, 201902180901, 201902180902, 201902180907
    uint public timeCurrent;
    uint public TimeTokenRelease;// Release Date
    uint public TimeTokenUnlock;
    uint public TimeTokenValid;// Valid Date or token expiry time 203903310000
    bool public isReleased;
    bool public isActive;

    // 201902190900, 201902190901, 201902190902, 201902191745
    constructor(uint _timeCurrent, uint _TimeTokenRelease, 
      uint _TimeTokenUnlock, uint _TimeTokenValid,
      address[] memory management) public {
        timeCurrent = _timeCurrent;
        TimeTokenRelease = _TimeTokenRelease;
        TimeTokenUnlock = _TimeTokenUnlock;
        TimeTokenValid = _TimeTokenValid;
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
        require(TimeTokenUnlock < timeCurrent && timeCurrent < TimeTokenValid && isActive, "token in lockup time or over valid date or not active");
        _;
    }
    function isUnlockedValid() external view returns (bool){
        return (TimeTokenUnlock < timeCurrent && timeCurrent < TimeTokenValid && isActive);
    }
    function isUnlocked() external view returns (bool){
        return (TimeTokenUnlock < timeCurrent);
    }
    function isValid() external view returns (bool){
        return (timeCurrent < TimeTokenValid);
    }

    function getHTokenControllerDetails() public view returns (
        uint, uint, uint, uint, bool) {
        return (
            timeCurrent, TimeTokenRelease, TimeTokenUnlock, TimeTokenValid, isReleased);
    }

    //For TimeServer injecting current time
    //event SetTimeCurrent(uint _timeCurrent);
    function setTimeCurrent(uint _timeCurrent) external onlyAdmin ckTime(_timeCurrent){
        timeCurrent = _timeCurrent;
        //emit SetTimeCurrent(_timeCurrent);
    }

    //To extend valid time if token operation is paused
    //event SetTimeTokenValid(uint _TimeTokenValid);
    function setTimeTokenValid(uint _TimeTokenValid) external onlyAdmin ckTime(_TimeTokenValid) ckReleased {
        TimeTokenValid = _TimeTokenValid;
        //emit SetTimeTokenValid(_TimeTokenValid);
    }

    //event SetTimeTokenUnlock(uint _TimeTokenUnlock);
    function setTimeTokenUnlock(uint _TimeTokenUnlock) external onlyAdmin ckTime(_TimeTokenUnlock) ckReleased {
        TimeTokenUnlock = _TimeTokenUnlock;
        //emit SetTimeTokenUnlock(_TimeTokenUnlock);
    }

    //event SetReleaseTime(uint _TimeTokenRelease);
    function setReleaseTime(uint _TimeTokenRelease) external onlyAdmin ckTime(_TimeTokenRelease) ckReleased {
        TimeTokenRelease = _TimeTokenRelease;
        isReleased = true;
        //emit SetReleaseTime(_TimeTokenRelease);
    }

    function setIsActive(bool _isActive) external onlyAdmin ckReleased {
        isActive = _isActive;
        //emit SetReleaseTime(_TimeTokenRelease);
    }

    // event SetLegalCompliance(uint _addrLegalCompliance);
    // function setLegalCompliance(uint _addrLegalCompliance) external onlyAdmin ckAddr(_addrLegalCompliance) {
    //     addrLegalCompliance = _addrLegalCompliance;
    //     LegalCompliance legalCompliance = LegalCompliance(_addrLegalCompliance);
    //     emit SetLegalCompliance(_addrLegalCompliance);
    // }

    // event SetRegistry(address _addrRegistry);
    // function setRegistry(address _addrRegistry) external onlyAdmin ckAddr(_addrRegistry){
    //     addrRegistry = _addrRegistry;
    //     emit SetRegistry(_addrRegistry);
    // }
}