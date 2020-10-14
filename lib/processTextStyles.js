const { copyFonts } = require('./copyFonts')
const { addOptionalProperty, doRound, colorToRGBA } = require('./processShared')

async function processTextStyles(textStyles, outputFolder) {
  let swiftUIStyles = []
  let uiKitProperties = []

    let fontNames = []

    for (let index = 0; index < textStyles.length; ++index) {
        let style = textStyles[index]
        let textStyle = style.value.textStyle
        let allStyles = style.value
        let encodedAttributes = textStyle.encodedAttributes
        let fontAttributes = encodedAttributes.MSAttributedStringFontAttribute.attributes
        let paragraphStyle = encodedAttributes.paragraphStyle
        let color = encodedAttributes.MSAttributedStringColorAttribute

        // Store the font name - we deal with the fonts at the end
        if (!fontNames.includes(fontAttributes.name)) {
            fontNames.push(fontAttributes.name)
        }

        let data = {
            name: style.name,
            style: [
                { name: "font", value: fontNameAndSize(fontAttributes) },
                { name: "foregroundColor", value: getColor(color) }
                /*
                { name: "vertical-align", value: verticalAlign(textStyle) },
                { name: "text-transform", value: textTransform(encodedAttributes) }*/
            ],
            text: []
        }
        addOptionalProperty("tracking", data.text, tracking(encodedAttributes)) // Same as Kerning
        addOptionalProperty("lineSpacing", data.style, lineSpacing(paragraphStyle, fontAttributes))
        addOptionalProperty("multilineTextAlignment", data.style, multilineTextAlign(paragraphStyle))
        addOptionalProperty("frame", data.style, textAlign(paragraphStyle))
        addOptionalProperty("shadow", data.style, textShadow(allStyles))
        addOptionalProperty("blur", data.style, textBlur(allStyles))
        addOptionalProperty("underline", data.text, textUnderline(encodedAttributes))
        addOptionalProperty("strikethrough", data.text, textStrikethrough(encodedAttributes))
        addOptionalProperty("withTextCase", data.style, textCase(encodedAttributes))
        swiftUIStyles.push(data)

        // Get properties we want to make accessible for UIKit
        const propertyData = {
          name: style.name,
          properties: [
            { name: "textColor", value: getUIColor(color) },
            { name: "font", value: getUIFont(fontAttributes) },
          ]
        }

        addOptionalProperty("kerning", propertyData.properties, tracking(encodedAttributes))

        
        uiKitProperties.push(propertyData)
    }

    let fonts = await copyFonts(fontNames, outputFolder)

    return { text: {swiftUIStyles, uiKitProperties}, fonts: fonts }
}

module.exports = { processTextStyles: processTextStyles }

const fontNameAndSize = (fontAttributes) => {
    return `Font.custom("${fontAttributes.name}", size: ${fontAttributes.size})`
}

const tracking = (encodedAttributes) => {
    return encodedAttributes.kerning
}

const lineSpacing = (paragraphStyle, fontAttributes) => {
    return doRound(paragraphStyle.minimumLineHeight - fontAttributes.size)
}

const getColor = (color) => {
    return `${colorToRGBA(color.red, color.green, color.blue, color.alpha)}`
}

const multilineTextAlign = (paragraphStyle) => {
    const options = [".leading", ".trailing", ".center"]
    let val = paragraphStyle.alignment
    if (val < options.length) {
        return options[val]
    }
}

const textAlign = (paragraphStyle) => {
  const options = [".leading", ".trailing", ".center"]
  let val = paragraphStyle.alignment
  if (val < options.length) {
    return `alignment: ${options[val]}`
  }
}

const textShadow = (shadowStyles) => {
  let shadows = shadowStyles.shadows
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
}

const textBlur = (textStyles) => {
  let blur = textStyles.blur
  if (blur.isEnabled == true) {
    return `radius: ${blur.radius}`
  }
}

const textUnderline = (encodedAttributes) => {
  if (encodedAttributes.underlineStyle == 1) {
    return true
  }
}

const textStrikethrough = (encodedAttributes) => {
  if (encodedAttributes.strikethroughStyle == 1) {
   return true
  }
}

const textCase = (encodedAttributes) => {
  const val = encodedAttributes.MSAttributedStringTextTransformAttribute
  const options = [".none", ".uppercase", ".lowercase"]
  if (val != undefined && val < options.length) {
      return options[val]
  }
  return ".none"
}

const getUIColor = (color) => {
  return `UIColor(red: ${color.red}, green: ${color.green}, blue: ${color.blue}, alpha: ${color.alpha})`
}

const getUIFont = (fontAttributes) => {
  // using ! to unwrap the font. Should we do this? IMHO the font not being there is a programmer error
  return `UIFont(name: "${fontAttributes.name}", size: ${fontAttributes.size})!`
}
