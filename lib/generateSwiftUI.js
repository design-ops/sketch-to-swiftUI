
import hb from 'handlebars'
import { readFile, writeFile } from 'fs'
import util from 'util'

const promiseReadFile = util.promisify(readFile)
const promiseWriteFile = util.promisify(writeFile)

export const generateSwiftUI = async (styles, outputFolder) => {
    const src = await promiseReadFile(__dirname + `/template.hb.swift`)
    const text = src.toString()
    const template = hb.compile(text)
    const output = template(styles)
    await promiseWriteFile(outputFolder + `/GeneratedStylist.swift`, output)
    console.log("\n    🎉 Swift has been generated:\n       " + outputFolder + "\n\n")
}
