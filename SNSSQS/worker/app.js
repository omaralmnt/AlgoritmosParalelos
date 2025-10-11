require('dotenv').config();
const AWS = require('aws-sdk');

const sqs = new AWS.SQS({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const QUEUE_URL = process.env.QUEUE_URL;

async function procesarMensajes() {
    const params = { QueueUrl: QUEUE_URL, MaxNumberOfMessages: 1, WaitTimeSeconds: 5 }

    try {
        const data = await sqs.receiveMessage(params).promise()

        if (data.Messages && data.Messages.length > 0) {
            for (const msg of data.Messages) {
                const body = JSON.parse(msg.Body)
                console.log("procesando:", body.Message)
                await sqs.deleteMessage({
                    QueueUrl: QUEUE_URL,
                    ReceiptHandle: msg.ReceiptHandle
                }).promise()
            }
            return true
        } else {
            console.log('No hay mensajes')
            return false
        }

    } catch (error) {
        console.error(`error procesando el mensaje: ${error}`)
        return false
    }
}

async function startWorker() {
    let mensajeProcesado = false
    while (!mensajeProcesado) {
        mensajeProcesado = await procesarMensajes()
        if (!mensajeProcesado) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }
    process.exit(0)
}

startWorker()
