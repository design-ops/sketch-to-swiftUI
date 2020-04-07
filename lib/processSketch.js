const { processLayerStyles } = require('./processLayerStyles')
const { processTextStyles } = require('./processTextStyles')
const { processAssets } = require('./processAssets')
const util = require('util')

/**
 *
 * @param {*} sketch The Sketch object to parse
 * @param {*} filepath A path to the sketch file so we can extract assets if we need to
 * @param {*} outputFolder The folder to output any resources if we need to
 */
async function processSketchFile(sketch, filepath, outputFolder) {

    // console.log(util.inspect(sketch.getLayerStyles(), {showHidden: false, depth: null}))
    // console.log(util.inspect(sketch.getTextStyles(), {showHidden: false, depth: null}))

    let styles = {layer:[], text:[], assets:[], borders:[]}

    let layers = processLayerStyles(sketch.getLayerStyles(), filepath, outputFolder)
    layers.sort(sortByName)
    console.log(`    🎨 Processed ${layers.length} Layer Styles!\n`)

    let textStyles = await processTextStyles(sketch.getTextStyles(), outputFolder)
    textStyles.text.sort(sortByName)
    console.log(`    📝 Processed ${textStyles.text.length} Text Styles!\n`)

    // let assetLayers = sketch.pages.flatMap(page => page.layers.filter(layer => layer._class === "symbolMaster" && layer.name != "Button/Shape"))
    // let assets = await processAssets(assetLayers, filepath, outputFolder)
    // console.log(`    🖼️  Processed ${assets.length} Assets!\n`)

    styles.styles = merge(textStyles.text, layers)
    styles.styles.sort(sortByName)

    return styles
}

const merge = (source, dest) => {
    source.forEach( s => {
        let item = dest.find(d => d.name == s.name)
        if (item == undefined) {
            item = { name: s.name, style: [] }
            dest.push(item)
        }
        item.text = s.text
        item.style = item.style.concat(s.style)
    })
    return dest
}

const sortByName = (a, b) => {
	var a1= a.name.toLowerCase(), b1= b.name.toLowerCase();
	if(a1== b1) return 0;
	return a1> b1? 1: -1;
}

module.exports = {processSketchFile: processSketchFile}
