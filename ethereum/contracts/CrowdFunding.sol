pragma solidity ^0.5.3;
//透過平台平台asset contract deploy
//deploy parameters: "hTaipei001", 17000, 300, 290, 201902191810, 201902191800

import "./Ownable.sol";
import "./SafeMath.sol";

contract CrowdFunding is Ownable {
    using SafeMath for uint256;
    
    /** TO BE REMOVED AFTER TESTING!!!
    
    function setAmountRaised(uint _amountRaised) public {
        amountRaised = _amountRaised;
    } */

    event showState(string _state);
    event updateTime(uint _time);
    event startFunding(string indexed _htokenSYMBOL, uint _fundingGoal, uint _time);
    event goalReached(string indexed _htokenSYMBOL, uint _amountRaised, uint _time);
    event fundingClosing(string indexed _htokenSYMBOL, uint _time);
    event FundTransfer(address _investor, uint _amount, uint _time);
    
    address private platformAddress;
    string public HTokenSYMBOL; //專案erc721合約
    uint public token_price; //每片太陽能板定價
    uint public totalamount; //專案總token數
    uint public fundingGoal; //專案達標數目
    uint public amountRaised; //累積賣出數目
    uint public deadline; //截止日期 yyyymmddhhmm
    
    struct Balance {
        address userAssetcontract; //
        uint256 token_balance; //購買的token總數
        uint256 fund_balance; //
    }
    
    mapping(address => Balance) public balanceOf;

    ///募款中、已達標(未到期)、已結案(提前售完/到期並達標)、募款失敗(到期但未達標)
    enum saleState{Funding, goalReached, projectClosed, goalnotReached}
    saleState public salestate;
    
    enum pauseState{Active, Pause} 
    pauseState public pausestate;

    /*  at initialization, setup the owner 
    "hTaipei001", 17000, 300, 98, 201902191810, 201902191800
    */
    constructor  (
        string memory _htokenSYMBOL,
        uint _tokenprice,
        uint _totalamount,
        uint _percents,
        uint _deadline,//time format yyyymmddhhmm
        uint _startTime
    ) public {
        platformAddress = msg.sender;
        HTokenSYMBOL = _htokenSYMBOL;//設定專案專案erc721合約
        token_price = _tokenprice;
        totalamount = _totalamount;//專案總量
        fundingGoal = totalamount.mul(_percents).div(100);//專案達標數量
        deadline = _deadline;// yyyymmddhhmm
        salestate = saleState.Funding;//init the project state
        pausestate = pauseState.Active;
        emit startFunding(_htokenSYMBOL, fundingGoal, _startTime);
    }

    function Invest(
        uint _serverTime, address _assetContrcatAddr, uint _tokenInvest) 
        external checkAmount(_tokenInvest) checkPlatform {

        updateState(_serverTime);
        require((salestate == saleState.Funding || salestate == saleState.goalReached) && pausestate == pauseState.Active, "checkState modifier failed");

        if(_serverTime > deadline && amountRaised < fundingGoal){
            salestate = saleState.goalnotReached;//專案失敗
            emit showState(ProjectState());
        }
        else{
            uint amount = _tokenInvest;
            balanceOf[_assetContrcatAddr].userAssetcontract = _assetContrcatAddr;
            uint tokenBalance = balanceOf[_assetContrcatAddr].token_balance;
            tokenBalance = tokenBalance.add(amount);//用mapping記錄每個投資人的token數目
            uint fundBalance = balanceOf[_assetContrcatAddr].fund_balance;
            fundBalance = fundBalance.add(_tokenInvest.mul(token_price));
            amountRaised = amountRaised.add(_tokenInvest);//紀錄已經賣了多少token
            emit FundTransfer(msg.sender, amount, _serverTime);
        }

        updateState(_serverTime);
        emit showState(ProjectState());
    }
    
    /* checks if the goal or time limit has been reached and ends the campaign */
    function updateState(uint _serverTime) public checkPlatform {
        if(_serverTime <= deadline && amountRaised >= fundingGoal){
            emit goalReached(HTokenSYMBOL, amountRaised, _serverTime);
            salestate = saleState.goalReached;
        }
        if(amountRaised == totalamount){
            salestate = saleState.projectClosed;//賣完及結案
            emit goalReached(HTokenSYMBOL, amountRaised, _serverTime);
        }
        if ((_serverTime >= deadline) && (amountRaised >= fundingGoal || amountRaised == totalamount)){
            salestate = saleState.projectClosed;//到期後有達標，無論是否賣完都算結案
            emit fundingClosing(HTokenSYMBOL, _serverTime);
        }
        
    }

    function ProjectState() public view returns(string memory _return) {
        if(salestate == saleState.Funding) 
            _return = "during funding";
        else if(salestate == saleState.goalReached) 
            _return = "goal reached, but funding amount not reached";
        else if(salestate == saleState.projectClosed && amountRaised == totalamount)
            _return = "goal reached and funding amount reached";
        else if(salestate == saleState.projectClosed && amountRaised >= fundingGoal) 
            _return = "goal reached, and funding amount is over";
        else if(salestate == saleState.goalnotReached) 
            _return = "goal not reached";
        else revert("ProjectState() failed");
    }
    
    function pauseSale() public checkPlatform {
        pausestate = pauseState.Pause;
    }
    
    function resumeSale(uint _resetDeadline) public checkPlatform {
        pausestate = pauseState.Active;
        deadline = _resetDeadline;
    }
    
    //檢視專案進度，賣出了多少太陽能板
    function Progress() public view returns(uint) {
        return (totalamount - amountRaised);
    }
    
    modifier checkAmount(uint _tokencount){
        require(_tokencount.add(amountRaised) <= totalamount, "checkAmount failed");
        _;
    }
    
    modifier checkPlatform() {
        require(msg.sender == platformAddress, "checkPlatform failed");
        _;
    }
}