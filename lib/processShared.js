const fs = require('fs')

const addOptionalProperty = (name, array, value) => {
    if (value) {
        if (Array.isArray(value)) {
            value.forEach( val => {
                array.push({ name: name, value: val })
            })
        } else {
            array.push({ name: name, value: value })
        }
    }
}

const flattenName = (name) => {
    const _names = name.split("/")
    let names = []

    _names.forEach((name) =>{
        // Section Name/Element Name[Variant]/AtomName -> sectionname-elementname[variant]-atomname
        var name1 = name.toLowerCase()
                        .replace(/\s/gi, "") // Match whitespace
                        .replace(/[!@#$%^&().<>?;':"=+{}]/gi, ""); // Match any of these symbols !@#$%^&().<>?;':"=+{}
        names.push(name1)
    })
    return names.join("_")
}

function doRound (number) {
  return Math.round(number * 100) / 100
}

function colorToRGBA(red, green, blue, alpha) {
  return "Color(red: "+doRound(red)+", green: "+doRound(green)+", blue: "+doRound(blue)+", opacity: "+alpha+")"
}

const prepareAssetBundleForPDF = (assetBundleFolder, name) => {
    return prepareAssetBundleForAsset(assetBundleFolder, name, '.pdf')
}

const prepareAssetBundleForPNG = (assetBundleFolder, name) => {
    return prepareAssetBundleForAsset(assetBundleFolder, name, '.png')
}

const prepareAssetBundleForAsset = (assetBundleFolder, name, extension) => {
    //let name = path.basename(filename, ".pdf")
    let folder = `${assetBundleFolder}/${name}.imageset/`
    fs.mkdirSync(folder, { recursive: true })
    let json = JSON.stringify({
        images: [
            { idiom: "universal", 
            filename: `${name}${extension}` }
        ],
        info: { version:1, author:"stylableSwiftUI" }, 
        properties: { "template-rendering-intent": "original" }
    })
    fs.writeFileSync(folder + "Contents.json", json)
    return folder + name + extension
    /*
    pdfPath = path.resolve(pdfPath)
    console.log(`copyFileSync: ${pdfPath}`)
    let res = fs.copyFileSync(pdfPath, folder + name + ".pdf" )
    console.log(`result: '${res}'`)
    */
}


module.exports = { addOptionalProperty: addOptionalProperty, 
    flattenName: flattenName, 
    doRound: doRound, 
    colorToRGBA: colorToRGBA,
    prepareAssetBundleForPDF,
    prepareAssetBundleForPNG
}
