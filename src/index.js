const redisClient = require("./redisClient")
const slackClient = require("./slackClient")
const msgBuilder = require("./messageBuilder")
const config = require("config")
const express = require("express")
const bodyParser = require("body-parser")
const fetch = require("node-fetch")
const http = require("http")
const https = require("https")

const app = express()
const slackConfig = config.get("slack")

app.start = async () => {
  const port = process.env.PORT || config.get("port")
  console.log("starting at server at port", port)
  app.set("port", port)
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())

  const server = http.createServer(app)

  app.post("/callback", function (req, res) {
    const payload = JSON.parse(req.body.payload)

    if (payload.token === slackConfig.teamtrain.verificationToken) {
      res.writeHead(200, { "Content-Type": "application/json" })
      processCallback(payload)
    } else {
      res.writeHead(403, { "Content-Type": "text/plain" })
      res.end()
      throw new Error("token not verified")
    }

    res.end()
  })

  server.listen(port)
}

function processCallback(payload) {
  let attachments = msgBuilder.buildAttachments(payload)
  slackClient.updateMessage({
    channel: payload.channel.id,
    ts: payload.message_ts,
    attachments: attachments
  })
}

app.start()
