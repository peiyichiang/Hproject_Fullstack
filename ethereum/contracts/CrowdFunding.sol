pragma solidity ^0.5.4;
//透過平台平台asset contract deploy
//deploy parameters: "hTaipei001", 17000, 300, 290, 201902191810, 201902191800

import "./Ownable.sol";
import "./SafeMath.sol";

interface ERC721TokenReceiverITF_CF {
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external pure returns(bytes4);
}

contract CrowdFunding is Ownable {
    using SafeMath for uint256;
    using AddressUtils for address;

    event ShowState(string _state);
    event UpdateState(string indexed _tokenSymbol, uint _quantitySold, uint _serverTime, FundingState indexed _fundingState, string _stateDescription);
    event TokenReserved(address indexed _assetbook, uint _quantityToInvest, uint _serverTime);
    
    uint public serverTime;
    address private platformAddress;
    string public tokenSymbol; //專案erc721合約
    uint public tokenPrice; //每片太陽能板定價
    string public currency; // NTD, USD, RMB, etc...
    uint public quantityMax; //專案總token數
    uint public quantityGoal; //專案達標數目
    uint public quantitySold; //累積賣出數目
    uint public CFSD2; //start date yyyymmddhhmm
    uint public CFED2; //截止日期 yyyymmddhhmm
    
    struct Account {
        address assetbook;//assetbook addr
        uint256 qty;//購買的token總數
        //uint256 fundBalance;//
        //string currency;
    }
    mapping(uint => Account) public accounts;
    uint public cindex;

    //hasSucceeded: quantityMax is reached or CFED2 is reached with quantitySold > quantityGoal
    //已結案(提前售完/到期並達標)、募款失敗(到期但未達標)
    enum FundingState{initial, funding, paused, fundingWithGoalReached, hasSucceeded, hasFailed, forceTerminated}
    FundingState public fundingState;
    bool public isActive;
    bool public isTerminated;
    string public stateDescription;
    bytes4 constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;

    /*  at initialization, setup the owner 
    "hTaipei001", 17000, "NTD", 900, 98, 201902191800, 201902191810, 201902191710, "", "", "", "", ""
    */
    constructor  (
        string memory _tokenSymbol,
        uint _tokenPrice,
        string memory _currency,// NTD or USD or RMB ...
        uint _quantityMax,
        uint _goalInPercentage,
        uint _CFSD2,//CrowdFunding Start Date. time format yyyymmddhhmm
        uint _CFED2,//CrowdFunding End Date
        uint _serverTime,
        address[] memory management

    ) public {
        ckStringLength(_tokenSymbol, 3, 32);
        tokenSymbol = _tokenSymbol;//設定專案專案erc721合約
        require(_tokenPrice > 0, "_tokenPrice should be greater than 0");
        tokenPrice = _tokenPrice;

        ckStringLength(_currency, 3, 32);
        currency = _currency;
        quantityMax = _quantityMax;//專案總量
        quantityGoal = quantityMax.mul(_goalInPercentage).div(100);//專案達標數量, Solidity division will truncates results

        require(quantityGoal < quantityMax, "quantityGoal should be lesser than quantityMax");
        require(_CFSD2 < _CFED2, "CFSD2 should be lesser than CFED2");
        require(_serverTime < _CFSD2, "CFSD2 should be greater than 201902250000");
        CFSD2 = _CFSD2;
        CFED2 = _CFED2;// yyyymmddhhmm
        fundingState = FundingState.initial;//init the project state
        require(_serverTime > 201902250000, "_serverTime should be greater than default time");
        serverTime = _serverTime;

        require(management.length > 4, "management.length should be > 4");
        owner = management[4];
        chairman = management[3];
        director = management[2];
        manager = management[1];
        admin = management[0];

        emit UpdateState(tokenSymbol, quantitySold, _serverTime, fundingState, "deployed");
    }

    //event UpdateState(string indexed _tokenSymbol, uint _quantitySold, uint _serverTime, uint indexed _fundingState, string memory _stateDescription);

    function addServerTime(uint _additionalTime) external onlyAdmin {
        require(_additionalTime > 0, "_additionalTime should be greater than zero");
        serverTime = serverTime.add(_additionalTime);
        updateState();
    }
    //for time server to input _serverTime
    function setServerTime(uint _serverTime) external onlyAdmin {
        require(_serverTime > 201902250000, "_serverTime should be greater than default time");
        serverTime = _serverTime;
        updateState();
    }

    /* checks if the goal or time limit has been reached and ends the campaign */
    function updateState() public onlyAdmin {

        //enum fundingState{initial, funding, paused, fundingWithGoalReached, hasSucceeded, hasFailed, forceTerminated}
        //quantitySold has only addition operation, so it is a more reliable variable to do if statement
        if(quantitySold == quantityMax){
            isTerminated = true;
            fundingState = FundingState.hasSucceeded;
            stateDescription = "hasSucceeded: sold out";

        } else if(quantitySold >= quantityGoal){
            if (serverTime >= CFED2){
                fundingState = FundingState.hasSucceeded;
                stateDescription = "hasSucceeded: ended with unsold items";
            } else if (serverTime >= CFSD2){
                fundingState = FundingState.fundingWithGoalReached;
                stateDescription = "fundingWithGoalReached: still funding and has reached goal";
            } else {
                fundingState = FundingState.initial;
                stateDescription = "initial: goal reached already";
            }

        } else {
            if (serverTime >= CFED2){
                isTerminated = true;
                fundingState = FundingState.hasFailed;
                stateDescription = "hasFailed: ended with goal not reached";
            } else if (serverTime >= CFSD2){
                fundingState = FundingState.funding;
                stateDescription = "funding: with goal not reached yet";
            } else {
                fundingState = FundingState.initial;
                stateDescription = "initial: not started yet";
            }
        }
        emit UpdateState(tokenSymbol, quantitySold, serverTime, fundingState, stateDescription);
    }

    //event UpdateState(string indexed _tokenSymbol, uint _quantitySold, uint _serverTime, uint indexed state);
    function makeFundingActive() external onlyAdmin {
        isActive = true;
        emit UpdateState(tokenSymbol, quantitySold, serverTime, fundingState, "makeFundingActive");
    }
    function pauseFunding() external onlyAdmin {
        isActive = false;
        fundingState = FundingState.paused;
        emit UpdateState(tokenSymbol, quantitySold, serverTime, fundingState, "pauseFunding");
    }
    event ResumeFunding(string indexed _tokenSymbol, uint _CFED2, uint _quantityMax);
    function resumeFunding(uint _CFED2, uint _quantityMax) external onlyAdmin {
        require(_CFED2 > CFSD2, "_CFED2 should be greater than CDSD2");
        require(_quantityMax >= quantitySold, "_quantityMax should be greater than quantitySold");
        isActive = true;
        CFED2 = _CFED2;
        quantityMax = _quantityMax;
        emit ResumeFunding(tokenSymbol, _CFED2, _quantityMax);
        updateState();
    }
    function forceTerminated(string calldata _reason) external onlyAdmin {
        ckStringLength(_reason, 7, 32);
        isTerminated = true;
        fundingState = FundingState.forceTerminated;
        stateDescription = "forceTerminated";
        updateState();
        emit UpdateState(tokenSymbol, quantitySold, serverTime, fundingState, append("forceTerminated:", _reason));
    }

    function invest(address _assetbook, uint _quantityToInvest) 
        external onlyAdmin {
        // uint _serverTime, 
        // require(_serverTime > serverTime, "_serverTime should be greater than existing serverTime");

        if (_assetbook.isContract()) {
            bytes4 retval = ERC721TokenReceiverITF_CF(_assetbook).onERC721Received(
                msg.sender, msg.sender, 1, "");// assume tokenId = 1;
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        } else {
            require(false,"_assetbook address should contain ERC721 compatible asset contract");
        }

        require(_quantityToInvest > 0, "_quantityToInvest should be greater than zero");

        require(isActive, "funding is not active");
        require(!isTerminated, "crowdFunding has been terminated");
        uint nextQtySold = quantitySold.add(_quantityToInvest);
        require(nextQtySold <= quantityMax, "insufficient available token quantity");
        quantitySold = nextQtySold;//紀錄已經賣了多少token

        require(fundingState == FundingState.funding || fundingState == FundingState.fundingWithGoalReached, "funding is terminated or not started yet");

        /**
        struct Account {
            address assetbook;//assetbook addr
            uint256 qty;//購買的token總數
        }
         */
        cindex = cindex.add(1);
        accounts[cindex].assetbook = _assetbook;

        //uint qty = accounts[cindex].qty;
        //qty = qty.add(_quantityToInvest);//用mapping記錄每個投資人的token數目
        accounts[cindex].qty = _quantityToInvest;//qty;

        //uint fundBalance = accounts[cindex].fundBalance;
        //fundBalance = fundBalance.add(_quantityToInvest.mul(tokenPrice));
        //accounts[cindex].fundBalance = _quantityToInvest.mul(tokenPrice);//fundBalance;

        emit TokenReserved(_assetbook, _quantityToInvest, serverTime);
        //event TokenReserved(address indexed _assetbook, uint _quantityToInvest, uint _serverTime);

        updateState();
    }

    function getInvestors(uint indexStart, uint amount) 
        external view returns(address[] memory assetbooks, uint[] memory qtyArray) {
        require(amount > 0, "amount must be > 0");
        require(indexStart > 0, "indexStart must be > 0");
        uint amount_;
        if(indexStart.add(amount).sub(1) > cindex) {
          amount_ = cindex.sub(indexStart).add(1);
        } else {
          amount_ = amount;
        }
        for(uint i = 0; i < amount_; i = i.add(1)) {
            assetbooks[i] = accounts[i.add(indexStart)].assetbook;
            qtyArray[i] = accounts[i.add(indexStart)].qty;
        }
    }


    function append(string memory a, string memory b) public pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }
    function ckStringLength(string memory _str, uint _minStrLen, uint _maxStrLen) public pure {
        require(bytes(_str).length >= _minStrLen && bytes(_str).length <= _maxStrLen, "input string. Check mimimun & maximum length");
    }

}
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) } // solium-disable-line security/no-inline-assembly
        return size > 0;
    }
}
