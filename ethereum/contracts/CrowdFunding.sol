pragma solidity ^0.5.4;
//deploy parameters: "hTaipei001", 17000, 300, 290, 201902191810, 201902191800


import "./SafeMath.sol";
interface Helium_Interface_CFC{
    function checkPlatformSupervisor(address _eoa) external view returns(bool _isPlatformSupervisor);
}
interface TokenReceiver_Interface_CFC {
    function tokenReceiver(address _from, address _to, uint256 _tokenId) external pure returns(bytes4);
}

contract CrowdFunding {
    using SafeMath for uint256;
    using AddressUtils for address;

    address public addrHelium;

    event UpdateState(
        string indexed _tokenSymbol,
        uint _quantitySold, uint serverTime,
        FundingState indexed _fundingState,
        string _stateDescription
    );
    event TokenInvested(address indexed _addrAssetbook, uint _quantityToInvest, uint serverTime);

    uint public TimeOfDeployment;
    uint public maxTokenQtyForEachInvestmentFund = 120000000;
    // the max allowed token quantity for each investment fund, according to the token minting function limit
    string public tokenSymbol; //token symbol for crowdfunding
    string public pricingCurrency; // type of funding pricingCurrency: NTD, USD, RMB, etc...
    uint public initialAssetPricing; // initial funding price for each token
    uint public maxTotalSupply; //total allowed token quantity for crowdfunding sales
    uint public quantityGoal; //sales minimum goal for sold token quantity
    uint public quantitySold; //accumulated quantity of sold tokens
    uint public CFSD; //crowdfunding start date in yyyymmddhhmm format
    uint public CFED; //crowdfunding end date in yyyymmddhhmm format
    uint public fundingType;
    address public addrRegistry;

    // Each incoming fund will be recorded in each investor’s InvestmentRecord
    mapping(address => uint) public ownerToQty;
    mapping(uint => address) public idxToOwner;

    uint public fundingCindex;//last submitted index and total count of all invested funds

    //fundingClosed: maxTotalSupply is reached or CFED is reached with quantitySold > quantityGoal
    //已結案(提前售完/到期並達標)、募款失敗(到期但未達標)
    // the fundingState can be one of the following states: initial, funding, fundingPaused, fundingGoalReached, fundingClosed, fundingNotClosed, terminated
    enum FundingState{initial, funding, fundingPaused, fundingGoalReached, fundingClosed, fundingNotClosed, terminated}
    FundingState public fundingState;
    string public stateDescription;
    bytes4 constant TOKEN_RECEIVER_HASH = 0x79830ac6;

    /*  at initialization, setup the owner
    "TKOS1901", 18000, "NTD", 900, 890, 201905211800, 201905211810, 201905211710, "0xbf94fAE6B7381CeEbCF13f13079b82E487f0Faa7"
    */
    constructor  (
        string memory _tokenSymbol,
        uint _initialAssetPricing,
        string memory _pricingCurrency,// NTD or USD or RMB ...
        uint _maxTotalSupply,
        uint _quantityGoal,
        uint _CFSD,//CrowdFunding Start Date. time format yyyymmddhhmm
        uint _CFED,//CrowdFunding End Date
        uint _TimeOfDeployment,
        address _addrHelium
        //,
        //uint _fundingType,
        //address _addrRegistry
    ) public {
        //require(ckStringLength(_tokenSymbol, 8, 32), "_tokenSymbol length out of range");
        tokenSymbol = _tokenSymbol;//設定專案專案erc721合約
        //require(_initialAssetPricing > 0, "_initialAssetPricing should be greater than 0");
        initialAssetPricing = _initialAssetPricing;

        //require(ckStringLength(_pricingCurrency, 3, 32), "_pricingCurrency length out of range");
        pricingCurrency = _pricingCurrency;
        //require(_quantityGoal <= _maxTotalSupply, "quantityGoal should be lesser than maxTotalSupply");
        maxTotalSupply = _maxTotalSupply;//專案總量
        quantityGoal = _quantityGoal;

        //require(_CFSD < _CFED, "CFSD should be lesser than CFED");
        //require(TimeOfDeployment < _CFSD, "TimeOfDeployment should be < CFSD");
        CFSD = _CFSD;
        CFED = _CFED;// yyyymmddhhmm
        fundingState = FundingState.initial;//init the project state
        stateDescription = "initial";
        TimeOfDeployment = _TimeOfDeployment;

        addrHelium = _addrHelium;
        //fundingType = _fundingType;
        //addrRegistry = _addrRegistry;
        emit UpdateState(tokenSymbol, quantitySold, TimeOfDeployment, fundingState, "deployed");
    }
    function checkDeploymentConditions(
        string memory _tokenSymbol, uint _initialAssetPricing,
        string memory _pricingCurrency,// NTD or USD or RMB ...
        uint _maxTotalSupply, uint _quantityGoal,
        uint _CFSD,//CrowdFunding Start Date. time format yyyymmddhhmm
        uint _CFED,//CrowdFunding End Date
        uint _TimeOfDeployment, address _addrHelium

      ) public view returns(bool[] memory boolArray) {
        boolArray = new bool[](8);
        boolArray[0] = _initialAssetPricing > 0;
        boolArray[1] = _maxTotalSupply >= _quantityGoal;
        boolArray[2] = _TimeOfDeployment > 201905281400;
        boolArray[3] = _CFSD > _TimeOfDeployment;
        boolArray[4] = _CFED > _CFSD;
        boolArray[5] = ckStringLength(_tokenSymbol, 8, 32);
        boolArray[6] = ckStringLength(_pricingCurrency, 3, 32);
        boolArray[7] = _addrHelium.isContract();
    }

    function changeCFED(uint _CFED) public onlyPlatformSupervisor {
        CFED = _CFED;
    }
    function changeCFSD(uint _CFSD) public onlyPlatformSupervisor {
        CFSD = _CFSD;
    }
/*
    function changeInitialConditions(
        string memory _tokenSymbol,
        uint _initialAssetPricing,
        string memory _pricingCurrency,
        uint _maxTotalSupply,
        uint _quantityGoal,
        uint _CFSD,//CrowdFunding Start Date. time format yyyymmddhhmm
        uint _CFED,//CrowdFunding End Date
        uint _TimeOfDeployment,
        address _addrHelium
        ) public onlyPlatformSupervisor {
        tokenSymbol = _tokenSymbol;
        initialAssetPricing = _initialAssetPricing;
        pricingCurrency = _pricingCurrency;
        maxTotalSupply = _maxTotalSupply;//專案總量
        quantityGoal = _quantityGoal;

        CFSD = _CFSD;
        CFED = _CFED;// yyyymmddhhmm
        TimeOfDeployment = _TimeOfDeployment;
        addrHelium = _addrHelium;
    }*/

    function getCrowdfundingDetails() public view returns(
        uint[9] memory, string memory, string memory, string memory, FundingState, address) {
        return ([
            TimeOfDeployment, maxTokenQtyForEachInvestmentFund,
            initialAssetPricing, maxTotalSupply, quantityGoal, quantitySold, CFSD, CFED, fundingCindex], tokenSymbol, pricingCurrency, stateDescription, fundingState, addrHelium);
    }

    function checkPlatformSupervisorFromCFC() public view returns (bool){
        return (Helium_Interface_CFC(addrHelium).checkPlatformSupervisor(msg.sender));
    }
    function setHeliumAddr(address _addrHelium) external onlyPlatformSupervisor{
        addrHelium = _addrHelium;
    }
    modifier onlyPlatformSupervisor() {
        require(
            Helium_Interface_CFC(addrHelium).checkPlatformSupervisor(msg.sender),
            "only PlatformSupervisor is allowed to call this function");
        _;
    }
    /* checks if the investment token amount goal or crowdfunding time limit has been reached. If so, ends the campaign accordingly. Or it will show other states, for example: initial... */
    function updateState(uint serverTime) public onlyPlatformSupervisor {
        //quantitySold has only addition operation, so it is a more reliable variable to do if statement
        require(serverTime > TimeOfDeployment, "serverTime should be greater TimeOfDeployment");

        if(quantitySold >= maxTotalSupply){
            fundingState = FundingState.fundingClosed;
            stateDescription = "fundingClosed: sold out";

        } else if(quantitySold >= quantityGoal){
            if (serverTime >= CFED){
                fundingState = FundingState.fundingClosed;
                stateDescription = "fundingClosed: goal reached but not sold out";
            } else if (serverTime >= CFSD){
                fundingState = FundingState.fundingGoalReached;
                stateDescription = "fundingGoalReached: still funding and has reached goal";
            } else {
                fundingState = FundingState.initial;
                stateDescription = "initial: goal reached already";
            }

        } else {
            if (serverTime >= CFED){
                fundingState = FundingState.fundingNotClosed;
                stateDescription = "fundingNotClosed: ended with goal not reached";
            } else if (serverTime >= CFSD){
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
    function pauseFunding(uint serverTime) external onlyPlatformSupervisor {
        require(serverTime > TimeOfDeployment, "serverTime should be greater TimeOfDeployment");
        fundingState = FundingState.fundingPaused;
        stateDescription = "funding paused";
        emit UpdateState(tokenSymbol, quantitySold, serverTime, fundingState, "pauseFunding");
    }

    function checkResumeFunding(uint _CFED, uint _maxTotalSupply, uint serverTime) external view returns(bool[] memory boolArray){
        boolArray = new bool[](5);
        boolArray[0] = Helium_Interface_CFC(addrHelium).checkPlatformSupervisor(msg.sender);
        boolArray[1] = serverTime > CFSD;
        boolArray[2] = _CFED > CFSD;
        boolArray[3] = _CFED > serverTime;
        boolArray[4] = _maxTotalSupply >= quantitySold;
    }
    // to resume crowdfunding and also reset the crowdfunding end day and maxTotalSupply values
    event ResumeFunding(string indexed _tokenSymbol, uint _CFED, uint _maxTotalSupply);
    function resumeFunding(uint _CFED, uint _maxTotalSupply, uint serverTime) external onlyPlatformSupervisor {

        require(serverTime > CFSD, "serverTime should be > CFSD");
        if(_CFED == 0 && _maxTotalSupply == 0) {
            emit ResumeFunding(tokenSymbol, CFED, maxTotalSupply);
        } else {
            require(_CFED > CFSD, "_CFED should be greater than CDSD2");
            require(_CFED > serverTime, "_CFED should be greater than serverTime");
            require(_maxTotalSupply >= quantitySold, "_maxTotalSupply should be greater than quantitySold");
            CFED = _CFED;
            maxTotalSupply = _maxTotalSupply;
            emit ResumeFunding(tokenSymbol, _CFED, _maxTotalSupply);
        }
        updateState(serverTime);
    }


    // to terminate the current crowdfunding process, possibly due to external unexpected force
    function terminate(string calldata _reason, uint serverTime) external onlyPlatformSupervisor {
        require(serverTime > TimeOfDeployment, "serverTime should be greater TimeOfDeployment");

        require(ckStringLength(_reason, 7, 32), "_reason length is out of range");
        fundingState = FundingState.terminated;
        stateDescription = append("terminated:", _reason);
        emit UpdateState(tokenSymbol, quantitySold, serverTime, fundingState, append("terminated:", _reason));
    }

    // to get the remaining amount of tokens available for further funding
    function getRemainingTokenQty() external view returns(uint remainingQty) {
        remainingQty = maxTotalSupply.sub(quantitySold);
    }


    function investInBatch(address[] calldata _assetbookArr, uint[] calldata _quantityToInvestArr, uint serverTime) external {
        require(_assetbookArr.length == _quantityToInvestArr.length, "input arrays must be of the same length");
        for(uint i = 0; i < _assetbookArr.length; i = i.add(1)) {
            invest(_assetbookArr[i], _quantityToInvestArr[i], serverTime);
        }
    }

    function checkInvestFunction(address _addrAssetbook, uint _quantityToInvest, uint serverTime) external view returns(
      bool[] memory boolArray) {
        boolArray = new bool[](9);

        boolArray[0] = serverTime >= CFSD;
        boolArray[1] = serverTime < CFED;
        boolArray[2] = Helium_Interface_CFC(addrHelium).checkPlatformSupervisor(msg.sender);
        boolArray[3] = _addrAssetbook.isContract();
        boolArray[4] = TokenReceiver_Interface_CFC(_addrAssetbook).tokenReceiver(
            msg.sender, address(this), 1) == TOKEN_RECEIVER_HASH;

        boolArray[5] = _quantityToInvest > 0;
        boolArray[6] = quantitySold.add(_quantityToInvest) <= maxTotalSupply;
        boolArray[7] = serverTime > TimeOfDeployment;
        boolArray[8] = fundingState == FundingState.initial ||
            fundingState == FundingState.funding ||
            fundingState == FundingState.fundingGoalReached;

        //uint balance = AssetTokenITF_CF(addrHCAT721).balanceOf(_addrAssetbook);//addrHCAT721 does not exist yet...
        //return RegistryITF_CF(addrRegistry).isFundingApproved(_addrAssetbook, _quantityToInvest.mul(initialAssetPricing), balance.mul(initialAssetPricing), fundingType);
    }

    // to record each funding source and the amount tokens secured by that funding
    function invest(address _addrAssetbook, uint _quantityToInvest, uint serverTime) public onlyPlatformSupervisor {
        /*because we only deploy assetToken contract AFTER successfully closed a crowdfunding, therefore at this moment addrHCAT721 does not exist yet, therefore we cannot check the investor's existing token holding balance... or the balance is assumed to be zero.

        uint balance = AssetTokenITF_CF(addrHCAT721).balanceOf(_addrAssetbook);//addrHCAT721 does not exist yet...
        bool[2] result = RegistryITF_CF(addrRegistry).isFundingApproved(_addrAssetbook, _quantityToInvest.mul(initialAssetPricing), balance.mul(initialAssetPricing), fundingType);
        require(result[0] && result[1], "[Legal Compliance failed] @ Registry:isFundingApproved() failed");
        */
        if(serverTime >= CFSD && fundingState == FundingState.initial){
            fundingState = FundingState.funding;
        }
        require(
            fundingState == FundingState.funding ||
            fundingState == FundingState.fundingGoalReached,
            "funding is terminated or not started yet");

        if (_addrAssetbook.isContract()) {
            bytes4 retval = TokenReceiver_Interface_CFC(_addrAssetbook).tokenReceiver(
                msg.sender, address(this), 1);// assume tokenId = 1;
            require(retval == TOKEN_RECEIVER_HASH, "retval should be TOKEN_RECEIVER_HASH");
        } else {
            require(false,"_addrAssetbook address should contain a contract");
        }

        require(_quantityToInvest > 0, "_quantityToInvest should be > 0");
        //require(_quantityToInvest <= maxTokenQtyForEachInvestmentFund, "_quantityToInvest should be <= maxTokenQtyForEachInvestmentFund");

        quantitySold = quantitySold.add(_quantityToInvest);
        require(quantitySold <= maxTotalSupply, "quantitySold should be <= maxTotalSupply");

        if(ownerToQty[_addrAssetbook] == 0){
            fundingCindex = fundingCindex.add(1);
            idxToOwner[fundingCindex] = _addrAssetbook;
        }
        ownerToQty[_addrAssetbook] = ownerToQty[_addrAssetbook].add(_quantityToInvest);

        emit TokenInvested(_addrAssetbook, _quantityToInvest, serverTime);
        updateState(serverTime);
    }

    // to get a list of investors’ assetbookArray and the amount of tokens they have sercured
    function getInvestors(uint indexStart, uint amount)
        external view returns(address[] memory assetbookArray, uint[] memory investedTokenQtyArray) {
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
        assetbookArray = new address[](amount_);
        investedTokenQtyArray = new uint[](amount_);

        for(uint i = 0; i < amount_; i = i.add(1)) {
            assetbookArray[i] = idxToOwner[i.add(indexStart_)];
            investedTokenQtyArray[i] = ownerToQty[assetbookArray[i]];
            // assetbookArray[i] = investmentRecords[i.add(indexStart_)].assetbook;
            // investedTokenQtyArray[i] = investmentRecords[i.add(indexStart_)].investedTokenQty;
        }
    }


    function append(string memory a, string memory b) public pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }

    function ckStringLength(string memory _str, uint _minStrLen, uint _maxStrLen) public pure returns(bool) {
        return (bytes(_str).length >= _minStrLen && bytes(_str).length <= _maxStrLen);
        //require(bytes(_str).length >= _minStrLen && bytes(_str).length <= _maxStrLen, "input string. Check mimimun & maximum length");
    }

    //function() external payable { revert("should not send any ether directly"); }

}
library AddressUtils {
    function isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(_addr) } // solium-disable-line security/no-inline-assembly
        return size > 0;
    }
}
