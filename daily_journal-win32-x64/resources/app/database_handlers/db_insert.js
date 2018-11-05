
module.exports = {

    insert: function (connection, schema_name, data, call_back) {

        console.log('call back is: ');
        console.log(typeof call_back);

        let fields = Object.keys(data);
        let fields_string = "";
        let value_string = "";
        for (let i=0; i<fields.length; i++) {

            fields_string += fields[i];

            // add qutotation only if its not numeric field
            let val = `${data[fields[i]]}`;
            if (typeof data[fields[i]] === "string") {
                val = `"${data[fields[i]]}"`;
            }
            console.log(val);
            
            value_string += val;
            if (i != fields.length - 1) {
                fields_string += ", ";
                value_string += ", ";
            }
        }

        // console.log(fields_string);
        // console.log(value_string);

        let insert_query = `
            INSERT INTO   ${schema_name}
                    ( ${fields_string} )
            VALUES
                    ( ${value_string} )
        `;

        console.log(`
            --------- db_insert.js ----------------
            ${insert_query}
        `);

        connection.query(insert_query, function (error, results, fields) {
            if (error) call_back(error);
        });
    }

};
