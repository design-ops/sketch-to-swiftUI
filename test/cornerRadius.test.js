const rewire = require("rewire");
const processLayerStyles = rewire("../lib/processLayerStyles.js");

const cornerRadius = processLayerStyles.__get__("cornerRadius");

test("Returns null when object cant be figured out", () => {
  const emptyPoints = { layers: [] };
  const returnValue = cornerRadius(emptyPoints);
  expect(returnValue).toBeNull();
});

test("Returns null for no points in corner radius", () => {
  const emptyPoints = {
    layers: [
      {
        points: [],
      },
    ],
  };
  const returnValue = cornerRadius(emptyPoints);
  expect(returnValue).toBeNull();
});

test("Returns null for zero corner radius", () => {
  const returnValue = cornerRadius(noRadiusJSON);
  expect(returnValue).toBeNull();
});

test("Returns RoundedRectangle for equal corner radius", () => {
  const returnValue = cornerRadius(equalRadiusJSON);
  expect(returnValue).toBe("RoundedRectangle(cornerRadius: 5)");
});

test("Generates the correct radius for different corner radius", () => {
  const returnValue = cornerRadius(differentRadiusJSON);
  expect(returnValue).toBe("RoundedCorners(tl: 5, tr: 10, bl: 20, br: 15)");
});

const noRadiusJSON = {
  layers: [
    {
      points: [
        {
          _class: "curvePoint",
          cornerRadius: 0,
          curveFrom: "{0, 0}",
          curveMode: 1,
          curveTo: "{0, 0}",
          hasCurveFrom: false,
          hasCurveTo: false,
          point: "{0, 0}",
        },
        {
          _class: "curvePoint",
          cornerRadius: 0,
          curveFrom: "{1, 0}",
          curveMode: 1,
          curveTo: "{1, 0}",
          hasCurveFrom: false,
          hasCurveTo: false,
          point: "{1, 0}",
        },
        {
          _class: "curvePoint",
          cornerRadius: 0,
          curveFrom: "{1, 1}",
          curveMode: 1,
          curveTo: "{1, 1}",
          hasCurveFrom: false,
          hasCurveTo: false,
          point: "{1, 1}",
        },
        {
          _class: "curvePoint",
          cornerRadius: 0,
          curveFrom: "{0, 1}",
          curveMode: 1,
          curveTo: "{0, 1}",
          hasCurveFrom: false,
          hasCurveTo: false,
          point: "{0, 1}",
        },
      ],
    },
  ],
};

const differentRadiusJSON = {
  layers: [
    {
      points: [
        {
          _class: "curvePoint",
          cornerRadius: 5,
          curveFrom: "{0, 0}",
          curveMode: 1,
          curveTo: "{0, 0}",
          hasCurveFrom: false,
          hasCurveTo: false,
          point: "{0, 0}",
        },
        {
          _class: "curvePoint",
          cornerRadius: 10,
          curveFrom: "{1, 0}",
          curveMode: 1,
          curveTo: "{1, 0}",
          hasCurveFrom: false,
          hasCurveTo: false,
          point: "{1, 0}",
        },
        {
          _class: "curvePoint",
          cornerRadius: 15,
          curveFrom: "{1, 1}",
          curveMode: 1,
          curveTo: "{1, 1}",
          hasCurveFrom: false,
          hasCurveTo: false,
          point: "{1, 1}",
        },
        {
          _class: "curvePoint",
          cornerRadius: 20,
          curveFrom: "{0, 1}",
          curveMode: 1,
          curveTo: "{0, 1}",
          hasCurveFrom: false,
          hasCurveTo: false,
          point: "{0, 1}",
        },
      ],
    },
  ],
};

const equalRadiusJSON = {
  layers: [
    {
      points: [
        {
          _class: "curvePoint",
          cornerRadius: 5,
          curveFrom: "{0, 0}",
          curveMode: 1,
          curveTo: "{0, 0}",
          hasCurveFrom: false,
          hasCurveTo: false,
          point: "{0, 0}",
        },
        {
          _class: "curvePoint",
          cornerRadius: 5,
          curveFrom: "{1, 0}",
          curveMode: 1,
          curveTo: "{1, 0}",
          hasCurveFrom: false,
          hasCurveTo: false,
          point: "{1, 0}",
        },
        {
          _class: "curvePoint",
          cornerRadius: 5,
          curveFrom: "{1, 1}",
          curveMode: 1,
          curveTo: "{1, 1}",
          hasCurveFrom: false,
          hasCurveTo: false,
          point: "{1, 1}",
        },
        {
          _class: "curvePoint",
          cornerRadius: 5,
          curveFrom: "{0, 1}",
          curveMode: 1,
          curveTo: "{0, 1}",
          hasCurveFrom: false,
          hasCurveTo: false,
          point: "{0, 1}",
        },
      ],
    },
  ],
};
