require("./runDays")

const moment  = require("moment")
const redisClient = require("./redisClient")
const fetch = require("node-fetch")
const slackConfig = require("config").get("slack")
const slackClient = require("./slackClient")

// 1:30pm
const departureTime = moment(process.argv[2], "h:mma").tz("America/Los_Angeles")

if (!departureTime.isValid()) {
  console.log("Departure time is required. Example: 1:30pm")
  process.exit(1)
}

if (departureTime.isBefore(moment())) {
  console.log(`Departure time (${departureTime.format("h:mma")}) must be after right now`)
  process.exit(1)
}

console.log("🚂 will depart at", departureTime.format("h:mma"))

async function main() {
  const messageJson = await slackClient.postMessage({
    channel: slackConfig.teamtrain.channel,
    text: `All aboard! The train departs at ${departureTime.format(
      "h:mma z"
    )}. Grab your :ticket: to join this train.`
  })

  redisClient.setPrepMessageInfo(messageJson)

  await slackClient.addReaction({
    channel: messageJson.channel,
    timestamp: messageJson.ts,
    name: "ticket"
  })
}

main().then(() => process.exit(0))
