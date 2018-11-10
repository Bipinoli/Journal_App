console.log("Main process started");

const path = require("path");
const url = require("url");
const electron = require("electron");
const app = electron.app;
const ipc = electron.ipcMain;

const bcrypt = require("bcrypt-nodejs");

let win;

function createWindow() {
    win = new electron.BrowserWindow({frame: false, width: 1200, show: true, minWidth: 800});

    // global variable holding username of the logged in user
    global.user = {
        username: null
    }

    win.loadURL(url.format({
        // pathname: path.join(__dirname, "static", "html", "home.html"),
        pathname: path.join(__dirname, "static", "html", "login.html"),
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



ipc.on("register_account", function (event, data) {
    console.log("account to be registered");

    console.log(data.username, data.password);
    bcrypt.hash(data.password, null, null, function(err, hash) {
        console.log(data.password + ":", hash);

        let query_string = 
        `
        INSERT INTO users
            (username, password)
        VALUES 
            ("${data.username}", "${hash}");
        `;

        console.log(query_string);

        connection.query(query_string, function (error, results, fields) {
            if (error) {
                if (error.code == "ER_DUP_ENTRY") {
                    console.log("duplicate entry error");
                    event.sender.send("account_already_exists_error");
                    return;
                }
                throw error;
            }

            event.sender.send("account_registered");
        });
    });

});


ipc.on("account_login", function (event, data) {

    let query_string = 
    `
        SELECT username, password
        FROM users
        WHERE username = "${data.username}" 
    `;

    console.log(query_string);

    connection.query(query_string, function (error, results, fields) {
        if (error) throw error;
        console.log(results);

        if (results.length <= 0) {
            console.log("User doesn't exist");
            event.sender.send("login_error", {msg: "There is no account with that username"});
            return;
        }

        let pwd_hash = results[0].password;
        let pwd = data.password;

        bcrypt.compare(pwd, pwd_hash, function (error, res) {
            if (res === false) {
                event.sender.send("login_error", {msg: "Incorrect! Password"});
                return;
            }

            if (res === true) {
                console.log("successful login");
                global.user.username = data.username;
                event.sender.send("login_success", {username: data.username});
            }
        });
    });
});



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
                category_id: catg_id,
                username: global.user.username
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



ipc.on("change_password", function (event, data) {
    console.log("request to change password");

    let pwd = data.password;
    let new_pwd = data.new_password;
    console.log(pwd, new_pwd);

    let query_string = 
    `
        SELECT password 
        FROM users
        WHERE username = "${global.user.username}"
    `;

    console.log(query_string);

    connection.query(query_string, function (error, results, fields) {
        if (error) throw error;
        let hash_pwd = results[0].password;
        console.log("hash: " + hash_pwd);

        bcrypt.compare(pwd, hash_pwd, function (error, res) {
            if (error) throw error;
            if (res === true) {
                console.log("correct old password");

                bcrypt.hash(new_pwd, null, null, function(err, hash){

                    let query_string = 
                    `
                        UPDATE users SET password = "${hash}"
                        WHERE username = "${global.user.username}"
                    `;

                    connection.query(query_string, function (error, results, fields) {
                        if (error) throw error;
                        
                        event.sender.send("change_password_success");
                    })

                });

            }
            if (res === false) {
                console.log("incorrect old password");
                event.sender.send("incorrect_password");
                return;
            }
        });
    });
});





app.on("closed", function (){
    console.log("closing database connection");
    db_connection.disconnect();
});