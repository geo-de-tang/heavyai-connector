/**
 * Get render status for vega chart rendering.
 * @param {Number} widget_id - The widget ID for the chart.
 * @param {Number} vega_json - The vega JSON for rendering.
 * @return {Promise<Object>} Returns the render status.
 * @example <caption>Get render status:</caption>
 * con.getRenderStatusAsync(widget_id, vega_json).then(res => console.log(res))
 */
export default function getRenderStatusAsync(widget_id, vega_json) {
    return this.wrapThrift('get_result_row_for_pixel', [
        this._client,
        this._sessionId,
        widget_id,
        vega_json
    ])
}