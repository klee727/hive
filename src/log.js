const bunyan = require('bunyan');

// name: string;
// streams?: Stream[] | undefined;
// level?: LogLevel | undefined;
// stream?: NodeJS.WritableStream | undefined;
// serializers?: Serializers | undefined;
// src?: boolean | undefined;
// [custom: string]: any;

const logger = bunyan.createLogger({
    name: 'hive',
    level: 'info',
});


module.exports = { logger }