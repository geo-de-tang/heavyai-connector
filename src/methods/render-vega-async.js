/**
 * Render a vega chart and return the data.
 * @param {Number} widget_id - The widget ID for the chart.
 * @param {String} vega_json - The vega JSON for rendering.
 * @param {Object} options - Options for rendering.
 * @param {Number} [options.compressionLevel=3] - Compression level for the result.
 * @return {Promise<Object>} Returns the rendered chart data.
 * @example <caption>Render vega chart:</caption>
 * con.renderVegaAsync(widget_id, vega_json, {compressionLevel: 1}).then(res => console.log(res))
 */
export default function renderVegaAsync(widget_id, vega_json, options = {}) {
    const compressionLevel = this.getCompressionLevel(options.compressionLevel)

    return this.wrapThrift('render_vega', [
        this._client,
        this._sessionId,
        widget_id,
        vega_json,
        compressionLevel,
        options.nonce || ""
    ])
}