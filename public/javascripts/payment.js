'use strict'

let logger = $('#logger');

let name = $('#name');
let card_no1 = $('#card_no1');
let card_no2 = $('#card_no2');
let card_no3 = $('#card_no3');
let card_no4 = $('#card_no4');
let securityCode = $('#securityCode');
let month = $('#month');
let year = $('#year');
let submit = $('#submit');

let amount = $('#amount');
let o_IDs = [];
$(".order").each(function(){ o_IDs.push(this.value); });
//log(o_IDs);

//把log印在網頁上
function log(...inputs) {
	for (let input of inputs) {
		if (typeof input === 'object') {
			input = JSON.stringify(input, null, 2)
		}
		logger.html(input + '\n' + logger.html())
	}
}


submit.on('click', function () {

	let JSONtoBank = JSON.stringify({
		name: name.val(),
		card_no1: card_no1.val(),
		card_no2: card_no2.val(),
		card_no3: card_no3.val(),
		card_no4: card_no4.val(),
		securityCode: securityCode.val(),
		month: month.val(),
		year: year.val(),
		amount: amount.val(),
		o_IDs: o_IDs
	})
	let o_IDsJSON = JSON.stringify({o_IDs: o_IDs})

	log('submit to bank..');
	log(JSONtoBank)

	$.post('/paymentGW/POST/postToBank',{JSONtoBank: JSONtoBank}, function (result) {
		log(result)
		//核對真實刷卡金額，確認銀行刷卡成功
		if (result.bank == true && result.amount == amount.val()) {
			log('付款成功')
			$.post('/paymentGW/POST/updateOrder', {
				o_IDs: o_IDsJSON
			}, function (result) {
				log(result)
			})
			$.post('/paymentGW/POST/sendPayedMail', {
				o_IDs: o_IDsJSON
			})
		}
		else {
			log('付款失敗')
		}

	})
})
