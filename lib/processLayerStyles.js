const { addOptionalProperty, colorToRGBA, doRound, prepareAssetBundleForPDF, prepareAssetBundleForPNG } = require('./processShared')
const fs = require("fs")
const sketchToSvg = require('sketch-to-svg')

const FILL_TYPE = {
  SOLID_COLOR: 0,
  GRADIENT: 1,
  IMAGE: 4,
}

const PATTERN_FILL_TYPE = {
  NO_FILL: 0,
  FILL: 1,
  STRETCH: 2,
  FIT: 3
}

const processLayerStyles = async (layerStyles, filepath, outputFolder, modifiers) => {
    let swiftUIStyles = []
    let uiKitProperties = []

    const sketchFile = await sketchToSvg.SketchFile.from(filepath)

    layerStyles.forEach(async (style) => {
        let layerStyle = style.value
        let data = {
            name: style.name,
            style: []
        }
        addOptionalProperty("background", data.style, layerFillWithShadows(layerStyle, outputFolder, sketchFile) )
        addOptionalProperty("border", data.style, layerBorder(layerStyle) )
        addOptionalProperty("blur", data.style, layerBlur(layerStyle) )
        // Apply the corner radius modifier
        addOptionalProperty("cornerRadius", data.style, cornerRadius(layerStyle, data.name, modifiers.radius) )

        swiftUIStyles.push(data)

        // For each layer style we also pull out the UIKit properties we want to expose
        const propertyData = {
          name: style.name,
          properties: layerFillProperty(layerStyle)
        }

        uiKitProperties.push(propertyData)
    })

    return {swiftUIStyles, uiKitProperties}
}

module.exports = {processLayerStyles: processLayerStyles}

const layerFillProperty = (layerStyle) => {
  let fills = layerStyle.fills
  let backgroundArray = []
  if (fills !== undefined && fills.length > 0) {
    for(let i = 0; i < fills.length; i++){
      let fill = fills[i];
      if (fill.fillType == FILL_TYPE.SOLID_COLOR && fill.isEnabled == true) {
          backgroundArray.push(`.backgroundColor(UIColor(red: ${fill.color.red}, green: ${fill.color.green}, blue: ${fill.color.blue}, alpha: ${fill.color.alpha}))`)
      }
    }
  }
  return backgroundArray;
}

const layerFillWithShadows = (layerStyle, outputFolder, sketchFile) => {
    let fills = layerStyle.fills

    if (fills !== undefined && fills.length > 0) {
      let backgroundArray = []
      for(let i=0;i<fills.length;i++){
        let fill = fills[i]

        if (fill.fillType == FILL_TYPE.SOLID_COLOR && fill.isEnabled == true) {
            backgroundArray.push(`${colorToRGBA(fill.color.red, fill.color.green, fill.color.blue, fill.color.alpha)}`)
        }

        if (fill.fillType == FILL_TYPE.GRADIENT && fill.isEnabled == true) {

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

        if (fill.fillType == FILL_TYPE.IMAGE && fill.isEnabled == true) {
          // Copy the image from the sketch file to the output folder
          let imageOutputFolder = outputFolder + "/assets/Assets.xcassets"
          let imageName = fill.image._ref.split("/").pop()
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

          switch (fill.patternFillType) {
            case PATTERN_FILL_TYPE.NO_FILL:
              backgroundArray.push(`Image("${name}", bundle: nil)`);
              break;
            case PATTERN_FILL_TYPE.FILL:
              backgroundArray.push(`Image("${name}", bundle: nil).resizable().aspectRatio(contentMode: .fill)`);
              break;
            case PATTERN_FILL_TYPE.STRETCH:
              backgroundArray.push(`Image("${name}", bundle: nil).resizable()`);
              break;
            case PATTERN_FILL_TYPE.FIT:
              backgroundArray.push(`Image("${name}", bundle: nil).resizable().aspectRatio(contentMode: .fit)`);
              break;
            default:
              backgroundArray.push(`Image("${name}", bundle: nil).resizable()`);
              break;
          }
        }
      }
      // Check to see if there is a shadow
      // If there is a shadow
      // -- take the last item added to the background Array and add the shadow to it
      let shadows = layerStyle.shadows
      if (shadows !== undefined && shadows.length > 0) {
          let shadowArray = []
          for(let i=0;i<shadows.length;i++){
            let shadow = shadows[i]
            if (shadow.isEnabled == true) {
              let shadowColor = colorToRGBA(shadow.color.red, shadow.color.green, shadow.color.blue, shadow.color.alpha)
              shadowArray.push(`.shadow(color: ${shadowColor}, radius: ${shadow.blurRadius}, x: ${doRound(shadow.offsetX)}, y: ${doRound(shadow.offsetY)})`)
            }
          }
          let lastBackground = backgroundArray.pop();
          lastBackground = lastBackground + shadowArray.join();
          backgroundArray.push(lastBackground);
      }
      return backgroundArray
    }
}

const prepareAssetBundle = (imageName, assetBundleFolder) => {
  const extension = imageName.split(".")[1].toLowerCase()
  const name = imageName.split(".")[0]
  if (extension === "pdf") {
    prepareAssetBundleForPDF(assetBundleFolder, name)
  } else if (extension === "png") {
    prepareAssetBundleForPNG(assetBundleFolder, name)
  } else {
    console.log(`Unhandled file extension ${extension}`)
  }
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
