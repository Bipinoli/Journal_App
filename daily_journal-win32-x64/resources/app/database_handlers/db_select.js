
module.exports = {

    select_query: function (date_from, date_to, category) {
        
        let query_string = `
            SELECT 
                records.id AS record_id,
                DATE_FORMAT(created_at, "%W, %D %M, %Y") AS created_date,
                info,
                name AS category 
            FROM records
            INNER JOIN categories
                ON records.category_id = categories.id
            WHERE
                DATE(created_at) BETWEEN "${date_from}" AND "${date_to}" `;

        if (category != "all") {
            query_string += ` && categories.name = "${category}" `;
        }
            
        query_string += `
            ORDER BY created_date DESC, category ASC
        `;

        return query_string;
    },

    query: function (connection, query_string, callback) {

        connection.query(query_string, function(error, results, fields) {
            if (error) callback(error, null);
            // console.log(results);
    
            let response = [];
            for (let i=0; i<results.length; i++) {
                response.push({
                    record_id: results[i].record_id,
                    created_date: results[i].created_date,
                    info: results[i].info,
                    category: results[i].category
                });
            }
    
            callback(null, response);
        });
    }

};