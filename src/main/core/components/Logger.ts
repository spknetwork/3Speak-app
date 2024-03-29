import winston from 'winston'
import fs from 'fs'
import Path from 'path'
import DailyRotateFile from 'winston-daily-rotate-file'

export function MakeLogger(workingDirectory: string): winston.Logger {
  if (!fs.existsSync(workingDirectory)) {
    fs.mkdirSync(workingDirectory)
  }
  const Logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
      winston.format.printf((info) => {
        return `${info.timestamp} [${info.level}]: ${info.message}`
      }),
    ),
    defaultMeta: {},
    transports: [
      // - Write all logs with level `error` and below to `error.log`
      // - Write all logs with level `info` and below to `combined.log`
      new DailyRotateFile({
        filename: Path.join(workingDirectory, 'logs', 'error'),
        datePattern: 'YYYY-MM-DD',
        extension: '.log',
        level: 'error',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '31d',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
          winston.format.printf((info) => {
            if (info.jse_info) {
              info.jse_info = Object.values(info.jse_info).join('')
            }
            return `${info.timestamp} [${info.level}]: ${JSON.stringify(info)}`
          }),
        ),
      }),
      new winston.transports.DailyRotateFile({
        filename: Path.join(workingDirectory, 'logs', 'info'),
        datePattern: 'YYYY-MM-DD',
        extension: '.log',
        level: 'info',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '31d',
      }),
      new winston.transports.DailyRotateFile({
        filename: Path.join(workingDirectory, 'logs', 'verbose'),
        datePattern: 'YYYY-MM-DD',
        extension: '.log',
        level: 'verbose',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '31d',
      }),
    ],
  })

  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  if (process.env.NODE_ENV !== 'production') {
    Logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    )
  }
  Logger.info('Logger Starting Up')
  return Logger
}
