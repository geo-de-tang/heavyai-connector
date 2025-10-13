/**
 * Submit a query to the database and process the results.
 * @param {String} query The query to perform.
 * @param {Object} options Options for the query.
 * @returns {Promise.Object} The result of the query.
 */
export default function queryAsync(query, options) {
    console.log('[HeavyDB] queryAsync called with query:', query, 'options:', options);
    console.log('in queryAsync, query:', query, 'options:', options)

    let columnarResults = true
    let eliminateNullRows = false
    let queryId = null
    let returnTiming = false
    let limit = -1
    let curNonce = (this._nonce++).toString()
    if (options) {
        columnarResults = options.hasOwnProperty("columnarResults")
            ? options.columnarResults
            : columnarResults
        eliminateNullRows = options.hasOwnProperty("eliminateNullRows")
            ? options.eliminateNullRows
            : eliminateNullRows
        queryId = options.hasOwnProperty("queryId") ? options.queryId : queryId
        returnTiming = options.hasOwnProperty("returnTiming")
            ? options.returnTiming
            : returnTiming
        limit = options.hasOwnProperty("limit") ? options.limit : limit
        curNonce = options.hasOwnProperty("logValues")
            ? typeof options.logValues === "object"
                ? JSON.stringify(options.logValues)
                : options.logValues
            : curNonce
    }

    const lastQueryTime =
        queryId in this.queryTimes
            ? this.queryTimes[queryId]
            : this.DEFAULT_QUERY_TIME

    const conId = 0

    const processResultsOptions = {
        returnTiming,
        eliminateNullRows,
        query,
        queryId,
        conId,
        estimatedQueryTime: lastQueryTime,
        startTime: Date.now()
    }

    const AT_MOST_N = -1
    const sqlExecute = this.wrapThrift(
        "sql_execute",
        this.overSingleClient,
        (args) => args
    )
    const runQuery = () =>
        sqlExecute(query, columnarResults, curNonce, limit, AT_MOST_N).catch(
            (err) => {
                if (err.name === "NetworkError") {
                    this.removeConnection(0, "Network error")
                    if (this._numConnections === 0) {
                        err.msg = "No remaining database connections"
                        throw err
                    }
                    return runQuery()
                }
                throw err
            }
        )

    return this.processResults(processResultsOptions, runQuery())
}