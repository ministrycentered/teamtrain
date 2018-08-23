const redisClient = require("./redisClient")
const fetch = require("node-fetch")
const slackConfig = require("config").get("slack")
const moment = require("moment")
require("moment-timezone")

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

const mainMessageBody = {
  channel: slackConfig.railtie.channel,
  text: `All aboard! The train departs at ${departureTime.format(
    "h:mma z"
  )}. Grab your :ticket: to join this train.`
}

async function main() {
  const postMessageResponse = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    body: JSON.stringify(mainMessageBody),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${slackConfig.railtie.token}`
    }
  })

  const messageJson = await postMessageResponse.json()

  if (!messageJson.ok) {
    process.exit(1)
  }

  const reactionAddBody = {
    channel: messageJson.channel,
    timestamp: messageJson.ts,
    name: "ticket"
  }

  redisClient.setPrepMessageInfo(messageJson)

  const reactionResponse = await fetch("https://slack.com/api/reactions.add", {
    method: "POST",
    body: JSON.stringify(reactionAddBody),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${slackConfig.railtie.token}`
    }
  })

  const reactionJson = await reactionResponse.json()

  if (!reactionJson.ok) {
    process.exit(1)
  }
}

main().then(() => process.exit(0))
