import config from 'config'
import express from 'express'
import bodyParser from 'body-parser'

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

  server.listen(port)
}

app.start()

export default app
