
const winston = require('winston');
const Path = require('path');
const fs = require('fs');
require('winston-daily-rotate-file');

module.exports = function (workingDirectory) {
    if (!fs.existsSync(workingDirectory)) {
        fs.mkdirSync(workingDirectory)
    }
    const Logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
            winston.format.printf(
                info => {
                    console.log(info)
                    return `${info.timestamp} [${info.level}]: ${info.message}`
                }
            )
        ),
        defaultMeta: {},
        transports: [
            // - Write all logs with level `error` and below to `error.log`
            // - Write all logs with level `info` and below to `combined.log`
            new winston.transports.DailyRotateFile({
                filename: Path.join(workingDirectory, 'logs', "error"),
                name: "log",
                datePattern: 'YYYY-MM-DD',
                extension: ".log",
                level: 'error',
                format: winston.format.combine(
                    winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
                    winston.format.printf(
                        info => {
                            console.log(info)
                            if(info.jse_info) {
                                info.jse_info = Object.values(info.jse_info).join("")
                            }
                            return `${info.timestamp} [${info.level}]: ${JSON.stringify(info)}`
                        }
                    )
                ),
            }),
            new winston.transports.DailyRotateFile({
                filename: Path.join(workingDirectory, 'logs', "info"),
                name: "log",
                datePattern: 'YYYY-MM-DD',
                extension: ".log",
                level: 'info'
            }),
            new winston.transports.DailyRotateFile({
                filename: Path.join(workingDirectory, 'logs', "verbose"),
                name: "log",
                datePattern: 'YYYY-MM-DD',
                extension: ".log",
                level: 'verbose'
            })
        ]
    });

    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    if (process.env.NODE_ENV !== 'production') {
        Logger.add(new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.simple()
            ),
        }));
    }
    Logger.info("Logger Starting Up")
    return Logger;
}
