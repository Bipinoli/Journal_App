
module.exports = {

    delete_query: function(record_id) {

        let query_string = 
        `
            DELETE FROM records
            WHERE id = ${record_id}
        `;

        return query_string;
    },

    delete: function (connection, query_string, callback) {

        connection.query(query_string, function(error, results, fields) {
            if (error) callback(error);
        });
    }
};