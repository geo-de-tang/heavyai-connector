/**
 * Detect the column types of a delimited file.
 * @param {String} fileName - Name of the delimited file.
 * @param {Object} copyParams - Parameters for the file detection.
 * @return {Promise<Object>} Returns the detected schema.
 * @example <caption>Detect column types:</caption>
 * con.detectColumnTypesAsync("myFile.csv", {
 *   delimiter: ",",
 *   has_header: true
 * }).then(res => console.log(res))
 */
export default function detectColumnTypesAsync(fileName, copyParams) {
    return this.wrapThrift('detect_column_types', [
        this._client,
        this._sessionId,
        fileName,
        copyParams
    ])
}