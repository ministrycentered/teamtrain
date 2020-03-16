const trainConfig = require("config").get("train")
const moment = require("moment")
require("moment-timezone")

const day = moment().tz("America/Los_Angeles").day()

if (!trainConfig.runDays.includes(day) && process.argv[3] !== "-f") {
  console.log("attempted to run scheduler, exiting because not a run day!")
  process.exit(0)
}
