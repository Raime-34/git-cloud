'use strict'

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file')
const { app } = require('electron')
const path = require('path')
const fs = require('fs');
const moment = require('moment')

const logsDir = path.join(app.getPath('userData'), 'logs')

const logPrefix = "gitcloud-"
const logSuffix = ".log"
const transport = new DailyRotateFile({
  dirname: logsDir,              
  filename: `${logPrefix}%DATE%${logSuffix}`,
  datePattern: 'YYYY-MM-DD',     
  maxFiles: '7d',                
  zippedArchive: false,          
})
const l = winston.createLogger({
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

function parseLogLine(line) {
    const match = line.match(/^(\S+)\s+\[(\w+)\]\s+(.*)$/)
    if (!match) {
        return { time: null, type: null, data: line, error: null }
    }

    const [, time, type, message] = match
    let data = message
    let error = null

    try {
        const parsed = JSON.parse(message)
        if (parsed && typeof parsed === 'object' && ('data' in parsed || 'error' in parsed)) {
            data = parsed.data ?? null
            error = parsed.error ?? null
        } else {
            data = parsed
        }
    } catch {
        // обычная строка — остаётся в data
    }

    return { time, type, data, error }
}

const logger = {
    meta: {},
    info(log) {
        const key = `gitcloud-${moment().format('YYYY-MM-DD')}.log`;
        this.meta[key] = ((this.meta[key]) ?? 0) + 1;
        l.info(typeof log === 'string' ? log : JSON.stringify(log));
    },
    saveMeta() {
        fs.writeFile(path.join(logsDir, "logsMeta.json"), JSON.stringify(this.meta), () => {});
    },
    async getLogs(offset = 0, limit = 50) {
        const files = Object.keys(this.meta).sort((a, b) => b.localeCompare(a))
        const result = []
        let remainingSkip = offset

        let removedLogs = []

        for (const file of files) {
            if (result.length >= limit) break

            const count = this.meta[file] ?? 0
            if (count === 0) continue

            if (remainingSkip >= count) {
                remainingSkip -= count
                continue
            }

            const logPath = path.join(logsDir, file)
            let content
            try {
                content = await fs.promises.readFile(logPath, 'utf8')
            } catch (err) {
                if (err.code == 'ENOENT') {
                    removedLogs.push(file)
                    continue
                }
            }
            const lines = content.split(/\r?\n/).filter((line) => line.length > 0)
            // в файле строки от старых к новым → для offset «с самых свежих» разворачиваем
            lines.reverse()

            const from = remainingSkip
            remainingSkip = 0
            const need = limit - result.length
            result.push(...lines.slice(from, from + need).map(parseLogLine))
        }

        removedLogs.forEach(file => {
            delete this.meta[file]
        });
        this.saveMeta()

        return result
    }
}
function loadLogsMeta() {
    fs.readFile(path.join(logsDir, "logsMeta.json"), (err, data) => {
        if (data) {
            logger.meta = JSON.parse(data);
        }
    })
}
loadLogsMeta()

module.exports = { logger }