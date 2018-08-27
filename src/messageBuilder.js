const slackClient = require("./slackClient")
const DEFAULT_ATTACHMENT = {
  "pretext": "Time to board the train! Train departs NOW. Please start a Slack or Zoom call and chat with each other for 15 minutes.",
  "title": "Some conversation prompts to get you started (optional):",
  "callback_id": "fetch_prompt",
  "color": "#3AA3E3",
  "attachment_type": "default",
  "fields": [
    {
      "value": ""
    },
    {
      "value": ""
    }
  ],
  "actions": [
    {
      "name": "prompt",
      "text": "I need another prompt",
      "type": "button",
      "value": "new_prompt"
    }
  ]
}

exports.buildAttachments = function buildAttachments(payload) {
  let attachment

  if (payload.original_message) {
    attachment = payload.original_message.attachments[0]
  } else {
    attachment = DEFAULT_ATTACHMENT
  }

  let personalprompt = getPersonalPrompt()
  let workprompt = getWorkPrompt()
  attachment.fields[0]["value"] = personalprompt
  attachment.fields[1]["value"] = workprompt

  return [attachment]
}

// TODO: The following functions are standalones to test the replace message
// functionaliy. This will need to be replaced and built out using prompts doc
function getPersonalPrompt() {
  var arr = [
    "If you didn’t have to sleep, what would you do with the extra time?",
    "What fictional place would you most like to go?",
    "What’s the farthest you’ve ever been from home?",
    "If you had the ability to compete in any Olympic event, which one would you choose to enter?",
    "If you won $2 million tomottow, what are the first three things you think you'd do or buy as soon as you had the money?",
    "If you were completely blind but could somehow see for just one hour each month, how would you most often spend that time?",
    "What is your favorite saying or quotation?"
  ]

  return arr[Math.floor(Math.random() * arr.length)]
}

function getWorkPrompt() {
  var arr = [
    "Where did you work before Planning Center?",
    "How long have you worked at Planning Center?",
    "What's on your desk right now?"
  ]

  return arr[Math.floor(Math.random() * arr.length)]
}
