const bunyan = require('bunyan');
var parser = require('cron-parser');
const { logger } = require('./log')

let taskId = 0
let tasks = {}
let schedules = []

function createScheduleTask(plugin) {
    const cronTask = {
        interval: parser.parseExpression(plugin.schedule),
        name: plugin.name,
        plugin: plugin,
    }
    tasks[taskId] = cronTask
    schedules.push({
        next: cronTask.interval.next().toDate().getTime(),
        id: taskId
    })
    taskId++
}

function applySchedule(events) {
    return () => {
        const now = Date.now()
        schedules
            .filter(x => now >= x.next)
            .forEach(x => {
                logger.info(x, 'cron task triggered')
                events.publish(tasks[x.id].plugin.name)
            })
        schedules
            .map(x => {
                if (now >= x.next) {
                    x.next = tasks[x.id].interval.next().toDate().getTime()
                }
                return x
            })
    }
}

module.exports = {
    createScheduleTask,
    applySchedule,
}