const config = require("config")
const redis = require("redis")

const redisConfig = config.get("redis")
const client = redis.createClient(redisConfig.redisUrl)

const PREFIX = "teamtrain"
const CHANNEL_KEY = key("message-channel")
const TIMESTAMP_KEY = key("message-timestamp")

function key(...names) {
  return `${PREFIX}-${names.join("-")}`
}

function promise(doTheWork) {
  return new Promise((resolve, reject) => {
    doTheWork((err, reply) => (err ? reject(err, reply) : resolve(reply)))
  })
}

exports.setPrepMessageInfo = function setPrepMessageInfo(messageJson) {
  return promise(done => {
    client
      .multi()
      .set(CHANNEL_KEY, messageJson.channel)
      .set(TIMESTAMP_KEY, messageJson.ts)
      .exec(done)
  })
}

exports.getPrepMessageInfo = async function getPrepMessageInfo() {
  return promise(done => {
    client
      .multi()
      .get(CHANNEL_KEY)
      .get(TIMESTAMP_KEY)
      .exec(done)
  }).then(([channel, timestamp]) => ({ channel, timestamp }))
}

exports.cachePrompts = async function cachePrompts(promptType, prompts) {
  return promise(done => {
    const myKey = key("prompts", promptType)
    client
      .multi()
      .del(myKey)
      .lpush(myKey, ...prompts)
      .expire(myKey, 30 * 60)
      .exec(done)
  })
}

exports.getCachedPrompts = async function getCachedPrompts(promptType) {
  const myKey = key("prompts", promptType)

  return promise(done => client.lrange(key, 0, -1, done))
}

module.exports = exports
