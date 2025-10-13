import {
    TArrowTransport,
    TDeviceType
} from "../../thrift/heavy_types.js"

/**
 * Submit a query to the database and process the results using Apache Arrow format.
 * @param {String} query - The query to perform.
 * @param {Object} options - Options for the query.
 * @param {Boolean} [options.returnTiming] - Whether to return timing information.
 * @return {Promise<Object>} The result of the query in Arrow format.
 * @example <caption>Create a query using Arrow format:</caption>
 * var query = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'";
 * var options = {};
 * 
 * con.queryDFAsync(query, options).then(result => console.log(result));
 */
export default function queryDFAsync(query, options) {
    const deviceId = 0
    const limit = -1

    return this.wrapThrift('sql_execute_df', [
        this._client,
        this._sessionId,
        query,
        TDeviceType.CPU,
        deviceId,
        limit,
        TArrowTransport.WIRE
    ]).then((data) => {
        if (this._logging) {
            console.log(
                query,
                "on Server",
                0,
                "- Execution Time:",
                data.execution_time_ms,
                "ms"
            )
        }

        // Import tableFromIPC from apache-arrow
        const { tableFromIPC } = require('apache-arrow')
        const buf = Buffer.from(data.df_buffer, "base64")
        let results = tableFromIPC(buf)

        if (options && Boolean(options.returnTiming)) {
            results = {
                results,
                timing: {
                    execution_time_ms: data.execution_time_ms
                }
            }
        }
        return results
    })
}