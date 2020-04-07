#!/usr/bin/env node

const { convertSketchToSwiftUI } = require('../switchToSwiftUI')

const argv = require('yargs')
    .scriptName('sketch-to-swiftUI')
    .command('$0 <file>', 'Extracts the provided sketch file into swiftUI', yargs => {
        yargs.positional('file', {
            describe: "Path to Sketch file",
            type: "string"
        })
    })
    .example('-o ./output mysketchfile.sketch', 'Export the contents of mysketchfile.sketch into the output folder')
    .alias('o', 'output')
    .nargs('o', 1)
    .default('o', `./output`)
    .describe('o', 'Folder to output the swift code and assets.')
    .demandCommand(1)
    .help('help')
    .argv

convertSketchToSwiftUI(argv['_'][0], argv['o'])