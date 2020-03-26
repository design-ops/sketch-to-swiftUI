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

module.exports = { addOptionalProperty: addOptionalProperty, flattenName: flattenName, doRound: doRound, colorToRGBA: colorToRGBA }
