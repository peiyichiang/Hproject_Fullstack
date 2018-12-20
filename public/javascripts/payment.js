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
let o_id = $('#o_id');

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
	//log(amount1)
	log('submit to bank..');
	$.post('/paymentGW/POST/postToBank', {
		name: name.val(),
		card_no1: card_no1.val(),
		card_no2: card_no2.val(),
		card_no3: card_no3.val(),
		card_no4: card_no4.val(),
		securityCode: securityCode.val(),
		month: month.val(),
		year: year.val(),
		amount: amount.val(),
		o_id: o_id.val()
	}, function (result) {
		log(result)
		if (result.bank == true) {
			log('付款成功')
			$.post('/paymentGW/POST/updateOrder', {
				o_id: o_id.val()
			}, function (result) {
				log(result)
			})
		}
		else {
			log('付款失敗')
		}

	})
})
