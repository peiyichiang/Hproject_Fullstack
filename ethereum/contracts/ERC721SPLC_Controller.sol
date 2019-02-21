pragma solidity ^0.5.3;
//pragma experimental ABIEncoderV2;

import "./Ownable.sol";

contract ERC721SPLC_Controller is Ownable {
    // 201902180900, 201902180901, 201902180902, 201902180907
    uint public timeCurrent;
    uint public TimeTokenLaunch;
    uint public TimeTokenUnlock;
    uint public TimeTokenValid;//token expiry time 203903310000
    bool public isLaunched;//

    // 201902190900, 201902190901, 201902190902, 201902191745
    constructor(uint _timeCurrent, uint _TimeTokenLaunch, 
      uint _TimeTokenUnlock, uint _TimeTokenValid) public {
        timeCurrent = _timeCurrent;
        TimeTokenLaunch = _TimeTokenLaunch;
        TimeTokenUnlock = _TimeTokenUnlock;
        TimeTokenValid = _TimeTokenValid;
    }

    modifier ckLaunched() {
        require(!isLaunched, "only allowed before launch time");
        _;
    }
    modifier ckTime(uint _time) {
        require(_time > 201902150000, "_time has to be in the format of yyyymmddhhmm");
        _;
    }
    modifier onlyUnlockedValid() {
        //will block all token tranfers either before the lockup time, 
        //or until a time when SPLC's power plant contract is finished
        require(TimeTokenUnlock < timeCurrent && timeCurrent < TimeTokenValid, "token in lockup time or over valid date");
        _;
    }
    function isUnlockedValid() external view returns (bool){
        return (TimeTokenUnlock < timeCurrent && timeCurrent < TimeTokenValid);
    }

    function getHTokenControllerDetails() public view returns (
        uint, uint, uint, uint, bool) {
        return (
            timeCurrent, TimeTokenLaunch, TimeTokenUnlock, TimeTokenValid, isLaunched);
    }

    //For TimeServer injecting current time
    //event SetTimeCurrent(uint _timeCurrent);
    function setTimeCurrent(uint _timeCurrent) external onlyAdmin ckTime(_timeCurrent){
        timeCurrent = _timeCurrent;
        //emit SetTimeCurrent(_timeCurrent);
    }

    //To extend valid time if token operation is paused
    //event SetTimeTokenValid(uint _TimeTokenValid);
    function setTimeTokenValid(uint _TimeTokenValid) external onlyAdmin ckTime(_TimeTokenValid) ckLaunched {
        TimeTokenValid = _TimeTokenValid;
        //emit SetTimeTokenValid(_TimeTokenValid);
    }

    //event SetTimeTokenUnlock(uint _TimeTokenUnlock);
    function setTimeTokenUnlock(uint _TimeTokenUnlock) external onlyAdmin ckTime(_TimeTokenUnlock) ckLaunched {
        TimeTokenUnlock = _TimeTokenUnlock;
        //emit SetTimeTokenUnlock(_TimeTokenUnlock);
    }

    //event SetLaunchTime(uint _TimeTokenLaunch);
    function setLaunchTime(uint _TimeTokenLaunch) external onlyAdmin ckTime(_TimeTokenLaunch) ckLaunched {
        TimeTokenLaunch = _TimeTokenLaunch;
        isLaunched = true;
        //emit SetLaunchTime(_TimeTokenLaunch);
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