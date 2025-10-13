/**
 * Get the users list from the database.
 * @return {Promise<Object>} The list of users.
 * @example <caption>Get the users list:</caption>
 * con.getUsersAsync().then(res => console.log(res))
 * // [{user_name: "user1", is_super_user: true, default_db: "heavyai"}, ...]
 */
export default function getUsersAsync() {
    return this.wrapThrift('get_users', [
        this._client,
        this._sessionId
    ])
}