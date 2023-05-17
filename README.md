
# Sketch to SwiftUI

> Create a StylableSwiftUI stylist implementation from a Sketch file. Sketch -> SwiftUI

## Installation

- Clone this repository
- Run `npm i`

### Clone

- Clone this repo to your local machine using `https://github.com/design-ops/sketch-to-swiftUI`

### Setup

> Install dependencies first

```shell
$ brew install fonttools
```

> now install npm packages

```shell
$ npm install
```

---

If you encounter a problem installing node-canvas, rebuild it from source:

```shell
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```
and then
```shell
npm install --build-from-source
```

## Features

- Extracts layer styles, text styles and assets from a Sketch file.
- Allows output of assets to be in PDF form or SVG

## Usage (Optional)

```shell
npm run convert ${path-to-sketch-file.sketch}
```

or if you want your assets as SVG:
```shell
npm run convert -- ${path-to-sketch-file.sketch} --svg
```

## Documentation (Optional)

- Atomic design principles


---

## Contributing

> To get started...

### Step 1

- **Option 1**
    - 🍴 Fork this repo!

- **Option 2**
    - 👯 Clone this repo to your local machine as shown above

### Step 2

- **HACK AWAY!** 🔨🔨🔨

### Step 3

- 🔃 Create a new pull request using <a href="https://github.com/design-ops/sketch-to-swiftui/compare/" target="_blank">`https://github.com/design-ops/sketch-to-swiftui/compare/`</a>.

---

## License

See the LICENSE file.
