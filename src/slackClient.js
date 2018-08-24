const fetch = require("node-fetch")
const slackConfig = require("config").get("slack")

const BASE_URL = "https://slack.com/api"

async function apiRequest({ route, method = "GET", body }) {
  const response = await fetch(`${BASE_URL}/${route}`, {
    method,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${slackConfig.railtie.token}`
    }
  })

  const json = await response.json()

  if (!json.ok) {
    throw new Error("message not ok!")
  }

  return json
}

exports.postMessage = async function postMessage(body) {
  return apiRequest({ method: "POST", route: "chat.postMessage", body })
}

exports.addReaction = async function addReaction(body) {
  return apiRequest({ method: "POST", route: "reactions.add", body })
}

exports.getReactions = async function getReactions({ channel, timestamp }) {
  return apiRequest({ route: `reactions.get?channel=${channel}&timestamp=${timestamp}` })
}

exports.openGroup = async function openGroup(users) {
  return apiRequest({ route: "mpim.open", method: "POST", body: { users } })
}

module.exports = exports
