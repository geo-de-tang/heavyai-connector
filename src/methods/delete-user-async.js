/**
 * Delete a user from the database.
 * @param {String} userName - Name of the user to delete.
 * @return {Promise<Object>} Returns empty object on success.
 * @example <caption>Delete a user:</caption>
 * con.deleteUserAsync("olduser").then(res => console.log(res))
 */
export default function deleteUserAsync(userName) {
    return this.wrapThrift('delete_user', [
        this._client,
        this._sessionId,
        userName
    ])
}