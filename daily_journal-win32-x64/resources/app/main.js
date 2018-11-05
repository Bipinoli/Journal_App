console.log("Main process started");

const path = require("path");
const url = require("url");
const electron = require("electron");
const app = electron.app;
const ipc = electron.ipcMain;

let win;

function createWindow() {
    win = new electron.BrowserWindow({frame: false, width: 1200, show: true, minWidth: 800});

    win.loadURL(url.format({
        pathname: path.join(__dirname, "static", "html", "home.html"),
        slashes: true,
        protocol: "file"
    }));

    win.on("closed", () => {
        // make window block in heap unreachable so that, that will be garbage collected
        win = null;
    })
}


app.on("ready", createWindow);


// closing window 
ipc.on("close-window", function(event) {
    console.log("window close request");
    win.close();
});



// --------------------- DATABASE ------------------------------

const db_connection = require("./database_handlers/db_connection");
const db_insert = require("./database_handlers/db_insert");
const db_select = require("./database_handlers/db_select");
const db_delete = require("./database_handlers/db_delete");
const db_update = require("./database_handlers/db_update");

const connection = db_connection.connect();

ipc.on("data-stream", function (event, data){
    console.log("NOTE: data-stream message from renderer", data);
    
   for (let i=0; i<data.length; i++) {
       console.log(data[i]);
       let descp = data[i].description;
       let category = data[i].category;

       let catg_id = null;

       connection.query(`SELECT id FROM categories WHERE name = "${category}" `, function (error, results, fields) {
            if (error) throw error;
            catg_id = results[0].id;

            let to_insert_data = {
                info: descp,
                category_id: catg_id
            };

            db_insert.insert(connection, "records", to_insert_data, function (error) {
                if (error) throw error;
            });
        });
   }
});




ipc.on("query_data", function(event, data) {
    console.log(data);

    let query_string = db_select.select_query(data.date_from, data.date_to, data.category);
    console.log(query_string);

    db_select.query(connection, query_string, function(error, response_data) {
        if (error) throw error;
        
        event.sender.send("database_data", response_data);
    });
});



ipc.on("delete-record", function (event, record_id) {

    let query_string = db_delete.delete_query(record_id);
    console.log(query_string);

    db_delete.delete(connection, query_string, function (error) {
        if (error) throw error;
    });

    event.sender.send("record-deleted", record_id);
});


ipc.on("update-record", function (event, updated_data) {

    console.log(`updated_data: ${updated_data.description}, category: ${updated_data.category}`);

    let category = updated_data.category;
    let record_id = updated_data.record_id;
    let description = updated_data.description;

    connection.query(`SELECT id FROM categories WHERE name = "${category}" `, function (error, results, fields) {
        if (error) throw error;
        catg_id = results[0].id;

        
        let query_string = db_update.update_query(record_id, catg_id, description);
        console.log(query_string);
    
        db_update.update(connection, query_string, function (error) {
            if (error) throw error;
        });
    
        event.sender.send("record-updated", updated_data);
    });

});


app.on("closed", function (){
    console.log("closing database connection");
    db_connection.disconnect();
});