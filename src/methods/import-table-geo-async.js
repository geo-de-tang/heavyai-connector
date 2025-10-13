/**
 * Import a geo table from a file.
 * @param {String} tableName - The name of the new geo table.
 * @param {String} fileName - The name of the file containing the table.
 * @param {TCopyParams} copyParams - See {@link TCopyParams}
 * @param {TColumnType[]} rowDescObj - A collection of metadata related to the table headers.
 * @return {Promise<Object>} Returns the number of rows imported.
 * @example <caption>Import from a geo file:</caption>
 * con.importTableGeoAsync("myTable", "myFile.geojson", {
 *   geo_coords_encoding: "geoint",
 *   geo_coords_comp_param: 32
 * }, [
 *   {col_name: "name", col_type: {type: 6, encoding: 4, nullable: true, is_array: false}},
 *   {col_name: "geom", col_type: {type: 11, encoding: 1, nullable: true, is_array: false}}
 * ]).then(res => console.log(res))
 */
export default function importTableGeoAsync(tableName, fileName, copyParams, rowDescObj) {
    // Import required helpers
    const helpers = require('../helpers.js')

    return this.wrapThrift('import_geo_table',
        this.overAllClients,
        ([tableName, fileName, copyParams, rowDescObj]) => [
            tableName,
            fileName,
            helpers.convertObjectToThriftCopyParams(copyParams),
            helpers.mutateThriftRowDesc(rowDescObj, this.importerRowDesc),
            { fragment_size: null, page_size: null, max_rows: null } // TCreateParams equivalent
        ]
    )(tableName, fileName, copyParams, rowDescObj)
}