/**
 * Convert value to array if it's not already an array
 * @param {*} maybeArray - Value that might be an array
 * @returns {Array} Array version of the input
 */
export default function arrayify(maybeArray) {
    return Array.isArray(maybeArray) ? maybeArray : [maybeArray]
}