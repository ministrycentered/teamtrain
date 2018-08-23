import config from "config"
import redis from "redis"

const redisConfig = config.get("redis")
const client = redis.createClient(redisConfig.port, redisConfig.host)

const PREFIX = "railtie"
const CHANNEL_KEY = key("message-channel")
const TIMESTAMP_KEY = key("message-timestamp")

function key(name) {
  return `${PREFIX}-${name}`
}

export function setPrepMessageInfo(messageJson) {
  client
    .multi()
    .set(CHANNEL_KEY, messageJson.channel)
    .set(TIMESTAMP_KEY, messageJson.ts)
    .exec()
}

export async function getPrepMessageInfo() {
  return new Promise((resolve, reject) => {
    client
      .multi()
      .get(CHANNEL_KEY)
      .get(TIMESTAMP_KEY)
      .exec((err, replies) => {
        err ? reject(err, replies) : resolve(replies)
      })
  }).then(([channel, timestamp]) => ({ channel, timestamp }))
}

export default exports
