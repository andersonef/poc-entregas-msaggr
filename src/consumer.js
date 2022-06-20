const connector = require('./connector')
module.exports = (exchange, queue, callback) => {
    connector(async (channel) => {
        await channel.assertExchange(exchange, 'fanout', {durable: false})
        const q = await channel.assertQueue(queue, {
            exclusive: false
        })
        await channel.bindQueue(q.queue, exchange, '')
        channel.consume(q.queue, async (msg) => {
            console.log('Consuming message')
            if (msg.content) {
                await callback(channel, msg)
            }
        }, {
            noAck: false
        })
    })
}