/**
 * Get the fields of the current database.
 * @param {Object} options - Options for the method.
 * @param {String} [options.table] - Name of table containing field names.
 * @return {Promise<Object>} The result of the fields data.
 * @example <caption>Get the fields data for a table:</caption>
 * con.getFieldsAsync("flights").then(res => console.log(res))
 * // [{name: "fieldName1", type: "BIGINT", is_array: false, is_dict: false}, ...]
 */
export default function getFieldsAsync(tableName) {
    const options = this.opts(arguments[1])

    return this.wrapThrift('get_table_details', [
        this._client,
        this._sessionId,
        tableName,
        options.includeSystemColumns,
        options.includeVirtualColumns
    ])
}