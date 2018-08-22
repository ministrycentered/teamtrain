import config from 'config'
import express from 'express'
import bodyParser from 'body-parser'

import fetch from 'node-fetch'

import http from 'http'
import https from 'https'

const app = express()
const slackConfig = config.get('slack')

app.start = async () => {
  const port = config.get('port')
  app.set('port', port)
  app.use(bodyParser.json())

  const server = http.createServer(app)

  app.post("/event", (req, res) => {
    res.writeHead(200, {"Content-Type": "text/plain"})
    const response = req.body
    if (response.token === slackConfig.railtie.verificationToken) {
      res.end(response.challenge)
    } else {
      res.end("not verified")
    }
  })

  app.get('/', (req, res) => {
    res.end("hooray! it works!")
  })

  // entrance from cron?
  app.post("/postMessage", async (req, res) => {
    // TODO: verify sender before we do anything with Slack
    const mainMessageBody = {
      channel: slackConfig.railtie.channel,
      text: 'All aboard! The train departs at 1:30 PM Pacific Time. Grab your :ticket: to join this train.'
    }

    const postMessageResponse = await fetch("https://slack.com/api/chat.postMessage", {
      method: 'POST',
      body: JSON.stringify(mainMessageBody),
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${slackConfig.railtie.token}` }
    })

    const messageJson = await postMessageResponse.json()

    if (!messageJson.ok) {
      res.end(messageJson.error)
      return
    }

    const reactionAddBody = {
      channel: messageJson.channel,
      timestamp: messageJson.ts,
      name: "ticket"
    }

    const reactionResponse = await fetch("https://slack.com/api/reactions.add", {
      method: 'POST',
      body: JSON.stringify(reactionAddBody),
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${slackConfig.railtie.token}` }
    })

    const reactionJson = await reactionResponse.json()

    if (!reactionJson.ok) {
      res.end(reactionJson.error)
      return
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(reactionJson.ok.toString())
  })

  server.listen(port)
}

app.start()

export default app
