import fs from 'fs'
import path from 'path'

export const addOptionalProperty = (name, array, value) => {
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

export const flattenName = (name) => {
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

export function doRound (number) {
  return Math.round(number * 100) / 100
}

export function colorToRGBA(red, green, blue, alpha) {
  return "Color(red: "+doRound(red)+", green: "+doRound(green)+", blue: "+doRound(blue)+", opacity: "+alpha+")"
}

export const prepareAssetBundleForPDF = (assetBundleFolder, name) => {
    return prepareAssetBundleForAsset(assetBundleFolder, name, '.pdf')
}

export const prepareAssetBundleForPNG = (assetBundleFolder, name) => {
    return prepareAssetBundleForAsset(assetBundleFolder, name, '.png')
}

export const prepareAssetBundleForJPG = (assetBundleFolder, name) => {
    return prepareAssetBundleForAsset(assetBundleFolder, name, '.jpg')
}

export const prepareAssetBundleForSVG = (assetBundleFolder, name) => {
    return prepareAssetBundleForAsset(assetBundleFolder, name, '.svg')
}

const prepareAssetBundleForAsset = (assetBundleFolder, name, extension) => {
    let folder = path.join(assetBundleFolder, `${name}.imageset/`)
    fs.mkdirSync(folder, { recursive: true })
    let fileContents = {
        images: [
            { idiom: "universal", 
            filename: `${name}${extension}` }
        ],
        info: { version:1, author:"sketch-to-swiftui" }, 
        properties: { "template-rendering-intent": "original" }
    }
    if (extension == ".svg") {
        fileContents.properties["preserves-vector-representation"] = true;
    }
    let json = JSON.stringify(fileContents)
    fs.writeFileSync(folder + "Contents.json", json)
    return folder + name + extension
}
