/**
 * Create an array-like object from the results returned by a query.
 * @param {Object} columns - The columns returned from a query.
 * @param {Object} options - The options object for the array conversion.
 * @param {Boolean} [options.includeColumns] - Include columns in the result.
 * @param {Boolean} [options.isArrowResult] - Result set is Arrow formatted.
 * @return {Object|Array} The data from the query.
 * @example <caption>You can create an array from the columns and the formatted results.</caption>
 *
 * con.queryAsync("SELECT origin_city AS \"origin city\", dest_city, dep_timestamp FROM flights LIMIT 2").then(
 *   function(result) {
 *     return con.createDatumAsync(result.results[0])
 *   }
 * ).then(function(result) {
 *   console.log(result)
 * })
 * // [{origin city: "Oklahoma City", dest_city: "Phoenix", dep_timestamp: Wed Dec 31 1969 17:00:00}, {origin city: "Beaumont", dest_city: "Fresno", dep_timestamp: Wed Dec 31 1969 17:00:00}]
 *
 * // You can also just get the columns.
 * con.queryAsync("SELECT origin_city AS \"origin city\", dest_city, dep_timestamp FROM flights LIMIT 2").then(
 *   function(result) {
 *     return con.createDatumAsync(result.results[0], {includeColumns: true})
 *   }
 * ).then(function(result) {
 *   console.log(result)
 * })
 * // {columns: ["origin city", "dest_city", "dep_timestamp"], results: [[...], [...]]}
 */
export default function createDatumAsync(columns, options = {}) {
    const { processResults } = this

    return new Promise((resolve, reject) => {
        try {
            const results = processResults(
                columns,
                options.isArrowResult,
                this._eliminateNullRows
            )

            if (options.includeColumns) {
                resolve({
                    columns: Object.keys(results[0] || {}),
                    results
                })
            } else {
                resolve(results)
            }
        } catch (error) {
            console.error('Error in createDatumAsync:', error)
            reject(error)
        }
    })
}