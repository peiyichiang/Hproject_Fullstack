'use strict'

let logger = $('#logger');


let amount = $('#amount');
let o_IDs = [];
$(".order").each(function(){ o_IDs.push(this.value); });
let v_account =[];
$(".v_account").each(function(){ v_account.push(this.value); });
log(v_account)

//把log印在網頁上
function log(...inputs) {
	for (let input of inputs) {
		if (typeof input === 'object') {
			input = JSON.stringify(input, null, 2)
		}
		logger.html(input + '\n' + logger.html())
	}
}




	let JSONtoBank = JSON.stringify({
		amount: amount.val(),
		o_IDs: o_IDs
	})
	let o_IDsJSON = JSON.stringify({o_IDs: o_IDs, v_account: v_account})

