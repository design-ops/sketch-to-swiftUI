import pkg from 'sketch-constructor'
const { Sketch } = pkg;
import { processSketchFile  } from './lib/processSketch.js'
import { generateSwiftUI } from './lib/generateSwiftUI.js'
import fs from 'fs'

export const convertSketchToSwiftUI = (filename, outputFolder, outputAsSVG) => {
    // console.log("Extracting from " + filename + " to " + outputFolder)
    Sketch.fromFile(filename)
        .then(sketch => {
            const file = processSketchFile(sketch, filename, outputFolder, outputAsSVG)
            return file
        })
        .then(styles => {
            fs.mkdirSync(outputFolder, { recursive: true })
            //console.log(require('util').inspect(styles, {showHidden: false, depth: null}))
            return generateSwiftUI(styles, outputFolder)
        })
        .catch(err => {
            console.log("Failed to extract", err)
        })
}
