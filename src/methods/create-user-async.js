/**
 * Create a new user in the database.
 * @param {String} userName - Name of the new user.
 * @param {String} userPassword - Password for the new user.
 * @param {Boolean} isSuper - Whether the user should have superuser privileges.
 * @return {Promise<Object>} Returns empty object on success.
 * @example <caption>Create a user:</caption>
 * con.createUserAsync("newuser", "password123", false).then(res => console.log(res))
 */
export default function createUserAsync(userName, userPassword, isSuper = false) {
    return this.wrapThrift('create_user', [
        this._client,
        this._sessionId,
        userName,
        userPassword,
        isSuper
    ])
}