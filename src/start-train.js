const redisClient = require("./redisClient")
const slackClient = require("./slackClient")
const fetch = require("node-fetch")
const slackConfig = require("config").get("slack")

function shuffle(array) {
  var i = 0,
    j = 0,
    temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

async function main() {
  const { channel, timestamp } = await redisClient.getPrepMessageInfo()

  console.log({ channel, timestamp })

  const reactionJson = await slackClient.getReactions({ channel, timestamp })

  const reactionUsers = reactionJson.message.reactions
    .filter(emoji => emoji.name == "ticket")[0]
    .users.filter(user => user != "UCE34NAFQ") // remove bot user

  shuffle(reactionUsers)

  var group
  while (reactionUsers.length > 0) {
    // create a group of 3 if odd number
    if (reactionUsers.length == 3) {
      group = reactionUsers.splice(0, 3).toString()
    } else {
      group = reactionUsers.splice(0, 2).toString()
    }

    const groupChannel = await slackClient.openGroup(group)
    // TODO these posts should happen in parallel please
    await slackClient.postMessage({
      channel: groupChannel.group.id,
      text: "Testing Testing, test 1 2 3!"
    })
  }
}

main().then(() => process.exit(0))
