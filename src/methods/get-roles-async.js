/**
 * Get the list of available roles.
 * @return {Promise<Object>} The list of roles available on the server.
 * @example <caption>Get the roles list:</caption>
 * con.getRolesAsync().then(res => console.log(res))
 * // [{ role_name: "role1" }, ...]
 */
export default function getRolesAsync() {
    return this.wrapThrift('get_roles', [
        this._client,
        this._sessionId
    ])
}