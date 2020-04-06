const hb = require('handlebars')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

async function generateSwiftUI(styles, outputFolder) {
    return readFile(__dirname + `/template.hb.swift`)
        .then(src => {
            const text = src.toString()
            const template = hb.compile(text)
            const output = template(styles)
            return writeFile(outputFolder + `/GeneratedStylist.swift`, output)
        })
        .then(_ => {
            console.log("\n    🎉 Swift has been generated:\n       " + outputFolder + "\n\n")
        })
}

module.exports = { generateSwiftUI: generateSwiftUI }