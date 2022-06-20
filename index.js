const { PrismaClient } = require("@prisma/client");
const consumer = require("./src/consumer");
const producer = require("./src/producer");
const inputExchange = 'events__shipment_created'
const outputExchange = 'events__ms_aggr_output'

require('dotenv').config()
const prisma = new PrismaClient()

consumer(inputExchange, async (channel, msg) => {
    try {
        console.log('chegou no consumer...')
        const updatedShipment = JSON.parse(msg.content.toString())
        let destinationAggregated = await prisma.destinationAgregated.findUnique({
            where: { zipCode: updatedShipment.zipDestination },
        })

        if (!destinationAggregated) {
            destinationAggregated = await prisma.destinationAgregated.create({
                data: {
                    zipCode: updatedShipment.zipDestination
                }
            })
        }

        const shipment = await prisma.shipment.create({
            data: {
                zipCode: updatedShipment.zipDestination,
                shipmentCost: parseFloat(updatedShipment.shipmentCost),
                volumesQty: parseInt(updatedShipment.volumesQty),
                destinationAggregatedId: destinationAggregated.id
            }
        })

        await prisma.destinationAgregated.update({
            where: { zipCode: updatedShipment.zipDestination },
            data: {
                totalCost: destinationAggregated.totalCost + shipment.shipmentCost,
                qtyVolumesSameDestination: destinationAggregated.qtyVolumesSameDestination + shipment.volumesQty,
                qtyShipmentsSameDestination: destinationAggregated.qtyShipmentsSameDestination + 1
            }
        })

        producer(outputExchange, destinationAggregated)
        channel.ack(msg)
    } catch (e) {
        console.error('ERROR: ', e)
        channel.nack(msg)
    }

})