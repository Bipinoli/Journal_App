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

$("#change-password").click(function () {
    $("#change-password-block").css("visibility", "visible");
});




// change password handlers   

function resetFields() {
    $("#old-password").val("");
    $("#new-password").val("");
    $("#confirm-password").val("");
}


function findErrorsInPassword(old_pwd, new_pwd, confirm_pwd) {
    if (old_pwd.length == 0)
        return "You have to provide the Password<br>";
    if (old_pwd.length >= 50) 
        return "Incorrect! Password<br>";
    if (new_pwd.length == 0 || confirm_pwd.length == 0)
        return "New password cannot be empty or just spaces<br>";
    if (new_pwd.length >= 50 || confirm_pwd.length >= 50)
        return "Password is too long<br>";
    if (new_pwd != confirm_pwd) 
        return "Password and confirm password do not match<br>";
    return null;
}

$("#done-btn").click(function () {
    console.log("done button clicked");

    let old_pwd = $("#old-password").val().trim();
    let new_pwd = $("#new-password").val().trim();
    let confirm_pwd = $("#confirm-password").val().trim();

    console.log(old_pwd, new_pwd, confirm_pwd);

    let error_msg = findErrorsInPassword(old_pwd, new_pwd, confirm_pwd);

    if (error_msg != null) {
        $("#change-password-error-msg").html("Sorry!<br>" + error_msg);
        $("#change-password-error-notification").css("visibility", "visible");
        return;
    }

    console.log("requesting password change");

    ipc.send("change_password", {
        password: old_pwd,
        new_password: new_pwd 
    });

    resetFields();
});


ipc.on("incorrect_password", function() {
    let error_msg = "Sorry!<br> That was not the old password";
    $("#change-password-error-msg").html(error_msg);
    $("#change-password-error-notification").css("visibility", "visible");
});

ipc.on("change_password_success", function () {
    // redirect to the home page
    // i am doing this by dynamically creating a link and clicking that link
    var link = document.createElement('a');
    link.href = "../html/login.html";
    document.body.appendChild(link);
    link.click();
});

// password handler error message cancel button

$("#error-msg-cancel-btn").click(function (){
    $("#change-password-error-notification").css("visibility", "hidden");
});



$("#cancel-btn").click(function () {
    console.log("cancel button clicked");

    resetFields();
    $("#change-password-block").css("visibility", "hidden");
})