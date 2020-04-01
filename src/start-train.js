require("./runDays")

const redisClient = require("./redisClient")
const slackClient = require("./slackClient")
const messageBuilder = require("./messageBuilder")
const fetch = require("node-fetch")
const slackConfig = require("config").get("slack")
const trainConfig = require("config").get("train")

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

async function sendRequest(groupChannel) {
  console.log("Concurrent sendRequest: " + groupChannel.group.id)
  const attachments = await messageBuilder.buildAttachments(null, groupChannel.group.members)
  return slackClient.postMessage({
    channel: groupChannel.group.id,
    attachments: attachments
  })
}

async function main() {
  const { channel, timestamp } = await redisClient.getPrepMessageInfo()

  console.log({ channel, timestamp })

  try {
    const reactionJson = await slackClient.getReactions({ channel, timestamp })

    const reactionUsers = reactionJson.message.reactions
      .filter(emoji => emoji.name == "ticket")[0]
      .users.filter(user => user != "UCE34NAFQ") // remove bot user

    shuffle(reactionUsers)

    var group,
      groups = []
    while (reactionUsers.length > 0) {
      if (reactionUsers.length < trainConfig.groupSize) {
        group = reactionUsers.splice(0, reactionUsers.length).toString()
      } else {
        group = reactionUsers.splice(0, trainConfig.groupSize).toString()
      }

      const groupChannel = await slackClient.openGroup(group)
      groups.push(groupChannel)
    }

    var promises = []
    for (let i = 0; i < groups.length; i++) {
      let promise = new Promise(async function(resolve, reject) {
        let json = await sendRequest(groups[i])
        if (json.ok) {
          resolve({ ok: json.ok, groupChannelId: groups[i].channel.id })
        } else {
          // possibly add in a retry for failed groups?
          reject({ ok: json.ok, groupChannelId: groups[i].channel.id })
        }
      })

      promises.push(promise)
    }

    await Promise.all(promises).then(values => {
      console.log(values)
    })
  } catch (e) {
    console.log('something went wrong!')
    console.log(e)
  }
}

main().then(() => process.exit(0))
