pragma solidity ^0.5.4;
//deploy parameters: "hTaipei001", 17000, 300, 290, 201902191810, 201902191800

import "./Ownable.sol";
import "./SafeMath.sol";

interface ERC721TokenReceiverITF_CF {
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external pure returns(bytes4);
}
interface RegistryITF {
    function isAddrApproved(address assetCtrtAddr) external view returns (bool);
    function isFundingApproved(address assetCtrtAddr, uint buyAmount, uint balance, uint fundingType) external view returns (bool);
}

contract CrowdFunding is Ownable {
    using SafeMath for uint256;
    using AddressUtils for address;

    event UpdateState(string indexed _tokenSymbol, uint _quantitySold, uint serverTime, FundingState indexed _fundingState, string _stateDescription);
    event TokenInvested(address indexed _assetbook, uint _quantityToInvest, uint serverTime);
    
    uint public serverTimeMin = 201902250000;
    uint public maxTokenQtyForEachInvestmentFund = 120;// the max allowed token quantity for each investment fund, according to the token minting function limit
    string public tokenSymbol; //token symbol for crowdfunding
    string public pricingCurrency; // type of funding pricingCurrency: NTD, USD, RMB, etc...
    uint public initialAssetPricing; // funding price for each token
    uint public maxTotalSupply; //total allowed token quantity for crowdfunding sales
    uint public quantityGoal; //sales minimum goal for sold token quantity
    uint public quantitySold; //accumulated quantity of sold tokens
    uint public CFSD2; //crowdfunding start date in yyyymmddhhmm format
    uint public CFED2; //crowdfunding end date in yyyymmddhhmm format

    // Each incoming fund will be recorded in each investor’s InvestmentRecord
    struct InvestmentRecord {
        address assetbook;//assetbook address
        uint256 investedTokenQty;//invested token quantity
    }
    mapping(uint => InvestmentRecord) public investmentRecords;
    uint public fundingCindex;//last submitted index and total count of all invested funds

    //fundingClosed: maxTotalSupply is reached or CFED2 is reached with quantitySold > quantityGoal
    //已結案(提前售完/到期並達標)、募款失敗(到期但未達標)
    // the fundingState can be one of the following states: initial, funding, fundingPaused, fundingGoalReached, fundingClosed, fundingNotClosed, terminated
    enum FundingState{initial, funding, fundingPaused, fundingGoalReached, fundingClosed, fundingNotClosed, terminated}
    FundingState public fundingState;
    string public stateDescription;
    bytes4 constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;
    uint public fundingType;
    //address public addrRegistry;

    /*  at initialization, setup the owner 
    "hTaipei001", 17000, "NTD", 900, 98, 201902191800, 201902191810, 201902191710, "", "", "", "", ""
    */
    constructor  (
        string memory _tokenSymbol,
        uint _initialAssetPricing,
        string memory _pricingCurrency,// NTD or USD or RMB ...
        uint _maxTotalSupply,
        uint _quantityGoal,
        uint _CFSD2,//CrowdFunding Start Date. time format yyyymmddhhmm
        uint _CFED2,//CrowdFunding End Date
        uint serverTime,
        address[] memory management

    ) public {
        ckStringLength(_tokenSymbol, 3, 32);
        tokenSymbol = _tokenSymbol;//設定專案專案erc721合約
        require(_initialAssetPricing > 0, "_initialAssetPricing should be greater than 0");
        initialAssetPricing = _initialAssetPricing;

        ckStringLength(_pricingCurrency, 3, 32);
        pricingCurrency = _pricingCurrency;
        require(_quantityGoal <= _maxTotalSupply, "quantityGoal should be lesser than maxTotalSupply");
        maxTotalSupply = _maxTotalSupply;//專案總量
        quantityGoal = _quantityGoal;
        //quantityGoal = maxTotalSupply.mul(_goalInPercentage).div(100);//專案達標數量, Solidity division will truncates results

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

    function getContractDetails() public view returns(uint serverTimeMin_, uint maxTokenQtyForEachInvestmentFund_, string memory tokenSymbol_, string memory pricingCurrency_, uint initialAssetPricing_, uint maxTotalSupply_, uint quantityGoal_, uint quantitySold_, uint CFSD2_, uint CFED2_) {
        serverTimeMin_ = serverTimeMin;
        maxTokenQtyForEachInvestmentFund_ = maxTokenQtyForEachInvestmentFund;
        tokenSymbol_ = tokenSymbol;
        pricingCurrency_ = pricingCurrency;
        initialAssetPricing_ = initialAssetPricing;
        maxTotalSupply_ = maxTotalSupply;
        quantityGoal_ = quantityGoal;
        quantitySold_ = quantitySold;
        CFSD2_ = CFSD2;
        CFED2_ = CFED2;
    }


    /* checks if the investment token amount goal or crowdfunding time limit has been reached. If so, ends the campaign accordingly. Or it will show other states, for example: initial... */
    function updateState(uint serverTime) public onlyAdmin {
        //quantitySold has only addition operation, so it is a more reliable variable to do if statement
        require(serverTime > serverTimeMin, "serverTime should be greater than default time");

        if(quantitySold >= maxTotalSupply){
            fundingState = FundingState.fundingClosed;
            stateDescription = "fundingClosed: sold out";

        } else if(quantitySold >= quantityGoal){
            if (serverTime >= CFED2){
                fundingState = FundingState.fundingClosed;
                stateDescription = "fundingClosed: goal reached but not sold out";
            } else if (serverTime >= CFSD2){
                fundingState = FundingState.fundingGoalReached;
                stateDescription = "fundingGoalReached: still funding and has reached goal";
            } else {
                fundingState = FundingState.initial;
                stateDescription = "initial: goal reached already";
            }

        } else {
            if (serverTime >= CFED2){
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


    // to pause current crowdfunding process
    function pauseFunding(uint serverTime) external onlyAdmin {
        fundingState = FundingState.fundingPaused;
        stateDescription = "funding paused";
        emit UpdateState(tokenSymbol, quantitySold, serverTime, fundingState, "pauseFunding");
    }

    // to resume crowdfunding and also reset the crowdfunding end day and maxTotalSupply values
    event ResumeFunding(string indexed _tokenSymbol, uint _CFED2, uint _maxTotalSupply);
    function resumeFunding(uint _CFED2, uint _maxTotalSupply, uint serverTime) external onlyAdmin {

        require(serverTime > CFSD2, "serverTime should be > CFSD2");
        if(_CFED2 == 0 && _maxTotalSupply == 0) {
            emit ResumeFunding(tokenSymbol, CFED2, maxTotalSupply);
        } else {
            require(_CFED2 > CFSD2, "_CFED2 should be greater than CDSD2");
            require(_CFED2 > serverTime, "_CFED2 should be greater than serverTime");
            require(_maxTotalSupply >= quantitySold, "_maxTotalSupply should be greater than quantitySold");
            CFED2 = _CFED2;
            maxTotalSupply = _maxTotalSupply;
            emit ResumeFunding(tokenSymbol, _CFED2, _maxTotalSupply);
        }
        updateState(serverTime);
    }

    // to terminate the current crowdfunding process, possibly due to external unexpected force
    function terminate(string calldata _reason, uint serverTime) external onlyAdmin {
        ckStringLength(_reason, 7, 32);
        fundingState = FundingState.terminated;
        stateDescription = append("terminated:", _reason);
        emit UpdateState(tokenSymbol, quantitySold, serverTime, fundingState, append("terminated:", _reason));
    }

    // to get the remaining amount of tokens available for further funding
    function getRemainingTokenQty() view external returns(uint remainingQty) {
        remainingQty = maxTotalSupply - quantitySold;
    }

    // to record each funding source and the amount tokens secured by that funding 
    function invest(address _assetbook, uint _quantityToInvest, uint serverTime) external onlyAdmin {

        //require(RegistryITF(addrRegistry).isFundingApproved(_assetbook, _quantityToInvest.mul(price), balanceOf(_to).mul(price), fundingType), "[Registry Compliance] isFundingApproved() failed");
        //function isFundingApproved(address assetCtrtAddr, uint buyAmount, uint balance, uint fundingType)

        // if(serverTime >= CFSD2 && fundingState == FundingState.initial){
        //     fundingState = FundingState.funding;
        // }

        if (_assetbook.isContract()) {
            bytes4 retval = ERC721TokenReceiverITF_CF(_assetbook).onERC721Received(
                msg.sender, msg.sender, 1, "");// assume tokenId = 1;
            require(retval == MAGIC_ON_ERC721_RECEIVED, "retval should be MAGIC_ON_ERC721_RECEIVED");
        } else {
            require(false,"_assetbook address should contain ERC721 compatible asset contract");
        }

        require(_quantityToInvest > 0, "_quantityToInvest should be > 0");
        require(_quantityToInvest <= maxTokenQtyForEachInvestmentFund, "_quantityToInvest should be <= maxTokenQtyForEachInvestmentFund");
        quantitySold = quantitySold.add(_quantityToInvest);
        require(quantitySold <= maxTotalSupply, "quantitySold should be <= maxTotalSupply");

        require(fundingState == FundingState.funding || fundingState == FundingState.fundingGoalReached, "funding is terminated or not started yet");

        fundingCindex = fundingCindex.add(1);
        investmentRecords[fundingCindex].assetbook = _assetbook;
        investmentRecords[fundingCindex].investedTokenQty = _quantityToInvest;

        emit TokenInvested(_assetbook, _quantityToInvest, serverTime);
        updateState(serverTime);
    }

    // to get a list of investors’ assetbooks and the amount of tokens they have sercured
    function getInvestors(uint indexStart, uint amount)
        external view returns(address[] memory assetbooks, uint[] memory investedTokenQtyArray) {
        uint amount_;
        uint indexStart_;
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
        investedTokenQtyArray = new uint[](amount_);

        for(uint i = 0; i < amount_; i = i.add(1)) {
            assetbooks[i] = investmentRecords[i.add(indexStart_)].assetbook;
            investedTokenQtyArray[i] = investmentRecords[i.add(indexStart_)].investedTokenQty;
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
