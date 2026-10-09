'use strict'

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file')
const { app } = require('electron')
const path = require('path')

const logsDir = path.join(app.getPath('userData'), 'logs')

const transport = new DailyRotateFile({
  dirname: logsDir,              
  filename: 'gitcloud-%DATE%.log',
  datePattern: 'YYYY-MM-DD',     
  maxFiles: '7d',                
  zippedArchive: false,          
})
const logger = winston.createLogger({
  level: 'info', 
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}] ${message}`
    })
  ),
  transports: [
    transport
  ],
})

module.exports = { logger }