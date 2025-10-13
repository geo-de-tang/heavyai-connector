/**
 * Delete a dashboard from the server database.
 * @param {Number} dashboardId - The ID of the dashboard.
 * @return {Promise<Object>} Returns empty object on success.
 * @example <caption>Delete a dashboard:</caption>
 * con.deleteDashboardAsync(123).then(res => console.log(res))
 */
export default function deleteDashboardAsync(dashboardId) {
    return this.wrapThrift('delete_dashboard', [
        this._client,
        this._sessionId,
        dashboardId
    ])
}