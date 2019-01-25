pragma solidity ^0.5.3;

import "./Ownable.sol";

contract RegistryContract{
    function getUserInfo(string memory _u_id) public isOwner view returns (string memory u_id, address assetAccount, address etherAddr, uint accountStatus){};
}

contract CrowdSale is Ownable{
    
    event showState(string _state);
    
    //string public HTokenSYMBOL; //專案erc721合約
    uint public token_price;//每片太陽能板定價
    uint public totalamount; //專案總token數
    uint public fundingGoal;//專案達標數目
    uint public amountRaised; //累積賣出數目
    uint public deadline; //截止日期
    
    struct balance {
        address userAssetcontract;
        uint256 token_balance;
        uint256 fund_balance;
    }

    //asset contract address
    //mapping(address => uint256) public token_balanceOf;
    mapping(uint => balance) public balanceOf;


    ///募款中、已達標(未到期)、已結案(提前售完/到期並達標)、募款失敗(到期但未達標)
    enum SaleState{Funding, goalReached, projectClosed, goalnotReached}
    SaleState salestate;
    //timestamp uint yyyymmddhhmm time server 要處理跨月、大小月
    //string _htokenSYMBOL
    event StartFunding(address _htoken, uint fundingGoal);
    //timestamp uint yyyymmddhhmm
    event GoalReached(address _htoken, uint amountRaised);
    //timestamp
    event FundTransfer(address sponsor, uint amount);

    /*  at initialization, setup the owner */
    constructor  (
        //address _tokenaddress,
        uint _toeknprice,
        uint _totalamount,
        uint _percents,
        uint _deadline//from time server
    ) public {
        ///HTokenaddress = _tokenaddress;//設定專案專案erc721合約
        token_price = _toeknprice;
        totalamount = _totalamount;//專案總量
        fundingGoal = totalamount * _percents / 100;//專案達標數量
        deadline = _deadline;///設定專案期限「測試時用30秒而已」
        salestate = SaleState.Funding;//init the project state
        emit StartFunding(HTokenaddress, fundingGoal);
    }

    /* The function without name is the default function that is called whenever anyone sends funds to a contract */
    function Invest(uint _tokencount) public checkAmount(_tokencount){
        require(
            salestate == SaleState.Funding || salestate == SaleState.goalReached);
        if(now > deadline && amountRaised < fundingGoal){
            salestate = SaleState.goalnotReached;//專案失敗
        }
        else{
            uint amount = _tokencount;
            token_balanceOf[msg.sender] += amount;//用mapping記錄每個投資人的token數目
            fund_balanceOf[msg.sender] += amount * token_price;//記錄每個投資者投入多少資金
            amountRaised += _tokencount;//紀錄已經賣了多少token
            emit FundTransfer(msg.sender, amount);
            checkState();//投資後檢查整個專案狀態
            emit showState(ProjectState());
        }
    }
    
    /* checks if the goal or time limit has been reached and ends the campaign */
    function checkState() private{
        if(now <= deadline && amountRaised >= fundingGoal){
            emit GoalReached(HTokenaddress, amountRaised);
            salestate = SaleState.goalReached;
        }
        if(amountRaised == totalamount){
            salestate = SaleState.projectClosed;//賣完及結案
        }
        if ((now >= deadline) && (amountRaised >= fundingGoal || amountRaised == totalamount)){
            salestate = SaleState.projectClosed;//到期後有達標，無論是否賣完都算結案
        }
        
    }
    

    function ProjectState() public view returns(string memory _return){
        if(salestate == SaleState.Funding) _return = "募資中!";
        else if(salestate == SaleState.goalReached) _return = "已達標，尚有太陽能板可購買！";
        else if(salestate == SaleState.projectClosed && amountRaised == totalamount) _return = "專案已結束，完售";
        else if(salestate == SaleState.projectClosed && amountRaised >= fundingGoal) _return = "專案已結束，達標";
        else if(salestate == SaleState.goalnotReached) _return = "募款失敗";
        else revert("ProjectState() failed");
    }
    
    //檢視專案進度，賣出了多少太陽能板
    function Progress() public view returns(uint){
        return (totalamount - amountRaised);
    }
    
    modifier checkAmount(uint _tokencount){
        require(_tokencount + amountRaised <= totalamount, "checkAmount failed");
        _;
    }
}