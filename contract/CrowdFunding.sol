//透過平台平台asset contract deploy

pragma solidity ^0.5.3;

import "./Ownable.sol";
import "./SafeMath.sol";

interface Registry {
    function isUserApproved(string memory uid) public view 
      ckUid(uid) uidExists(uid) returns (bool);
    function isAddrApproved(address assetCtAddr) public view 
      ckAssetCtAddr(assetCtAddr) returns (bool);
    function isUnderCompliance(address to, address from, uint amount) external view 
      ckAddr(to) ckAddr(from) returns (bool);
}

contract CrowdSale is Ownable{
    using SafeMath for uint256;
    
    event showState(string _state);
    event startFunding(string indexed _htokenSYMBOL, uint _fundingGoal, uint _time);
    event goalReached(string indexed _htokenSYMBOL, uint _amountRaised, uint _time);
    event fundingClosing(string indexed _htokenSYMBOL, uint _time);
    event FundTransfer(address indexed _investor, uint _amount, uint _time);
    event reFundrecord(address _investor, uint _amount, uint _time);
    
    address private platformAddress;
    string public HTokenSYMBOL; //專案erc721合約
    uint public token_price; //每片太陽能板定價
    uint public totalamount; //專案總token數
    uint public fundingGoal; //專案達標數目
    uint public amountRaised; //累積賣出數目
    uint public deadline; //截止日期 yyyymmddhhmm

    address public addrRegistry;

    struct Balance {
        address userAssetcontract;
        uint256 token_balance;
        uint256 fund_balance;
    }
    
    mapping(address => Balance) public balanceOf;

    ///募款中、已達標(未到期)、已結案(提前售完/到期並達標)、募款失敗(到期但未達標)
    enum saleState{Funding, goalReached, projectClosed, goalnotReached}
    saleState salestate;
    
    enum pauseState{Active, Pause} 
    pauseState pausestate;

    /*  at initialization, setup the owner */
    constructor  (
        string memory _htokenSYMBOL,
        uint _tokenprice,
        uint _totalamount,
        uint _percents,
        uint _deadline,//time format yyyymmddhhmm
        uint _startTime,
        address _addrRegistry
    ) public {
        platformAddress = msg.sender;
        HTokenSYMBOL = _htokenSYMBOL;//設定專案專案erc721合約
        token_price = _tokenprice;
        totalamount = _totalamount;//專案總量
        fundingGoal = totalamount.mul(_percents).div(100);//專案達標數量
        deadline = _deadline;// yyyymmddhhmm
        salestate = saleState.Funding;//init the project state
        pausestate = pauseState.Active;

        addrRegistry = _addrRegistry;
        emit startFunding(_htokenSYMBOL, fundingGoal, _startTime);
    }

    function Invest(uint _serverTime, address _assetContrcatAddr, uint _tokenInvest) public checkAmount(_tokenInvest) checkState(_serverTime) checkPlatform{

        //Legal Compliance
        require(Registry(addrRegistry).isAddrApproved(_assetContrcatAddr), "_assetContrcatAddr is not in compliance");

        uint amount = _tokenInvest;
        balanceOf[_assetContrcatAddr].userAssetcontract = _assetContrcatAddr;
        balanceOf[_assetContrcatAddr].token_balance = balanceOf[_assetContrcatAddr].token_balance.add(amount);//用mapping記錄每個投資人的token數目
        balanceOf[_assetContrcatAddr].fund_balance = balanceOf[_assetContrcatAddr].fund_balance.add(_tokenInvest.mul(token_price));
        amountRaised = amountRaised.add(_tokenInvest);//紀錄已經賣了多少token
        emit FundTransfer(_assetContrcatAddr, amount, _serverTime);
    }
    
    /* checks if the goal or time limit has been reached and ends the campaign */
    function updateState(uint _serverTime) public checkPlatform{
        if(_serverTime <= deadline && amountRaised >= fundingGoal){
            emit goalReached(HTokenSYMBOL, amountRaised, _serverTime);
            salestate = saleState.goalReached;
        }
        if(amountRaised == totalamount){
            salestate = saleState.projectClosed;//賣完及結案
            emit goalReached(HTokenSYMBOL, amountRaised, _serverTime);
        }
        if ((_serverTime == deadline) && (amountRaised >= fundingGoal || amountRaised == totalamount)){
            salestate = saleState.projectClosed;//到期後有達標，無論是否賣完都算結案
            emit fundingClosing(HTokenSYMBOL, _serverTime);
        }
        if(_serverTime == deadline && amountRaised < fundingGoal){
            salestate = saleState.goalnotReached;//專案失敗
            emit showState(ProjectState());
        }
    }
    
    function refund(uint _serverTime, address userAssetcontract) public checkPlatform {
        emit reFundrecord(userAssetcontract, balanceOf[userAssetcontract].fund_balance, _serverTime);
    }

    function ProjectState() public view returns(string memory _return){
        if(salestate == saleState.Funding) _return = "募資中!";
        else if(salestate == saleState.goalReached) _return = "已達標，尚有太陽能板可購買！";
        else if(salestate == saleState.projectClosed && amountRaised == totalamount) _return = "專案已結束，完售";
        else if(salestate == saleState.projectClosed && amountRaised >= fundingGoal) _return = "專案已結束，達標";
        else if(salestate == saleState.goalnotReached) _return = "募款失敗";
        else revert("ProjectState() failed");
    }
    
    function showPausestate() public view returns(string memory _return) {
        if(pausestate == pauseState.Pause) _return = "專案暫停";
        else if(pausestate == pauseState.Active) _return = "專案進行中";
    }  
    
    function pauseSale() public checkPlatform {
        require(pausestate == pauseState.Active);
        pausestate = pauseState.Pause;
    }
    
    function resumeSale(uint _resetDeadline) public checkPlatform {
        require(pausestate == pauseState.Pause);
        pausestate = pauseState.Active;
        deadline = _resetDeadline;
    }
    
    //檢視專案進度，賣出了多少太陽能板
    function Progress() public view returns(uint){
        return (totalamount - amountRaised);
    }
    
    modifier checkState(uint _serverTime) {
        require((salestate == saleState.Funding || salestate == saleState.goalReached) && pausestate == pauseState.Active);
        _;
        updateState(_serverTime);
        emit showState(ProjectState());
    }
    
    modifier checkAmount(uint _tokencount){
        require(_tokencount.add(amountRaised) <= totalamount, "checkAmount failed");
        _;
    }
    
    modifier checkPlatform() {
        require(msg.sender == platformAddress, "Permissioin denied");
        _;
    }
}