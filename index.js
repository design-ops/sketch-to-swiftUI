const { Sketch } = require('sketch-constructor')
const { processSketchFile } = require('./lib/processSketch')
const { generateSwiftUI } = require('./lib/generateSwiftUI')
const fs = require('fs')

const argv = require('yargs')
    .command('extract', 'Extracts the provided sketch file into swiftUI')
    .example('extract -o ./output mysketchfile.sketch', 'Export the contents of mysketchfile.sketch into the output folder')
    .alias('o', 'output')
    .nargs('o', 1)
    .default('o', `./output`)
    .describe('o', 'Folder to output the swift code and assets.')
    .demandCommand(1)
    .help('h')
    .alias('h', 'help')
    .argv

extract(argv['_'][0], argv['o'])

function extract(filename, outputFolder) {
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
