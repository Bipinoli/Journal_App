console.log("home.js");

const $ = require("jquery");
const ipc = require("electron").ipcRenderer;
const remote = require("electron").remote;

// closing window with button
$("#window-close-btn").click(function (){
    console.log("close btn clicked");
    ipc.send("close-window");
});


let username = remote.getGlobal("user").username;
username = username.trim().toLowerCase();
username = username.charAt(0).toUpperCase() + username.substring(1);
console.log(username);

$("#title").html(`Hello, ${username}`);


$("#logout-btn").click(function () {
    console.log("logout button pressed");
    remote.getGlobal("user").username = null;
})