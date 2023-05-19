
import hb from 'handlebars'
import { readFile, writeFile } from 'fs'
import util from 'util'
import path from 'path'
import { fileURLToPath } from 'url';

const promiseReadFile = util.promisify(readFile)
const promiseWriteFile = util.promisify(writeFile)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateSwiftUI = async (styles, outputFolder) => {
    const src = await promiseReadFile(__dirname + `/template.hb.swift`)
    const text = src.toString()
    const template = hb.compile(text)
    const output = template(styles)
    await promiseWriteFile(outputFolder + `/GeneratedStylist.swift`, output)
    console.log("\n    🎉 Swift has been generated:\n       " + outputFolder + "\n\n")
}
