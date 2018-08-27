const { promisify } = require("util")
const { google } = require("googleapis")
const redisClient = require("./redisClient")
const googleConfig = require("config").get("google")
const oauth2Client = new google.auth.OAuth2(googleConfig.clientId, googleConfig.clientSecret, "")
oauth2Client.setCredentials({ refresh_token: googleConfig.refreshToken })
const sheets = google.sheets({ version: "v4", auth: oauth2Client })
const valuesGetAsync = promisify(sheets.spreadsheets.values.get)
const spreadsheetId = googleConfig.sheetId

exports.getPersonalPrompt = async function getPersonalPrompt() {
  const {
    data: { values }
  } = await valuesGetAsync({ spreadsheetId, range: "A2:A" })

  return values[Math.floor(Math.random() * values.length)]
}

exports.getWorkPrompt = async function getWorkPrompt() {
  const {
    data: { values }
  } = await valuesGetAsync({ spreadsheetId, range: "B2:B" })

  return values[Math.floor(Math.random() * values.length)]
}

module.exports = exports
