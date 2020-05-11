var faker = require('faker');
var fs = require('fs');
var es = require('event-stream');
const {asyncForEach, getLocalTime} = require('../timeserver/utilities');

const generateRandomNameWithoutSpecialChar = async() => {
    let randomName = faker.name.findName().toUpperCase().substring(0,4) + getLocalTime().toString().substring(4, 8);
    while(randomName.includes('.') || randomName.includes(' ')){
        return generateRandomNameWithoutSpecialChar();
    }
    symbol = randomName;
    fs.writeFileSync('./test_CI/random_symbol.txt', symbol);

}
let symbol;
generateRandomNameWithoutSpecialChar(symbol);

let total = faker.random.number(10000) + 10000;
let goal = faker.random.number(total - 10000) + 10000;
let price = faker.random.number(1000) + 1000;
console.log(`symbol: ${symbol}`);
console.log(`total: ${total}`);
console.log(`goal: ${goal}`);
let type = '2';
const edit_product = {
    p_SYMBOL: symbol,
    p_name: faker.name.findName().substr(0, 18),
    p_location: '台南市新營區新工路23號',
    p_pricing: price,
    p_duration: "20",
    p_currency: 'NTD',
    p_irr: 5.4,
    p_releasedate: 201912282359,
    p_validdate: 203912302359,
    p_size: "300",
    p_totalrelease: total,
    p_fundmanager: 'myrronlin@gmail.com',
    p_PAdate: '2019-10-24 11:27:11 AM',
    p_CFSD: '201910180900',
    p_CFED: '202012241700',
    pd_icon: 'public/uploadImgs/1571287635079_icon_ENIS1901.png',
    pd_OnGridAuditedLetter:
     'public/uploadImgs/1571287635041_file_銀鏈資產管理有限公司(正和製藥)-併聯審查意見書(無初細步協商) [FAX版].pdf',
    pd_assetdocsHash: '',
    p_state: 'draft',
    p_RPT: '80',
    p_FRP: '10/08',
    p_PSD: '201910181600',
    p_FMXAdate: '2019-10-23 11:34:05 AM',
    p_TaiPowerApprovalDate: '201910050800',
    p_BOEApprovalDate: '201910250800',
    p_PVTrialOperationDate: '202001150800',
    p_PVOnGridDate: '201912310800',
    p_PANote: '',
    p_FMSNote: '',
    pd_Image1: 'public/uploadImgs/1571366992648_image1_00-01.jpg',
    pd_Image2: 'public/uploadImgs/1571287635146_image2_施作範圍-2.jpg',
    pd_Image3: 'public/uploadImgs/1571287635178_image3_主建物施作範圍.jpg',
    pd_Image4: 'public/uploadImgs/1571287635202_image4_主建物施作範圍-1.jpg',
    pd_Image5: 'public/uploadImgs/1571287635234_image5_車棚空拍照.jpg',
    pd_Image6: 'public/uploadImgs/1571366662168_image6_施作範圍-1.jpg',
    pd_Image7:
     'public/uploadImgs/1571370557683_image7_銀鏈資產管理有限公司(正和製藥)-機電圖_01.jpg',
    pd_Image8: '',
    pd_Image9: '',
    pd_Image10: '',
    p_fundingGoal: goal,
    p_abortedReason: '321321321',
    pd_csvFIle:
    `public/uploadImgs/${symbol}.csv`,
    p_fundingType: type,
    p_paidNumber: "300",
    p_EPCname: '朝羿光電能源',
    p_pvSiteintro:
     '愛因斯坦一號案場位於台南市新營區, 平均年日照量達1,292小時以上。本場地為合格Pics藥廠, 結構與屋況保養皆優良。本場使用969片AUO 310W高效模組, 總裝置量300.39kw, 採股票上市公司逆變器等優質部件, 由具工程實績之EPC廠商責任施作、知名能源廠監工, 將帶給您最安心的長期報酬! HCAT電利超商首發產品, 具高達5.4%之20年內部報酬率(IRR), 好機會請勿錯過! ',
    p_ContractOut: '201907260800',
    p_CaseConstruction: '201912200800',
    p_ElectricityBilling: '201912310800',
    p_isNewCase: "2",
    pd_NotarizedRentalContract: '',
    p_ForecastedAnnualIncomePerModule: "1",
    p_lockuptime: 201911010800,
    pd_HCAT721uri:""
};
const add_product = {
    p_SYMBOL: symbol,
    p_name: faker.name.findName().substr(0, 18),
    p_location: '台南市新營區新工路23號',
    p_pricing: faker.random.number(10000) + 10000,
    p_duration: "20",
    p_currency: 'NTD',
    p_irr: 5.4,
    p_releasedate: '201911232359',
    p_validdate: '203912302359',
    p_size: "300",
    p_totalrelease: total,
    p_fundmanager: 'myrronlin@gmail.com',
    p_PAdate: '2019-10-24 11:27:11 AM',
    p_CFSD: '201910180900',
    p_CFED: '202012241700',
    p_icon: 'public/uploadImgs/1571287635079_icon_ENIS1901.png',
    p_OnGridAuditedLetter:
     'public/uploadImgs/1571287635041_file_銀鏈資產管理有限公司(正和製藥)-併聯審查意見書(無初細步協商) [FAX版].pdf',
    p_assetdocsHash: '',
    p_state: 'draft',
    p_RPT: '80',
    p_FRP: '10/08',
    p_PSD: '201910181600',
    p_FMXAdate: '2019-10-23 11:34:05 AM',
    p_TaiPowerApprovalDate: '201910050800',
    p_BOEApprovalDate: '201910250800',
    p_PVTrialOperationDate: '202001150800',
    p_PVOnGridDate: '201912310800',
    p_PANote: '',
    p_FMSNote: '',
    p_Image1: 'public/uploadImgs/1571366992648_image1_00-01.jpg',
    p_Image2: 'public/uploadImgs/1571287635146_image2_施作範圍-2.jpg',
    p_Image3: 'public/uploadImgs/1571287635178_image3_主建物施作範圍.jpg',
    p_Image4: 'public/uploadImgs/1571287635202_image4_主建物施作範圍-1.jpg',
    p_Image5: 'public/uploadImgs/1571287635234_image5_車棚空拍照.jpg',
    p_Image6: 'public/uploadImgs/1571366662168_image6_施作範圍-1.jpg',
    p_Image7:
     'public/uploadImgs/1571370557683_image7_銀鏈資產管理有限公司(正和製藥)-機電圖_01.jpg',
    p_Image8: '',
    p_Image9: '',
    p_Image10: '',
    p_fundingGoal: goal,
    p_abortedReason: '321321321',
    p_csvFIle:
     `public/uploadImgs/${symbol}.csv`,
    p_fundingType: type,
    p_paidNumber: "300",
    p_EPCname: '朝羿光電能源',
    p_pvSiteintro:
     '愛因斯坦一號案場位於台南市新營區, 平均年日照量達1,292小時以上。本場地為合格Pics藥廠, 結構與屋況保養皆優良。本場使用969片AUO 310W高效模組, 總裝置量300.39kw, 採股票上市公司逆變器等優質部件, 由具工程實績之EPC廠商責任施作、知名能源廠監工, 將帶給您最安心的長期報酬! HCAT電利超商首發產品, 具高達5.4%之20年內部報酬率(IRR), 好機會請勿錯過! ',
    p_ContractOut: '201907260800',
    p_CaseConstruction: '201912200800',
    p_ElectricityBilling: '201912310800',
    p_isNewCase: "2",
    p_NotarizedRentalContract: '',
    p_ForecastedAnnualIncomePerModule: "1",
    p_lockuptime: 201911010800

};

const generateCSV = async() => {
    let newCsv =  fs.createWriteStream(`\./public/uploadImgs/${symbol}.csv`);
    let file =  fs.createReadStream('test_CI/sample.csv')
    file.pipe(es.split())
        .pipe(
            es.mapSync(function(line) {
                if(line !== 'ia_SYMBOL,ia_time,ia_actualPaymentTime,ia_Payable_Period_End,ia_Annual_End,ia_wholecase_Principal_Called_back,ia_wholecase_Book_Value,ia_wholecase_Forecasted_Annual_Income,ia_wholecase_Forecasted_Payable_Income_in_the_Period,ia_wholecase_Accumulated_Income,ia_wholecase_Income_Recievable,ia_wholecase_Theory_Value,ia_single_Principal_Called_back,ia_single_Forecasted_Annual_Income,ia_single_Forecasted_Payable_Income_in_the_Period,ia_single_Actual_Income_Payment_in_the_Period,ia_single_Accumulated_Income_Paid,ia_single_Token_Market_Price,ia_assetRecord_status'){
                    line = symbol + line.substring(8)
                }
                if(line !== symbol){
                    console.log(line)
                    newCsv.write(line+'\n');
                }
            }))
}
generateCSV();
module.exports = {edit_product, add_product, symbol, total, goal, generateCSV, price, type};