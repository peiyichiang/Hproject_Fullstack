const amqp = require('amqplib/callback_api');
const { wlogger } = require('../ethereum/contracts/zsetupData');
const { updateExpiredOrders, updateFundingStateFromDB, updateTokenStateFromDB, addAssetbooksIntoCFC, makeOrdersExpiredCFED } = require('./blockchain.js');
const { Q_host } = require('../timeserver/envVariables');


function addAssetbooksIntoCFCConsumer() {
    //開啟consumer
    amqp.connect(`amqp://localhost`, function (err, conn) {

        if(err){
            throw err;
        }
        name = "addAssetbooksIntoCFCConsumer";
        conn.createChannel(function (err, ch) {
            let q = 'timeserver'

            //assert exchange
            ch.assertExchange(q, 'direct', { durable: true })

            //assert queue
            ch.assertQueue(q, { durable: true }, function (err, q) {
                //bind exchange-queue
                ch.bindQueue(q.queue, 'timeserver', 'addAssetbooksIntoCFC')
            })

            //ack之後才接收下一個msg
            ch.prefetch(1)

            wlogger.info(" [*]  " + name + " waiting for messages in ", q)

            //consume
            ch.consume(q, function (msg) {
                wlogger.info(msg.fields.routingKey);
                wlogger.info(" [*]  " + name + " consumes this message : " + msg.content.toString())

                addAssetbooksIntoCFC(msg.content.toString())
                    .then(() => {
                        ch.ack(msg);
                    })
                    .catch((err) => {
                        wlogger.error(`[Error @ addAssetbooksIntoCFC]: ${err}`);
                        ch.ack(msg);
                    });

            }, { noAck: false })
        })
    })
}

addAssetbooksIntoCFCConsumer();