/**
 * Create a list of endpoints from the params provided in connect().
 * Useful for situations where there are multiple endpoints.
 * @return {Array<String>} An array of fully-formed endpoints.
 * @example <caption>Create a single endpoint:</caption>
 * var con = new DbCon().protocol("https").host("localhost").port("443").dbName("mydb");
 * con.getEndpoints();
 * // ["https://localhost:443"]
 * @example <caption>Create multiple endpoints:</caption>
 * var con = new DbCon()
 *                  .protocol(["http", "https"])
 *                  .host(["heavy1", "heavy2"])
 *                  .port(["6273", "6278"])
 *                  .dbName("mydb");
 * con.getEndpoints();
 * // ["http://heavy1:6273", "https://heavy2:6278"]
 */
export default function getEndpoints() {
    const allAreArrays =
        Array.isArray(this._host) &&
        Array.isArray(this._port) &&
        Array.isArray(this._dbName)
    if (allAreArrays) {
        return this._host.map(
            (host, i) => `${this._protocol[i]}://${host}:${this._port[i]}`
        )
    }
    return [`${this._protocol}://${this._host}:${this._port}`]
}