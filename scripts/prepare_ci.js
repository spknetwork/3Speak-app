// Do NOT execute this file in dev mode
const fs = require('fs')
const workPath = "src/consts.js"

var file = fs.readFileSync(workPath).toString()
file = file.replace("HIVESQL_USERNAME_FILLIN", `${process.env.hivesql_username}`)
file = file.replace("HIVESQL_PASSWORD_FILLIN", `${process.env.hivesql_password}`)
fs.writeFileSync(workPath, file)