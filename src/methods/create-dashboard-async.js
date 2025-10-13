/**
 * Create a dashboard and persist it to the server database.
 * @param {String} dashboardName - Name of the dashboard.
 * @param {String} dashboardState - Base64-encoded state string of the dashboard.
 * @param {String} imageHash - Optional hash of the dashboard thumbnail.
 * @param {String} dashboardMetadata - Optional metadata related to the dashboard.
 * @return {Promise<Object>} Returns the dashboard ID.
 * @example <caption>Create a dashboard:</caption>
 * con.createDashboardAsync("dashboard1", "eyJuYW1lIjoidGVzdCJ9").then(res => console.log(res))
 * // {dashboard_id: 123}
 */
export default function createDashboardAsync(dashboardName, dashboardState, imageHash = "", dashboardMetadata = "") {
    return this.wrapThrift('create_dashboard', [
        this._client,
        this._sessionId,
        dashboardName,
        dashboardState,
        imageHash,
        dashboardMetadata
    ])
}