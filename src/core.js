
const Events = require('./events');

const { logger } = require('./log')
const { config } = require('./config')

const { getPlugins } = require("./loader")
const {
    createScheduleTask,
    applySchedule,
} = require('./schedule')

async function main() {

    const plugins = getPlugins("../plugins")
    logger.info(`found plugins [${plugins.map(x => x.name).join(", ")}]`)

    const context = {}
    const states = {}

    plugins.forEach(p => { states[p.name] = {} })
    const events = new Events(context, states)
    // sync init
    const inits = plugins
        .filter(p => p.onConfigUpdated)
        .map(p => p.onInit(context, states[p.name]))
    await Promise.all(inits)
    // register
    logger.info("registering plugins ...")
    plugins.forEach(p => events.register(p))
    // update config 
    logger.info("updating config ...")
    events.updateConfig(config)
    // load
    logger.info("triggering loaded ...")
    plugins
        .filter(p => p.schedule)
        .map(p => createScheduleTask(p))
    // active
    logger.info("triggering activated ...")
    plugins
        .filter(p => p.onActivated)
        .map(p => p.onActivated(context, states[p.name], config))

    setInterval(applySchedule(events), 1000)
}

main().catch(console.log)