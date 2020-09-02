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

    let styles = {layer:[], text:[], assets:[], borders:[], uiKitProps:[]}

    const modifiers = extractModifiers(sketch)
    let layers = await processLayerStyles(sketch.getLayerStyles(), filepath, outputFolder, modifiers)
    layers.styles.sort(sortByName)
    layers.properties.sort(sortByName)
    console.log(`    🎨 Processed ${layers.styles.length} Layer Styles!\n`)

    let textStyles = await processTextStyles(sketch.getTextStyles(), outputFolder)
    textStyles.text.sort(sortByName)
    console.log(`    📝 Processed ${textStyles.text.length} Text Styles!\n`)

    let assetLayers = sketch.pages.flatMap(page => page.layers.filter(layer => layer._class === "symbolMaster" && layer.name != "Button/Shape"))
    let assets = await processAssets(assetLayers, filepath, outputFolder)
    console.log(`    🖼️  Processed ${assets.length} Assets!\n`)

    styles.styles = merge(textStyles.text, layers.styles)
    styles.styles.sort(sortByName)
    styles.uiKitProps = layers.properties

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

/*
Extracts modifiers from the first page in a sketch document.
Modifiers are used to add corner radius to selected layers.

Sketch has chosen to not include Corner Radius into the Layer Style,
and this led us to the modifiers. Much like adding an Atom in the theme,
a designer can also add a modifier which sets the corner radius.

Example:
If we need to add rounded corners to the  * / * / * / background atom,
we need to create a new atom named * / * / * / background --radius and include
a layer with the rounded corner settings.

The above also adheres to the overarching concept. You can have a default
setting for the Radius * / * / * / background --radius modifier, or you
can also target more specific atoms eg. home/footer/primaryButton[selected]/background --radius.
*/
const extractModifiers = (sketch) => {
    //TODO: This could probably be more efficient as a `reduce`
    const modifiers = sketch.getPages()[0].layers.filter((layer) => {
        return layer.name.includes("--")
    })
    // Take all modifiers and add them to a dictionary keyed by the modifier ID
    let d = {}
    modifiers.forEach((modifier) => {
        const modifierId = modifier.name.substr(modifier.name.indexOf("--") + 2) // + 2 because the index is at the start
        if (!(modifierId in d)) {
            d[modifierId] = []
        }
        d[modifierId].push(modifier)
    })
    return d
}

module.exports = {processSketchFile: processSketchFile}
