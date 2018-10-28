console.log("view info js");

let past_date = new Date();
past_date.setDate(past_date.getDate() - 5);

document.getElementById("date-from").valueAsDate = past_date;
document.getElementById("date-to").valueAsDate = new Date();

const $ = require("jquery");
const electron = require("electron");
const ipc = electron.ipcRenderer;



$("#find-btn").click(function() {

    console.log("find btn clicked");

    let date_from = $("#date-from").val();
    let date_to = $("#date-to").val();
    let category = $("#category").val();

    console.log(date_from, date_to, category);

    ipc.send("query_data", {date_from: date_from, date_to: date_to, category: category});
});


ipc.on("database_data", function (event, data) {
    console.log(data);

    // $("#response-table").children(":first").css("border", "2px solid blue");
    $("#response-table").children(":first").remove();

    let html = `
    <table class="table is-fullwidth is-hoverable is-striped">
        <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Action</th>
        </tr>
    `;

    for (let i=0; i<data.length; i++) {
        html += `
            <tr>
                <td> ${data[i].created_date} </td>
                <td> ${data[i].category} </td>
                <td> ${data[i].info} </td>
                <td> <button class="button is-danger is-outlined delete-btn" id="${data[i].record_id}">Delete</button> <td>
            </tr>
        `;
    }

    html += "</table>";

    $(html).appendTo("#response-table");
});



// global value of id of record to be deleted
let record_id = null;


$("body").on("click", ".delete-btn", function (){
    console.log("delete btn clicked");

    $("#error-notif").css("visibility", "visible");

    record_id = $(this).attr('id');
});



// message from main saying the record has been deleted
ipc.on("record-deleted", function (event, record_id) {
    $(`#${record_id}`).parent().parent().remove();

    $("#error-notif").css("visibility", "hidden");
});



$(".no-btn").click(function () {
    $("#error-notif").css("visibility", "hidden");
});

$(".yes-btn").click(function () {

    console.log("sending delete message, record_id: " + record_id);
    ipc.send("delete-record", record_id);    
});



// closing window with button
$("#window-close-btn").click(function (){
    console.log("close btn clicked");
    ipc.send("close-window");
});