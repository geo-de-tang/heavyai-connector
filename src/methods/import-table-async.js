/**
 * Import a delimited table from a file.
 * @param {String} tableName - The name of the new table.
 * @param {String} fileName - The name of the file containing the table.
 * @param {TCopyParams} copyParams - See {@link TCopyParams}
 * @param {TColumnType[]} headers - A collection of metadata related to the table headers.
 * @return {Promise<Object>} Returns the number of rows imported.
 * @example <caption>Import from a delimited file:</caption>
 * con.importTableAsync("myTable", "myFile.csv", {
 *   delimiter: ",",
 *   has_header: true
 * }, [
 *   {col_name: "col1", col_type: {type: 6, encoding: 4, nullable: true, is_array: false}},
 *   {col_name: "col2", col_type: {type: 6, encoding: 4, nullable: true, is_array: false}}
 * ]).then(res => console.log(res))
 */
export default function importTableAsync(tableName, fileName, copyParams) {
    // Import required helpers
    const helpers = require('../helpers.js')

    return this.wrapThrift('import_table',
        this.overAllClients,
        ([tableName, fileName, copyParams]) => [
            tableName,
            fileName,
            helpers.convertObjectToThriftCopyParams(copyParams)
        ]
    )(tableName, fileName, copyParams)
}