pragma solidity ^0.5.4;
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
    event UpdateState(string indexed _tokenSymbol, uint _quantitySold, uint serverTime, FundingState indexed _fundingState, string _stateDescription);
    event TokenInvested(address indexed _assetbook, uint _quantityToInvest, uint serverTime);
    
    uint public serverTimeMin = 201902250000;
    string public tokenSymbol; //專案erc721合約
    string public currency; // NTD, USD, RMB, etc...
    uint public tokenPrice; //每片太陽能板定價
    uint public quantityMax; //專案總token數
    uint public quantityGoal; //專案達標數目
    uint public quantitySold; //累積賣出數目
    uint public CFSD2; //start date yyyymmddhhmm
    uint public CFED2; //截止日期 yyyymmddhhmm

    struct Account {
        address assetbook;//assetbook addr
        uint256 qty;//購買的token總數
    }
    mapping(uint => Account) public accounts;
    uint public fundingCindex;//last submitted index and total count of current orders

    //fundingClosed: quantityMax is reached or CFED2 is reached with quantitySold > quantityGoal
    //已結案(提前售完/到期並達標)、募款失敗(到期但未達標)
    enum FundingState{initial, funding, fundingPaused, fundingGoalReached, fundingClosed, fundingNotClosed, aborted}
    FundingState public fundingState;
    bool public isActive;
    bool public isAborted;
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
        uint _quantityGoal,
        uint _CFSD2,//CrowdFunding Start Date. time format yyyymmddhhmm
        uint _CFED2,//CrowdFunding End Date
        uint serverTime,
        address[] memory management

    ) public {
        ckStringLength(_tokenSymbol, 3, 32);
        tokenSymbol = _tokenSymbol;//設定專案專案erc721合約
        require(_tokenPrice > 0, "_tokenPrice should be greater than 0");
        tokenPrice = _tokenPrice;

        ckStringLength(_currency, 3, 32);
        currency = _currency;
        quantityMax = _quantityMax;//專案總量
        quantityGoal = _quantityGoal;//專案達標數量, Solidity division will truncates results

        require(quantityGoal <= quantityMax, "quantityGoal should be lesser than quantityMax");
        require(_CFSD2 < _CFED2, "CFSD2 should be lesser than CFED2");
        require(serverTime < _CFSD2, "serverTime should be < CFSD2");
        CFSD2 = _CFSD2;
        CFED2 = _CFED2;// yyyymmddhhmm
        fundingState = FundingState.initial;//init the project state
        require(serverTime > serverTimeMin, "serverTime should be greater than serverTimeMin");

        require(management.length > 4, "management.length should be > 4");
        owner = management[4];
        chairman = management[3];
        director = management[2];
        manager = management[1];
        admin = management[0];
        emit UpdateState(tokenSymbol, quantitySold, serverTime, fundingState, "deployed");
    }


    /* checks if the goal or time limit has been reached and ends the campaign */
    function updateState(uint serverTime) public onlyAdmin {
        //quantitySold has only addition operation, so it is a more reliable variable to do if statement
        require(serverTime > serverTimeMin, "serverTime should be greater than default time");
        serverTime = serverTime;

        if(quantitySold == quantityMax){
            isAborted = true;
            fundingState = FundingState.fundingClosed;
            stateDescription = "fundingClosed: sold out";

        } else if(quantitySold >= quantityGoal){
            if (serverTime >= CFED2){
                fundingState = FundingState.fundingClosed;
                stateDescription = "fundingClosed: ended with unsold items";
            } else if (serverTime >= CFSD2){
                fundingState = FundingState.fundingGoalReached;
                stateDescription = "fundingGoalReached: still funding and has reached goal";
            } else {
                fundingState = FundingState.initial;
                stateDescription = "initial: goal reached already";
            }

        } else {
            if (serverTime >= CFED2){
                isAborted = true;
                fundingState = FundingState.fundingNotClosed;
                stateDescription = "fundingNotClosed: ended with goal not reached";
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

    //event UpdateState(string indexed _tokenSymbol, uint _quantitySold, uint serverTime, uint indexed state);
    function makeFundingActive(uint serverTime) external onlyAdmin {
        isActive = true;
        emit UpdateState(tokenSymbol, quantitySold, serverTime, fundingState, "makeFundingActive");
    }

    function pauseFunding(uint serverTime) external onlyAdmin {
        isActive = false;
        fundingState = FundingState.fundingPaused;
        stateDescription = "fundingPaused";
        emit UpdateState(tokenSymbol, quantitySold, serverTime, fundingState, "pauseFunding");
    }

    event ResumeFunding(string indexed _tokenSymbol, uint _CFED2, uint _quantityMax);
    function resumeFunding(uint _CFED2, uint _quantityMax, uint serverTime) external onlyAdmin {

        require(serverTime > CFSD2, "serverTime should be > CFSD2");
        if(_CFED2 == 0 && _quantityMax == 0) {
            emit ResumeFunding(tokenSymbol, CFED2, quantityMax);
        } else {
            require(_CFED2 > CFSD2, "_CFED2 should be greater than CDSD2");
            require(_CFED2 > serverTime, "_CFED2 should be greater than serverTime");
            require(_quantityMax >= quantitySold, "_quantityMax should be greater than quantitySold");
            CFED2 = _CFED2;
            quantityMax = _quantityMax;
            emit ResumeFunding(tokenSymbol, _CFED2, _quantityMax);
        }
        isActive = true;
        updateState(serverTime);
    }

    function abort(string calldata _reason, uint serverTime) external onlyAdmin {
        ckStringLength(_reason, 7, 32);
        isAborted = true;
        fundingState = FundingState.aborted;
        stateDescription = append("aborted:", _reason);
        emit UpdateState(tokenSymbol, quantitySold, serverTime, fundingState, stateDescription);
    }

    function invest(address _assetbook, uint _quantityToInvest, uint serverTime)
        external onlyAdmin {

        if (_assetbook.isContract()) {
            bytes4 retval = ERC721TokenReceiverITF_CF(_assetbook).onERC721Received(
                msg.sender, msg.sender, 1, "");// assume tokenId = 1;
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        } else {
            require(false,"_assetbook address should contain ERC721 compatible asset contract");
        }

        require(_quantityToInvest > 0, "_quantityToInvest should be greater than zero");
        require(isActive, "funding is not active");
        require(!isAborted, "crowdFunding has been aborted");
        quantitySold = quantitySold.add(_quantityToInvest);
        require(quantitySold <= quantityMax, "insufficient available token quantity");

        require(fundingState == FundingState.funding || fundingState == FundingState.fundingGoalReached, "funding is aborted or not started yet");

        fundingCindex = fundingCindex.add(1);
        accounts[fundingCindex].assetbook = _assetbook;
        accounts[fundingCindex].qty = _quantityToInvest;//qty;

        emit TokenInvested(_assetbook, _quantityToInvest, serverTime);
        updateState(serverTime);
    }

    function getInvestors(uint indexStart, uint amount)
        external view returns(address[] memory assetbooks, uint[] memory qtyArray) {
        uint amount_; uint indexStart_;
        if(indexStart == 0 && amount == 0) {
          indexStart_ = 1;
          amount_ = fundingCindex;

        } else {
            indexStart_ = indexStart;
            require(amount > 0, "amount must be > 0");
            require(indexStart > 0, "indexStart must be > 0");
            if(indexStart.add(amount).sub(1) > fundingCindex) {
              amount_ = fundingCindex.sub(indexStart).add(1);
            } else {
                amount_ = amount;
            }
        }
        assetbooks = new address[](amount_);
        qtyArray = new uint[](amount_);

        for(uint i = 0; i < amount_; i = i.add(1)) {
            assetbooks[i] = accounts[i.add(indexStart_)].assetbook;
            qtyArray[i] = accounts[i.add(indexStart_)].qty;
        }
    }

    function append(string memory a, string memory b) public pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }

    function ckStringLength(string memory _str, uint _minStrLen, uint _maxStrLen) public pure {
        require(bytes(_str).length >= _minStrLen && bytes(_str).length <= _maxStrLen, "input string. Check mimimun & maximum length");
    }

    function() external payable { revert("should not send any ether directly"); }

}
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) } // solium-disable-line security/no-inline-assembly
        return size > 0;
    }
}
