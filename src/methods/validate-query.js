/**
 * Submit a query to validate that the backend can create a result set based on the SQL statement.
 * @param {String} query - The query to perform.
 * @return {Promise<Object>} The result of whether the query is valid.
 * @example <caption>Create a query and determine if it is valid:</caption>
 * var query = "SELECT count(*) AS n FROM tweets_nov_feb WHERE country='CO'";
 * 
 * con.validateQuery(query).then(res => console.log(res))
 * 
 * // [{
 * //    "name": "n",
 * //    "type": "INT",
 * //    "is_array": false,
 * //    "is_dict": false
 * //  }]
 */
export default function validateQuery(query) {
    return this.wrapThrift('sql_validate', [
        this._client,
        this._sessionId,
        query
    ]).then((fields) => {
        const rowDict = fields.reduce((accum, value) => {
            accum[value.col_name] = value
            return accum
        }, {})
        return this.convertFromThriftTypes(rowDict)
    })
}