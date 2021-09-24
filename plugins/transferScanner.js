const ethers = require("ethers")
const bunyan = require('bunyan');

const meta = {
    name: 'blockwatcher',
    version: 'v0.0.1',
    schedule: '*/5 * * * * *', // crontab
    storage: 'file', // memory, file, redis
}

const logger = bunyan.createLogger({
    name: meta.name,
    level: 'debug',
});

const SCAN_STEP = 50_000
const TRANSFER_EVENT_ID = ethers.utils.id("Transfer(address,address,uint256)")
const ARBITRUM_RPC_ENDPOINT = process.env['ARBITRUM_RPC_ENDPOINT']
const VALUE_CAPTURE = process.env['VALUE_CAPTURE']

const handler = {
    onInit: async (context, state) => {
        logger.info(`${meta.name} init`)
    },
    onConfigUpdated: async (context, state, config) => {

    },
    onMessageReceived: async (context, state, msg) => {
        // console.log("message received", context, state, msg)
        const last = await state.get('last', 1)
        const knownTokens = await state.get('tokens', [])
        logger.info({ last }, "continue from last reached block")

        // get latest block number
        const provider = new ethers.providers.JsonRpcProvider(ARBITRUM_RPC_ENDPOINT)
        const current = await provider.getBlockNumber()
        if (last >= current) {
            return
        }
        logger.info({ from: last, to: current }, 'ready to scan')

        let tokens = knownTokens
        let begin = last + 1
        let end = Math.min(begin + SCAN_STEP, current)
        while (begin <= end) {
            logger.info({ from: last, to: current }, 'partially scanning')
            const result = await scanFroNewReceivedERC20(provider, VALUE_CAPTURE, begin, end)
            tokens = tokens.concat(result)
            await state.set('last', end)
            await state.set('tokens', tokens)

            begin = end + 1
            end = Math.min(begin + SCAN_STEP, current)
        }
    },
}

async function scanFroNewReceivedERC20(provider, recipient, fromBlock, toBlock) {
    const filter = {
        topics: [
            [TRANSFER_EVENT_ID],
            [],
            [ethers.utils.hexlify(ethers.utils.zeroPad(recipient, 32))]
        ],
        fromBlock,
        toBlock,
    };
    const transferringEvents = await provider.getLogs(filter);
    return transferringEvents.map(v => v.address)
}

module.exports = {
    ...meta,
    ...handler,
}