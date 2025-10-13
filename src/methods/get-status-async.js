/**
 * Get the status of the server as a TServerStatus object.
 * This includes the server version number, whether the server is read-only,
 * and whether backend rendering is enabled.
 * @return {Promise<Object>} An object that contains information about the server status.
 * @example <caption>Get the server status:</caption>
 * con.getStatusAsync().then(res => console.log(res))
 * // [{
 * //   "read_only": false,
 * //   "version": "3.0.0dev-20170503-40e2de3",
 * //   "rendering_enabled": true,
 * //   "start_time": 1493840131
 * // }]
 */
export default function getStatusAsync() {
    return this.wrapThrift('get_status', [
        this._client,
        this._sessionId
    ])
}