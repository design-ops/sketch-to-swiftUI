#!/usr/bin/env node

import { convertSketchToSwiftUI } from '../sketchToSwiftUI.js'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(process.argv))
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
    .option('svg', {
        type: 'boolean',
        default: false,
        description: 'Export the assets of mysketchfile.sketch as SVG files'
    })
    .demandCommand(1)
    .help('help')
    .argv

convertSketchToSwiftUI(argv['file'], argv['o'], argv['svg'])