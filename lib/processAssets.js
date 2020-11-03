const { flattenName, prepareAssetBundleForPDF, prepareAssetBundleForSVG} = require('./processShared')
const svg = require('sketch-to-svg')
const fs = require('fs')
const pdfDoc = require('pdfkit')
const SVGtoPDF = require('svg-to-pdfkit')
const path = require('path')

async function processAssets(layers, filepath, outputFolder, outputAsSVG) {
  let assets = []

  const assetBundleFolder = createAssetBundle(outputFolder)

  for (let index = 0; index < layers.length; ++index) {
    const layer = layers[index]
    const backgroundImage = await assetToSvg(layer, filepath, outputFolder, flattenName(layer.name))
    if (outputAsSVG) {
      const assetPath = prepareAssetBundleForSVG(assetBundleFolder, flattenName(layer.name))
      fs.writeFileSync(assetPath, backgroundImage)
    } else {
      const assetPath = prepareAssetBundleForPDF(assetBundleFolder, flattenName(layer.name))
      svgToPdf(backgroundImage, assetPath, {width: assetWidth(layer), height: assetHeight(layer)})
    }
    assets.push({
      name: flattenName(layer.name),
    })
  }

  return assets
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
