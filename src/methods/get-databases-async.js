/**
 * Get the list of databases from the server.
 * @return {Promise<Object>} The list of databases available on the server.
 * @example <caption>Get the list of databases:</caption>
 * con.getDatabasesAsync().then(res => console.log(res))
 * // [{ db_name: "heavyai", db_owner: "heavyai" }, ...]
 */
export default function getDatabasesAsync() {
    return this.wrapThrift('get_databases', [
        this._client,
        this._sessionId
    ])
}