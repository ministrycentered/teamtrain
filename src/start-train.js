const redisClient = require("./redisClient")
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

  const reactionsResponse = await fetch(
    `https://slack.com/api/reactions.get?channel=${channel}&timestamp=${timestamp}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${slackConfig.railtie.token}`
      }
    }
  )

  const reactionJson = await reactionsResponse.json()
  if (!reactionJson.ok) {
    process.exit(1)
  }

  const reactionUsers = reactionJson.message.reactions
    .filter(emoji => emoji.name == "ticket")[0]
    .users.filter(user => user != "UCE34NAFQ") // remove bot user

  shuffle(reactionUsers)

  var group
  while (reactionUsers.length > 0) {
    console.log("tryna match")
    // create a group of 3 if odd number
    if (reactionUsers.length == 3) {
      group = reactionUsers.splice(0, 3).toString()
    } else {
      group = reactionUsers.splice(0, 2).toString()
    }

    fetch("https://slack.com/api/mpim.open", {
      method: "POST",
      body: JSON.stringify({ users: group }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${slackConfig.railtie.token}`
      }
    })
      .then(response => response.json())
      .then(json =>
        fetch("https://slack.com/api/chat.postMessage", {
          method: "POST",
          body: JSON.stringify({ channel: json.group.id, text: "Testing Testing, test 1 2 3!" }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${slackConfig.railtie.token}`
          }
        })
          .then(ok => ok.json())
          .then(success => (!success.ok ? process.exit(1) : success.toString()))
      )
  }
}

main().then(() => process.exit(0))
