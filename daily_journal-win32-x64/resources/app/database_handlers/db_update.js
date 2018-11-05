
module.exports = {

    update_query: function (record_id, category_id, description) {

        let query_string = 
        `
            UPDATE records
            SET 
                category_id = ${category_id},
                info = "${description}"
            WHERE
                id = ${record_id}
        `;

        return query_string;
    },

    update: function (connection, query_string, callback) {

        connection.query(query_string, function(error, results, fields) {
            if (error) callback(error);
        });
    }
};