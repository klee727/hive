const bunyan = require('bunyan');

const meta = {
    name: 'blockwatcher',
    version: 'v0.0.1',
    schedule: '*/10 * * * * *',
    outputs: [],
}

const logger = bunyan.createLogger({
    name: meta.name,
    level: 'debug',
});

const handler = {
    onInit: async (context, state) => {
        logger.info(`${meta.name} init`)
    },
    onConfigUpdated: async (context, state, config) => {
    },
    onMessageReceived: async (context, state, msg) => {
        console.log("message received", context, state, msg)
    },
}

module.exports = {
    ...meta,
    ...handler,
}