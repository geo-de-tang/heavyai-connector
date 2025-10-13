/**
 * Get the names of the databases that exist in the current session connection.
 * @returns {Promise.<Object[]>} List of table objects containing the label and table names.
 */
export default function getTablesAsync() {
    console.log('[HeavyDB] getTablesAsync called');
    const getTables = this.wrapThrift(
        "get_tables",
        this.overSingleClient,
        (args) => args
    )
    return getTables().then((tables) =>
        tables.map((table) => ({
            name: table,
            label: "obs"
        }))
    )
}