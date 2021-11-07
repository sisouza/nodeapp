const express = require("express");
const router = express.Router();
const AWS = require('aws-sdk');
require("dotenv").config();

//set your credentials
const SQSConfig = {
    secretAccessKey:secretAccessKey,
    accessKeyId:accessKeyId,
    region: "us-east-1"
}

AWS.config.update(SQSConfig);

const SQSinstance = new AWS.SQS()

/**
 * @param req
 * @param res
 * return a list of Queues
 */
router.get('/listQueue', (req, res) => {
    SQSinstance.listQueues(function (err, data) {
      if (err) {
          res.send(err);
      } else {
          res.send(data); 
      }      
    })
})

/**
 * @param req
 * queue_name: @String
 * @param res
 * return queueUrl
 */
router.get('/getQueue', (req, res) => {
    const { queue_name } = req.body;

    const params = {
        QueueName: queue_name
    };
    SQSinstance.getQueueUrl(params, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
})

/**
 * @param req
 * title: @String 
 * author: @String 
 * message: @String
 * queue_url: @String
 * @param res
 * return sent message id
 */
router.post('/send', function (req, res) {
    const { title, author, message, queue_url } = req.body

        const params = {
                DelaySeconds: 10,
                MessageAttributes: {
                    Title: {
                    DataType: "String",
                    StringValue: title
                    },
                    Author: {
                    DataType: "String",
                    StringValue: author
                    },
                },
                MessageBody: message,
                QueueUrl: queue_url
             }
    
    SQSinstance.sendMessage(params, function (err, data) {
            if (err) {
                return res.send(err)
            } else {
                const result = {
                    "id": data.MessageId,
                    "body": data.MessageBody
                }
                return res.send("Message sent:" + " " + "id:" + result.id)
            }
        });
    })

/**
 * @param req
 * queueUrl: @String 
 * max: @Int
 * @param res
 * return received messages 
 */
router.get('/receive', (req, res) => {
        const { queueUrl, max } = req.body;

        const params = {
            QueueUrl: queueUrl,
            VisibilityTimeout: 20,
            MaxNumberOfMessages: max,
            MessageAttributeNames: ["All"],
        }
    
        SQSinstance.receiveMessage(params, function (err, data) {
        
            if (err) {
                res.send(err)
            } else {
   
                 for (var i = 0; i < data.Messages.length; i++) {
                    var result = {
                        "id": data.Messages[i].MessageId,
                        "details": data.Messages[i].Body,
                        "receipt": data.Messages[i].ReceiptHandle
                    }
                }
                return res.json(
                    {
                        "status":"message received:",
                        "id:": result.id,
                        "message:":result.details,
                        "receipt:": result.receipt
                    })
            }
        });
    })

/**
 * @param req
 * queueUrl: @String 
 * receipt: @String
 * @param res
 * return details of deleted message
 */
router.get('/delete', (req, res) => {
        const { queueUrl, receipt } = req.body;

        const params = {
            QueueUrl: queueUrl,
            ReceiptHandle: receipt
        }

        SQSinstance.deleteMessage(params, function (err, data) {
            if (err) {
                res.send(err)
            } else {
                res.send(data)
            }
        })
    })

module.exports = router; 
