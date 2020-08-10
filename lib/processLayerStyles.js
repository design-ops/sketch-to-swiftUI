const { addOptionalProperty, colorToRGBA, doRound, prepareAssetBundleForPDF, prepareAssetBundleForPNG } = require('./processShared')
const fs = require("fs")


const processLayerStyles = async (layerStyles, filepath, outputFolder, modifiers) => {
    let ret = []

    let sketchFile = await require('sketch-to-svg').SketchFile.from(filepath)

    layerStyles.forEach(async (style) => {
        let layerStyle = style.value
        let contextSettings = layerStyle.contextSettings
        let data = {
            name: style.name,
            style: []
        }
        addOptionalProperty("background", data.style, layerFill(layerStyle, outputFolder, sketchFile) )
        addOptionalProperty("border", data.style, layerBorder(layerStyle) )
        addOptionalProperty("shadow", data.style, layerShadow(layerStyle) )
        addOptionalProperty("blur", data.style, layerBlur(layerStyle) )
        // Apply the corner radius modifier
        addOptionalProperty("cornerRadius", data.style, cornerRadius(layerStyle, data.name, modifiers.radius) )

        ret.push(data)
    })

    return ret
}

module.exports = {processLayerStyles: processLayerStyles}

const layerFill = (layerStyle, outputFolder, sketchFile) => {
    let fills = layerStyle.fills

    if (fills !== undefined && fills.length > 0) {
      let backgroundArray = []
      for(let i=0;i<fills.length;i++){
        let fill = fills[i]

        if (fill.fillType == 0 && fill.isEnabled == true) { // Solid Color
            backgroundArray.push(`${colorToRGBA(fill.color.red, fill.color.green, fill.color.blue, fill.color.alpha)}`)
        }

        if (fill.fillType == 1 && fill.isEnabled == true) { // Gradients

          if (fill.gradient.gradientType == 0) { // Linear Gradients
            let gradientStops = []
            let coords1 = JSON.parse( "[" + fill.gradient.from.slice(1,-1) + "]")
            let coords2 = JSON.parse( "[" + fill.gradient.to.slice(1,-1) + "]")
            for(let i=0;i<fill.gradient.stops.length;i++){
              let stop = fill.gradient.stops[i]
              gradientStops.push(`.init(color: ${colorToRGBA(stop.color.red, stop.color.green, stop.color.blue, stop.color.alpha)}, location: ${stop.position})`)
            }
            backgroundArray.push(`LinearGradient(gradient: Gradient(stops:[${gradientStops}]), startPoint: UnitPoint(x: ${doRound(coords1[0])}, y: ${doRound(coords1[1])}), endPoint: UnitPoint(x: ${doRound(coords2[0])}, y: ${doRound(coords2[1])}))`)
          }

          if (fill.gradient.gradientType == 1) { // Radial Gradients
            let gradientStops = []
            let coords1 = JSON.parse( "[" + fill.gradient.from.slice(1,-1) + "]")
            for(let i=0;i<fill.gradient.stops.length;i++){
              let stop = fill.gradient.stops[i]
              gradientStops.push(`.init(color: ${colorToRGBA(stop.color.red, stop.color.green, stop.color.blue, stop.color.alpha)}, location: ${stop.position})`)
            }
            backgroundArray.push(`RadialGradient(gradient: Gradient(stops:[${gradientStops}]), center: UnitPoint(x: ${doRound(coords1[0])}, y: ${doRound(coords1[1])}), startRadius: 1, endRadius: 100)`)
          }

          if (fill.gradient.gradientType == 2) { // Angular Gradients
            let gradientStops = []
            for(let i=0;i<fill.gradient.stops.length;i++){
              let stop = fill.gradient.stops[i]
              gradientStops.push(`.init(color: ${colorToRGBA(stop.color.red, stop.color.green, stop.color.blue, stop.color.alpha)}, location: ${doRound(stop.position)})`)
            }
            backgroundArray.push(`AngularGradient(gradient: Gradient(stops:[${gradientStops}]), center: .center, startAngle: .degrees(0), endAngle: .degrees(360))`)
          }

        }

        if (fill.fillType == 4 && fill.isEnabled == true) { // Images
          // Copy the image from the sketch file to the output folder
          let imageOutputFolder = outputFolder + "/assets/Assets.xcassets"
          let imageName = fill.image._ref.split("/").splice(-1)[0]
          const name = imageName.split(".")[0]

          // Note - this will be async, but we just carry on anyway because we don't use any of the output.
          fs.mkdirSync(imageOutputFolder, { recursive: true })
          sketchFile.contentsPath().then(contentsPath => {
            // Create the asset bundle    
            prepareAssetBundle(imageName, imageOutputFolder)
            // Awful, but works around a bug that appears to be in `sketchFile.contentsPath()` where we try to read the 
            // contents of the folder but it is empty, resulting in a ENOENT.
            setTimeout(() => {
              fs.copyFileSync(contentsPath + "/" + fill.image._ref, imageOutputFolder + `/${name}.imageset/` + imageName)
            }, 1000)
          })

          backgroundArray.push(`Image("${name}", bundle: nil).resizable()`)
        }
      }
      return backgroundArray
    }
    // return "Color.clear"
}

const prepareAssetBundle = (imageName, assetBundleFolder) => {
  const extension = imageName.split(".")[1]
  const name = imageName.split(".")[0]
  if (extension === "pdf") {
    prepareAssetBundleForPDF(assetBundleFolder, name)
  } else if (extension === "png") {
    prepareAssetBundleForPNG(assetBundleFolder, name)
  }
}

const layerShadow = (layerStyles) => {
  let shadows = layerStyles.shadows
  if (shadows !== undefined && shadows.length > 0) {
      let shadowArray = []
      for(let i=0;i<shadows.length;i++){
        let shadow = shadows[i]
        if (shadow.isEnabled == true) {
          let shadowColor = colorToRGBA(shadow.color.red, shadow.color.green, shadow.color.blue, shadow.color.alpha)
          shadowArray.push(`color: ${shadowColor}, radius: ${shadow.blurRadius}, x: ${doRound(shadow.offsetX)}, y: ${doRound(shadow.offsetY)}`)
        }
      }
      return shadowArray
  }
  // return "Color.clear"
}

const layerBorder = (layerStyles) => {
  let borders = layerStyles.borders
  if (borders !== undefined && borders.length > 0) {
      let borderArray = []

      for(let i=0;i<borders.length;i++){
        let border = borders[i]

        if (border.fillType == 0 && border.isEnabled == true) { // Solid Color
            let borderColor = colorToRGBA(border.color.red, border.color.green, border.color.blue, border.color.alpha)
            borderArray.push(`${borderColor}, width: ${border.thickness}`)
        }

        if (border.fillType == 1 && border.isEnabled == true) { // Gradients

          if (border.gradient.gradientType == 0) { // Linear Gradients
            let gradientStops = []
            let coords1 = JSON.parse( "[" + border.gradient.from.slice(1,-1) + "]")
            let coords2 = JSON.parse( "[" + border.gradient.to.slice(1,-1) + "]")
            for(let i=0;i<border.gradient.stops.length;i++){
              let stop = border.gradient.stops[i]
              gradientStops.push(`.init(color: ${colorToRGBA(stop.color.red, stop.color.green, stop.color.blue, stop.color.alpha)}, location: ${stop.position})`)
            }
            borderArray.push(`LinearGradient(gradient: Gradient(stops:[${gradientStops}]), startPoint: UnitPoint(x: ${doRound(coords1[0])}, y: ${doRound(coords1[1])}), endPoint: UnitPoint(x: ${doRound(coords2[0])}, y: ${doRound(coords2[1])})), width: ${border.thickness}`)
          }

          if (border.gradient.gradientType == 1) { // Radial Gradients
            let gradientStops = []
            let coords1 = JSON.parse( "[" + border.gradient.from.slice(1,-1) + "]")
            for(let i=0;i<border.gradient.stops.length;i++){
              let stop = border.gradient.stops[i]
              gradientStops.push(`.init(color: ${colorToRGBA(stop.color.red, stop.color.green, stop.color.blue, stop.color.alpha)}, location: ${stop.position})`)
            }
            borderArray.push(`RadialGradient(gradient: Gradient(stops:[${gradientStops}]), center: UnitPoint(x: ${doRound(coords1[0])}, y: ${doRound(coords1[1])}), startRadius: 1, endRadius: 100), width: ${border.thickness}`)
          }

          if (border.gradient.gradientType == 2) { // Angular Gradients
            let gradientStops = []
            for(let i=0;i<border.gradient.stops.length;i++){
              let stop = border.gradient.stops[i]
              gradientStops.push(`.init(color: ${colorToRGBA(stop.color.red, stop.color.green, stop.color.blue, stop.color.alpha)}, location: ${doRound(stop.position)})`)
            }
            borderArray.push(`AngularGradient(gradient: Gradient(stops:[${gradientStops}]), center: .center, startAngle: .degrees(0), endAngle: .degrees(360)), width: ${border.thickness}`)
          }

        }

      }

      return borderArray
  }

}

const layerBlur = (layerStyles) => {
  let blur = layerStyles.blur
  if (blur.isEnabled == true) {
    return `radius: ${blur.radius}`
  }
}

const cornerRadius = (layerStyles, styleName, modifiers) => {
  if (!Array.isArray(modifiers)) {
    return
  }

  for(let modifier of modifiers) {
    if (modifier.name.startsWith("/")) {
      modifier.name = modifier.name.substring(1)
    }

    if (modifier.name === `${styleName} --radius`) {
      // TODO: Support different corner radius for each corner
      return modifier.layers[0].points[0].cornerRadius
    }
  }
}