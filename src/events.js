const EventBus = require('js-event-bus');
const { logger } = require('./log')

class Events {
    constructor(context, states) {
        this.context = { events: this, ...context }
        this.states = states
        this.bus = new EventBus()
    }

    register(plugin) {
        const name = plugin.name;
        // register update 
        if (plugin.onConfigUpdated) {
            this.bus.on('config.update', (config) => {
                logger.debug({ config }, 'got config update request')
                try {
                    plugin.onConfigUpdated(this.context, this.states[name], config)
                } catch (err) {
                    log.warn({ err, name: plugin.name }, 'fail to delivery new config to plugin')
                }
            })
        }
        // register message 
        if (plugin.accepts && plugin.onMessageReceived) {
            plugin.accepts.forEach(subject => {
                this.bus.on(subject, (...arg) => {
                    logger.debug({ config, state: this.states[name] }, 'got new message')
                    try {
                        plugin.onMessageReceived(this.context, this.states[name], ...arg)
                    } catch (err) {
                        log.warn({ err, name: plugin.name }, 'fail to delivery message to plugin')
                    }
                })
            })
        }
        // register name
        this.bus.on(plugin.name, () => {
            plugin.onMessageReceived(this.context, this.states[name])
        })
    }

    publish(subject, ...args) {
        this.bus.emit(subject, null, ...args)
    }

    updateConfig(config) {
        logger.debug({ config }, 'submit config update request')
        this.bus.emit('config.update', null, config)
    }
}

module.exports = { Events }