const {mysqlPoolQueryB} = require('../timeserver/mysql.js');

var fs = require('fs');

let result;
const deleteSymbol = async(symbol) => {
    await mysqlPoolQueryB('DELETE FROM product WHERE p_SYMBOL = ?', [symbol]);
    await mysqlPoolQueryB('DELETE FROM product_doc WHERE pd_SYMBOL = ?', [symbol]);
    await mysqlPoolQueryB('DELETE FROM product_editHistory WHERE pe_symbol = ?', [symbol]);
    await mysqlPoolQueryB('DELETE FROM smart_contracts WHERE sc_symbol = ?', [symbol]);
    await mysqlPoolQueryB('DELETE FROM order_list WHERE o_symbol = ?', [symbol]);
    await mysqlPoolQueryB('DELETE FROM investor_assetRecord WHERE ar_tokenSYMBOL = ?', [symbol]);
    await mysqlPoolQueryB('DELETE FROM income_arrangement WHERE ia_SYMBOL = ?', [symbol]);
    return true;
}
const myReadFile = async () => {
    return new Promise((resolve, reject) => {
        fs.readFile('./test_CI/random_symbol.txt', async function(err, data) {
            if(err){
                reject(err);
            }
            console.log(data.toString())
            resolve(data);
        })
    })
}


const main = async() => {
    let result = await myReadFile();
    if(result != undefined){
        console.log(result.toString());
        await deleteSymbol(result.toString()).then((res)=>{
            process.exit(0);
        })        
     }
   
}

main();
