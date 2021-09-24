
const dotenv = require('dotenv')
dotenv.config('.env')

const { Events } = require('./events');

const { logger } = require('./log')
const { config } = require('./config')

const { getPlugins } = require("./loader")
const { createScheduleTask, applySchedule } = require('./schedule')
const { stateWrapper } = require('./state')

async function main() {

    const plugins = getPlugins("../plugins")
    logger.info(`found plugins [${plugins.map(x => x.name).join(", ")}]`)

    const context = {}
    const states = {}
    plugins
        .map(p => states[p.name] = stateWrapper(p.name, p.storage || 'memory'))
    const events = new Events(context, states)
    // sync init
    await Promise.all(plugins
        .filter(p => p.onConfigUpdated)
        .map(p => p.onInit(context, states[p.name]))
    )
    // register
    logger.info("registering plugins ...")
    plugins
        .forEach(p => events.register(p))
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