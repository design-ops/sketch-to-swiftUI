const { Sketch } = require('sketch-constructor')
const { processSketchFile } = require('./lib/processSketch')
const { generateSwiftUI } = require('./lib/generateSwiftUI')
const fs = require('fs')

function convertSketchToSwiftUI(filename, outputFolder) {
    //console.log("Extracting from " + filename + " to " + outputFolder)
    Sketch.fromFile(filename)
        .then(sketch => {
            return processSketchFile(sketch, filename, outputFolder)
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

module.exports = {convertSketchToSwiftUI}