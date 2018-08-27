const config = require("config")
const redis = require("redis")

const redisConfig = config.get("redis")
const client = redis.createClient(redis.redisUrl)

const PREFIX = "railtie"
const CHANNEL_KEY = key("message-channel")
const TIMESTAMP_KEY = key("message-timestamp")

function key(name) {
  return `${PREFIX}-${name}`
}

exports.setPrepMessageInfo = function setPrepMessageInfo(messageJson) {
  client
    .multi()
    .set(CHANNEL_KEY, messageJson.channel)
    .set(TIMESTAMP_KEY, messageJson.ts)
    .exec()
}

exports.getPrepMessageInfo = async function getPrepMessageInfo() {
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

module.exports = exports
