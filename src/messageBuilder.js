const redisClient = require("./redisClient")
const slackClient = require("./slackClient")
const DEFAULT_ATTACHMENT = {
  pretext:
    "Time to board the train! Train departs NOW. You've got 15 minutes to converse with each other.",
  title: "Some conversation prompts to get you started (optional):",
  callback_id: "fetch_prompt",
  color: "#3AA3E3",
  attachment_type: "default",
  fields: [
    {
      value: ""
    },
    {
      value: ""
    }
  ],
  actions: [
    {
      name: "prompt",
      text: "I need another prompt",
      type: "button",
      value: "new_prompt"
    }
  ]
}

exports.buildAttachments = async function buildAttachments(payload, members = null) {
  let promptAttachment, whoCallsAttachment

  if (payload && payload.original_message) {
    promptAttachment = payload.original_message.attachments[0]
    whoCallsAttachment = payload.original_message.attachments[1]
  } else {
    promptAttachment = DEFAULT_ATTACHMENT
    if (members) {
      let filteredUsers = members.filter(user => user != "UCE34NAFQ")
      let user = filteredUsers[Math.floor(Math.random() * filteredUsers.length)]

      whoCallsAttachment = {
        title: "Start a Slack or Zoom call!",
        text: `<@${user}>, please initiate the call.`
      }
    }
  }

  let personalprompt = await getPersonalPrompt()
  let workprompt = await getWorkPrompt()
  promptAttachment.fields[0]["value"] = personalprompt
  promptAttachment.fields[1]["value"] = workprompt

  return [promptAttachment, whoCallsAttachment]
}

const { promisify } = require("util")
const { google } = require("googleapis")
const googleConfig = require("config").get("google")
const oauth2Client = new google.auth.OAuth2(googleConfig.clientId, googleConfig.clientSecret, "")
oauth2Client.setCredentials({ refresh_token: googleConfig.refreshToken })
const sheets = google.sheets({ version: "v4", auth: oauth2Client })
const valuesGetAsync = promisify(sheets.spreadsheets.values.get)

async function getPersonalPrompt() {
  const {
    data: { values }
  } = await valuesGetAsync({ spreadsheetId: googleConfig.sheetId, range: "A2:A" })

  return values[Math.floor(Math.random() * values.length)]
}

async function getWorkPrompt() {
  const {
    data: { values }
  } = await valuesGetAsync({ spreadsheetId: googleConfig.sheetId, range: "B2:B" })

  return values[Math.floor(Math.random() * values.length)]
}
