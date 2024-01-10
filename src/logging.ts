import pino from "pino"

const logger = pino({ level: Bun.env.LOG_LEVEL || 'info' })

console.log = (...data: any) => {
    if (typeof data[0] === "string") {
        return logger.info(data.slice(1), data[0])
    }
    return logger.info(data)
}

console.debug = (...data: any) => {
    if (typeof data[0] === "string") {
        return logger.debug(data.slice(1), data[0])
    }
    return logger.debug(data)
}

console.error = (...data: any) => {
    return logger.error(data)
}