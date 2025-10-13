/**
 * Replace a dashboard on the server with new content.
 * @param {Number} dashboardId - The ID of the dashboard to replace.
 * @param {String} dashboardName - Name of the dashboard.
 * @param {String} dashboardState - Base64-encoded state string of the dashboard.
 * @param {String} imageHash - Optional hash of the dashboard thumbnail.
 * @param {String} dashboardMetadata - Optional metadata related to the dashboard.
 * @return {Promise<Object>} Returns empty object on success.
 * @example <caption>Replace a dashboard:</caption>
 * con.replaceDashboardAsync(123, "dashboard1", "eyJuYW1lIjoidGVzdCJ9").then(res => console.log(res))
 */
export default function replaceDashboardAsync(dashboardId, dashboardName, dashboardState, imageHash = "", dashboardMetadata = "") {
    return this.wrapThrift('replace_dashboard', [
        this._client,
        this._sessionId,
        dashboardId,
        dashboardName,
        dashboardState,
        imageHash,
        dashboardMetadata
    ])
}