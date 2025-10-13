/**
 * Get the dashboards from the server database.
 * @return {Promise<Object>} The dashboards available on the server.
 * @example <caption>Get the dashboards:</caption>
 * con.getDashboardsAsync().then(res => console.log(res))
 * // [{ dashboard_name: "dashboard1", dashboard_state: "...", image_hash: "...", update_time: "..." }, ...]
 */
export default function getDashboardsAsync() {
    return this.wrapThrift('get_dashboards', [
        this._client,
        this._sessionId
    ])
}