const { promisify } = require("util")
const { google } = require("googleapis")
const redisClient = require("./redisClient")
const googleConfig = require("config").get("google")
const oauth2Client = new google.auth.OAuth2(googleConfig.clientId, googleConfig.clientSecret, "")
oauth2Client.setCredentials({ refresh_token: googleConfig.refreshToken })
const sheets = google.sheets({ version: "v4", auth: oauth2Client })
const valuesGetAsync = promisify(sheets.spreadsheets.values.get)
const spreadsheetId = googleConfig.sheetId

const promptTypes = {
  personal: {
    redisKey: "personal",
    sheetColumn: "A",
    cachedValues: []
  },
  work: {
    redisKey: "work",
    sheetColumn: "B",
    cachedValues: []
  }
}

function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function promptSheetRange(promptType) {
  const column = promptType.sheetColumn
  return `${column}2:${column}`
}

async function loadPromptsFromGoogleSheets(type) {
  const {
    data: { values }
  } = await valuesGetAsync({ spreadsheetId, range: promptSheetRange(type) })

  return [].concat.apply([], values)
}

async function loadPromptsFromRedis(type) {
  return redisClient.getCachedPrompts(type.redisKey)
}

async function cachePromptsInRedis(type, prompts) {
  return redisClient.cachePrompts(type.redisKey, prompts)
}

async function getPrompt(promptTypeName) {
  const promptType = promptTypes[promptTypeName]

  if (!promptType) {
    throw new Error(`Unknown prompt type ${promptTypeName}`)
  }

  if (promptType.cachedValues.length > 0) {
    return getRandom(promptType.cachedValues)
  }

  const fromRedis = await loadPromptsFromRedis(promptType)
  if (fromRedis.length > 0) {
    promptTypes[promptTypeName].cachedValues = fromRedis
    return getRandom(fromRedis)
  }

  const fromSheets = await loadPromptsFromGoogleSheets(promptType)
  await cachePromptsInRedis(promptType, fromSheets)
  promptTypes[promptTypeName].cachedValues = fromSheets
  return getRandom(fromSheets)
}

exports.getPersonalPrompt = async function getPersonalPrompt() {
  return getPrompt("personal")
}

exports.getWorkPrompt = async function getWorkPrompt() {
  return getPrompt("work")
}

module.exports = exports
