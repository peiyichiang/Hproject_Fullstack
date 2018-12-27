'use strict'

let logger = $('#logger');


let amount = $('#amount');
let o_IDs = [];
$(".order").each(function(){ o_IDs.push(this.value); });
let v_account = $('#v_account');
log(v_account.val())

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
	let o_IDsJSON = JSON.stringify({o_IDs: o_IDs})


	$.post('/paymentGW/POST/sendTransferInfoMail', {
		o_IDs: o_IDsJSON,
		v_account: v_account.val()
	})

	$.post('/paymentGW/POST/bindOrder', {
		o_IDs: o_IDsJSON,
		v_account: v_account.val()
	}, function (result) {
		log(result)
	})
