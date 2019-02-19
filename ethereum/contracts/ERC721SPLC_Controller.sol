pragma solidity ^0.5.3;
//pragma experimental ABIEncoderV2;

import "./Ownable.sol";

contract ERC721SPLC_Controller is Ownable {
    // 201902180900, 201902180901, 201902180902, 201902180907
    uint public currentTime;
    uint public TokenLaunchTime;
    uint public TokenUnlockTime;
    uint public TokenValidTime;//token expiry time 203903310000
    bool public isLaunched;//

    // 201902190900, 201902190901, 201902190902, 201902191745
    constructor(uint _currentTime, uint _TokenLaunchTime, 
      uint _TokenUnlockTime, uint _TokenValidTime) public {
        currentTime = _currentTime;
        TokenLaunchTime = _TokenLaunchTime;
        TokenUnlockTime = _TokenUnlockTime;
        TokenValidTime = _TokenValidTime;
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
        require(TokenUnlockTime < currentTime && currentTime < TokenValidTime, "token in lockup time or over valid date");
        _;
    }
    function isUnlockedValid() external view returns (bool){
        return (TokenUnlockTime < currentTime && currentTime < TokenValidTime);
    }

    function getHTokenControllerDetails() public view returns (
        uint, uint, uint, uint, bool) {
        return (
            currentTime, TokenLaunchTime, TokenUnlockTime, TokenValidTime, isLaunched);
    }

    //For TimeServer injecting current time
    //event SetCurrentTime(uint _currentTime);
    function setCurrentTime(uint _currentTime) external onlyAdmin ckTime(_currentTime){
        currentTime = _currentTime;
        //emit SetCurrentTime(_currentTime);
    }

    //To extend valid time if token operation is paused
    //event SetTokenValidTime(uint _TokenValidTime);
    function setTokenValidTime(uint _TokenValidTime) external onlyAdmin ckTime(_TokenValidTime) ckLaunched {
        TokenValidTime = _TokenValidTime;
        //emit SetTokenValidTime(_TokenValidTime);
    }

    //event SetTokenUnlockTime(uint _TokenUnlockTime);
    function setTokenUnlockTime(uint _TokenUnlockTime) external onlyAdmin ckTime(_TokenUnlockTime) ckLaunched {
        TokenUnlockTime = _TokenUnlockTime;
        //emit SetTokenUnlockTime(_TokenUnlockTime);
    }

    //event SetLaunchTime(uint _TokenLaunchTime);
    function setLaunchTime(uint _TokenLaunchTime) external onlyAdmin ckTime(_TokenLaunchTime) ckLaunched {
        TokenLaunchTime = _TokenLaunchTime;
        isLaunched = true;
        //emit SetLaunchTime(_TokenLaunchTime);
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