const { flattenName, prepareAssetBundleForPDF} = require('./processShared')
const svg = require('sketch-to-svg')
const fs = require('fs')
const pdfDoc = require('pdfkit')
const SVGtoPDF = require('svg-to-pdfkit')
const path = require('path')

async function processAssets(layers, filepath, outputFolder) {
  let css = []

  let assetBundleFolder = createAssetBundle(outputFolder)

  for (let index = 0; index < layers.length; ++index) {
    let layer = layers[index]
    let backgroundImage = await assetToSvg(layer, filepath, outputFolder, flattenName(layer.name))
    let filePath = prepareAssetBundleForPDF(assetBundleFolder, flattenName(layer.name))
    svgToPdf(backgroundImage, filePath, {width: assetWidth(layer), height: assetHeight(layer)})
    css.push({
      name: flattenName(layer.name),
      css: [
        { name: "background-image", value: backgroundImage },
        { name: "background-repeat", value: "no-repeat" },
        { name: "background-position", value: "center" },
        { name: "width", value: assetWidth(layer) },
        { name: "height", value: assetHeight(layer) }
      ]
    })
  }

  return css
}

/**
 * Return the css for an asset and, if required, place any nested resources into the outputFolder.
 *
 * @param {sketch-constructor.Layer} layer The layer to render as an svg
 * @param {string} filepath The path to the sketch file to extract any assets
 * @param {string} outputFolder The output folder to place extracted assets into
 */
async function assetToSvg(layer, filepath, outputFolder, filename) {
  let options = {
    sketchFilePath: filepath,
    optimizeImageSize: true,
    optimizeImageSizeFactor: 3,
    embedImages: true
  }

  let icon = await svg.createFromLayer(layer, options)
  return icon.svg
}

function svgToPdf(svg, filePath, opts) {
    let doc = new pdfDoc({size: [opts.width, opts.height], margin: 0})
    // let folder = output(outputFolder)
    // let path = folder + "/" + filename + ".pdf"
    doc.pipe(fs.createWriteStream(filePath))
    try {
        SVGtoPDF(doc, svg, 0, 0, { assumePt: true })
    } catch(err) {
        console.log(`🚨 couldn't generate PDF for ${filename} because ${err.message} - ${svg}`)
    }
    doc.end()
    return path
}

const assetWidth = (layer) => {
  return layer.frame.width
}

const assetHeight = (layer) => {
  return layer.frame.height
}

const createAssetBundle = (outputFolder) => {
    let folder = outputFolder + "/assets/Assets.xcassets/"
    fs.mkdirSync(folder, { recursive: true })
    let json = JSON.stringify({info:{version:1, author:"stylableSwiftUI"}})
    fs.writeFileSync(folder + "Contents.json", json)
    return folder
}

module.exports = { processAssets: processAssets }
