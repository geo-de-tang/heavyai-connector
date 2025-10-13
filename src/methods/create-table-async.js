/**
 * Create a table and persist it to the database.
 * @param {String} table_name - Name of the new table.
 * @param {Array<TColumnType>} schema - Array of TColumnType objects. {@link https://github.com/heavyai/heavydb/blob/master/heavy.thrift|See TColumnType}
 * @param {Object} options - Options for creation.
 * @param {Number} [options.fragmentSize=null] - Fragment size for the table. Gets applied to all columns.
 * @param {Number} [options.pageSize=null] - Page size for the table.
 * @param {Number} [options.maxRows=null] - Maximum number of rows for the table.
 * @param {String} [options.partitionType=null] - Partition type for the table.
 * @param {String} [options.shardCount=null] - Number of shards.
 * @param {Boolean} [options.isReplicated=null] - Is the table replicated?
 * @param {Object} [options.storageType=null] - Storage type for the table.
 * @param {Array} [options.sortColumnIds=null] - Array of column IDs for sorting.
 * @return {Promise<Object>} The result of the table creation.
 * @example <caption>Create a table:</caption>
 * 
 * con.createTableAsync("mynewtable", [
 *   {col_name: "col1", col_type: {type: 6, encoding: 4, nullable: true, is_array: false, precision: 10, scale: 2}},
 *   {col_name: "col2", col_type: {type: 6, encoding: 4, nullable: true, is_array: false, precision: 10, scale: 2}}
 * ]).then(res => console.log(res));
 */
export default function createTableAsync(table_name, schema, options = {}) {
    const tableOptions = {
        fragment_size: options.fragmentSize || null,
        page_size: options.pageSize || null,
        max_rows: options.maxRows || null,
        partition_type: options.partitionType || null,
        shard_count: options.shardCount || null,
        is_replicated: options.isReplicated || null,
        storage_type: options.storageType || null,
        sort_column_ids: options.sortColumnIds || null
    }

    return this.wrapThrift('create_table', [
        this._client,
        this._sessionId,
        table_name,
        schema,
        tableOptions
    ])
}