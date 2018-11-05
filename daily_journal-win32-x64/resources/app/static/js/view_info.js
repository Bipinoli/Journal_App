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
                <td> 
                    <div class="flex-row">
                        <button class="button is-warning is-outlined edit-btn" id="edit-${data[i].record_id}">Edit</button> 
                        <button class="button is-danger is-outlined delete-btn" id="${data[i].record_id}">Delete</button> 
                    </div>
                <td>
            </tr>
        `;
    }

    html += "</table>";

    $(html).appendTo("#response-table");
});



// --------------- handling delete and edit button ---------------------------------

// global value of id of record to be deleted
let record_id = null;
let to_delete = null;


$("body").on("click", ".delete-btn", function (){
    console.log("delete btn clicked");

    $("#error-notif").css("visibility", "visible");

    record_id = $(this).attr('id');
    to_delete = true;
});







// -----------------------------------------------------------------

$("body").on("click", ".edit-btn",  function () {
    console.log("edit button clicked");
    
    // info is 3rd child, category is 1st child in html DOM
    let descrip = $(this).parent().parent().parent().children("td").eq(2).text();
    let category = $(this).parent().parent().parent().children('td').eq(1).html();
    category = category.trim();
    
    document.getElementById("edit-description").value = descrip;
    $("#edit-box #edit-category").val(category).prop("selected", true);
    $("#edit-box").css("visibility", "visible");
    
    record_id = $(this).attr('id');
    if (record_id.includes("edit")) {
        // record_id shouldn't include "edit-" which is of length 5
        record_id = record_id.substring(5);
    }
    to_delete = false;
});


$("#edit-cancel-btn").click(function() {
    $("#edit-box").css("visibility", "hidden");
});

$("#edit-done-btn").click(function () {
    $("#edit-box").css("visibility", "hidden");
    $("#error-notif").css("visibility", "visible");
});



// --------------------------------------------------------------------------

// ---------- update/delete confirmation ----------------

$(".no-btn").click(function () {
    $("#error-notif").css("visibility", "hidden");
    if (to_delete === false) {
        // go back to the edit view
        $("#edit-box").css("visibility", "visible");
    }
});

$("body").on("click", ".yes-btn", function () {
    console.log("sending update/delete message, record_id: " + record_id);
    
    if (to_delete === true) {
        ipc.send("delete-record", record_id);    
        to_delete = null;
    }
    
    else if (to_delete === false) {
        
        let updated_data = {
            record_id: record_id,
            description: document.getElementById("edit-description").value.trim(),
            category: document.getElementById("edit-category").value 
        };

        if (updated_data.description.length <= 0 || updated_data.description.length >= 10000) {
            $("#error-notif").css("visibility", "hidden");
            $("#invalid-description-handler").css("visibility", "visible");
            return;
        }   

        ipc.send("update-record", updated_data);
        to_delete = null;
    }
});


// ------------- handling invalid update ----------------------
$("#invalid-description-handler-cross-btn").click(function () {
    $("#invalid-description-handler").css("visibility", "hidden");
}); 


// ---------- record updated/deleted -----------------------------

// message from main saying the record has been deleted
ipc.on("record-deleted", function (event, record_id) {
    $(`#${record_id}`).parent().parent().parent().remove();

    $("#error-notif").css("visibility", "hidden");
});


// message from main saying the record has been deleted
ipc.on("record-updated", function (event, updated_data) {
    let record_id = updated_data.record_id;
    let category = updated_data.category;
    let description = updated_data.description;

    $(`#${record_id}`).parent().parent().parent().children('td').eq(1).text(category);
    $(`#${record_id}`).parent().parent().parent().children('td').eq(2).text(description);
    
    $("#error-notif").css("visibility", "hidden");
});


// --------------------------------------------------------------------------

// closing window with button
$("#window-close-btn").click(function (){
    console.log("close btn clicked");
    ipc.send("close-window");
});