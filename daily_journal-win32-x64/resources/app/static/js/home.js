console.log("home.js");

const $ = require("jquery");
const ipc = require("electron").ipcRenderer;

// closing window with button
$("#window-close-btn").click(function (){
    console.log("close btn clicked");
    ipc.send("close-window");
});