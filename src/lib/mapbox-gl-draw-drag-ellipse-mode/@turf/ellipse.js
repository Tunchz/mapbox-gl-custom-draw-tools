'use strict';

var helpers = require('@turf/helpers');
var rhumbDestination = require('@turf/rhumb-destination');
var polygon = require('@turf/rhumb-destination').default;
var transformRotate = require('@turf/transform-rotate');
var invariant = require('@turf/invariant');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var rhumbDestination__default = /*#__PURE__*/_interopDefaultLegacy(rhumbDestination);
var transformRotate__default = /*#__PURE__*/_interopDefaultLegacy(transformRotate);

/**
 * Takes a {@link Point} and calculates the ellipse polygon given two semi-axes expressed in variable units and steps for precision.
 *
 * @param {Coord} center center point
 * @param {number} xSemiAxis semi (major) axis of the ellipse along the x-axis
 * @param {number} ySemiAxis semi (minor) axis of the ellipse along the y-axis
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.angle=0] angle of rotation in decimal degrees, positive clockwise
 * @param {Coord} [options.pivot='origin'] point around which the rotation will be performed
 * @param {number} [options.steps=64] number of steps
 * @param {string} [options.units='kilometers'] unit of measurement for axes
 * @param {Object} [options.properties={}] properties
 * @returns {Feature<Polygon>} ellipse polygon
 * @example
 * var center = [-75, 40];
 * var xSemiAxis = 5;
 * var ySemiAxis = 2;
 * var ellipse = turf.ellipse(center, xSemiAxis, ySemiAxis);
 *
 * //addToMap
 * var addToMap = [turf.point(center), ellipse]
 */

function ellipse(center, xSemiAxis, ySemiAxis, options) {
    options = options || {}
    let steps = options.steps || 64
    let units = options.units || 'kilometers'
    let angle = options.angle || 0
    let pivot = options.pivot || center
    let properties = options.properties || center.properties || {}
    let accuracy = options.accuracy || 2
  
    angle += 90
  
    if (!center) throw new Error('center is required')
    if (!xSemiAxis) throw new Error('xSemiAxis is required')
    if (!ySemiAxis) throw new Error('ySemiAxis is required')
    if (!helpers.isObject(options)) throw new Error('options must be an object')
    if (!helpers.isNumber(steps)) throw new Error('steps must be a number')
    if (!helpers.isNumber(angle)) throw new Error('angle must be a number')
    if (!Number.isInteger(accuracy))throw new Error('accuracy must be an integer')
    if (accuracy < 1 || accuracy > 3)
      throw new Error('accuracy must be an integer between 1 and 3 (inclusive)')
  
    // Ramanujan's approximation
    let circumference =
      Math.PI *
      (3 * (xSemiAxis + ySemiAxis) -
        Math.sqrt((3 * xSemiAxis + ySemiAxis) * (xSemiAxis + 3 * ySemiAxis)))
    let arcLength = circumference / steps
    let d = 0.0
    let coordinates = [
        rhumbDestination__default['default'](center, xSemiAxis, 0, options).geometry.coordinates
    ]
    let oldX = xSemiAxis
    let oldY = 0
    let oldDelta = 0
    let oldTheta = 0
    let integrationSteps = steps * Math.pow(2, accuracy + 1)
    let integrationSteps_ = (steps+1) * Math.pow(2, accuracy + 1)

    // console.log("--- integrationSteps : ", integrationSteps)
    for (let i = 0; i <= integrationSteps_ ; i++) {
      let theta = (i / integrationSteps) * (Math.PI * 2)
      let x = Math.cos(theta) * xSemiAxis
      let y = Math.sin(theta) * ySemiAxis
      d += Math.sqrt(Math.pow(x - oldX, 2) + Math.pow(y - oldY, 2))
      let delta = d - arcLength
      if (delta >= 0) {
        // Approximate theta to achieve a near-zero delta.
        let t = Math.abs(oldDelta) / (delta - oldDelta)
        theta = oldTheta + (theta - oldTheta) * t
        let newX = Math.cos(theta) * xSemiAxis
        let newY = Math.sin(theta) * ySemiAxis
        let bearing = helpers.radiansToDegrees(Math.atan2(newY, newX))
        let distance = Math.sqrt(Math.pow(newX, 2) + Math.pow(newY, 2))
        coordinates.push(
            rhumbDestination__default['default'](center, distance, bearing, options).geometry
            .coordinates
        )
        d -= arcLength
      }
      oldX = x
      oldY = y
      oldTheta = theta
      oldDelta = delta
    }
    coordinates.push(coordinates[0])
    console.log("--- coordinates : ", coordinates)
    return transformRotate__default['default'](helpers.polygon([coordinates]), angle, {pivot: pivot})
  }



// function ellipse(center, xSemiAxis, ySemiAxis, options) {
//   // Optional params
//   options = options || {};
//   var steps = options.steps || 64;
//   var units = options.units || "kilometers";
//   var angle = options.angle || 0;
//   var pivot = options.pivot || center;
//   var properties = options.properties || center.properties || {};

//   // validation
//   if (!center) throw new Error("center is required");
//   if (!xSemiAxis) throw new Error("xSemiAxis is required");
//   if (!ySemiAxis) throw new Error("ySemiAxis is required");
//   if (!helpers.isObject(options)) throw new Error("options must be an object");
//   if (!helpers.isNumber(steps)) throw new Error("steps must be a number");
//   if (!helpers.isNumber(angle)) throw new Error("angle must be a number");

//   var centerCoords = invariant.getCoord(center);
//   if (units === "degrees") {
//     var angleRad = helpers.degreesToRadians(angle);
//   } else {
//     xSemiAxis = rhumbDestination__default['default'](center, xSemiAxis, 90, { units: units });
//     ySemiAxis = rhumbDestination__default['default'](center, ySemiAxis, 0, { units: units });
//     xSemiAxis = invariant.getCoord(xSemiAxis)[0] - centerCoords[0];
//     ySemiAxis = invariant.getCoord(ySemiAxis)[1] - centerCoords[1];
//   }

//   var coordinates = [];
//   for (var i = 0; i <= steps; i += 1) {
//     var stepAngle = (i * -360) / steps;
//     var x =
//       (xSemiAxis * ySemiAxis) /
//       Math.sqrt(
//         Math.pow(ySemiAxis, 2) +
//           Math.pow(xSemiAxis, 2) * Math.pow(getTanDeg(stepAngle), 2)
//       );
//     var y =
//       (xSemiAxis * ySemiAxis) /
//       Math.sqrt(
//         Math.pow(xSemiAxis, 2) +
//           Math.pow(ySemiAxis, 2) / Math.pow(getTanDeg(stepAngle), 2)
//       );

//     if (stepAngle < -90 && stepAngle >= -270) x = -x;
//     if (stepAngle < -180 && stepAngle >= -360) y = -y;
//     if (units === "degrees") {
//       var newx = x * Math.cos(angleRad) + y * Math.sin(angleRad);
//       var newy = y * Math.cos(angleRad) - x * Math.sin(angleRad);
//       x = newx;
//       y = newy;
//     }
//     coordinates.push([x + centerCoords[0], y + centerCoords[1]]);
//   }


//   coordinates.push(coordinates[0]);
//   if (units === "degrees") {
//     return helpers.polygon([coordinates], properties);
//   } else {
//     return transformRotate__default['default'](helpers.polygon([coordinates], properties), angle, {
//       pivot: pivot,
//     });
//   }
// }

/**
 * Get Tan Degrees
 *
 * @private
 * @param {number} deg Degrees
 * @returns {number} Tan Degrees
 */
function getTanDeg(deg) {
  var rad = (deg * Math.PI) / 180;
  return Math.tan(rad);
}

module.exports = ellipse;
module.exports.default = ellipse;
