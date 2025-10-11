require('dotenv').config();

const AWS = require('aws-sdk');

const sns = new AWS.SNS({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const topic = process.env.TOPIC_ARN

function enviarPedido(mensaje) {
    const params = {
        Message: mensaje,
        TopicArn: topic
    }
    sns.publish(params, (err, data) =>{
        if (err) console.error("error enviando mensaje:", err)
        else console.log("mensaje enviado, id: ", data.MessageId)
    })
}

enviarPedido('Nuevo pedido de Rolex submariner')

