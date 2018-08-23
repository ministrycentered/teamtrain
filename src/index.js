const redisClient = require("./redisClient")
const config = require("config")
const express = require("express")
const bodyParser = require("body-parser")
const fetch = require("node-fetch")
const http = require("http")
const https = require("https")

const app = express()
const slackConfig = config.get("slack")

app.start = async () => {
  const port = config.get("port")
  console.log("starting at server at port", port)
  app.set("port", port)
  app.use(bodyParser.json())

  const server = http.createServer(app)

  server.listen(port)
}

app.start()
