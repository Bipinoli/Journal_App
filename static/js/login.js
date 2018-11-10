const ipc = require("electron").ipcRenderer;
const $ = require("jquery");

$('.message a').click(function(){
    $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
 });


$("#register-account-btn").click(function() {
    console.log("register account button clicked!");

    let uname = $("#register-uname").val().trim();
    let pwd = $("#register-pwd").val().trim();
    let confirm_pwd = $("#register-confirm-pwd").val().trim();

    let error_msg = "Sorry!<br>";
    let error_occured = false;

    if (uname.length == 0 || uname.length >= 255) {
        console.error("username has invalid length");
        error_msg += "username has invalid length<br>";
        error_occured = true;
    }

    else if (pwd != confirm_pwd) {
        console.error("password and confirm password do not match");
        error_msg += "password and confirm password do not match<br>";
        error_occured = true;
    }

    else if (pwd.length == 0) {
        console.error("password cannot be empty or just contain spaces");
        error_msg += "password cannot be empty or just contain spaces<br>";
        error_occured = true;
    }

    else if (pwd.length >= 50) {
        console.error("password is too long");
        error_msg += "password is too long<br>";
        error_occured = true;
    }

    if (error_occured) {
        console.log("error occured");
        $("#invalid-credentials-error-msg").html(error_msg);
        $("#invalid-credentials-handler").css("visibility", "visible");
        return;
    }
    
    console.log(uname, pwd, confirm_pwd);
    ipc.send("register_account", {
        username: uname,
        password: pwd
    });
});




ipc.on("account_registered", function () {
    $("#msg-btn").click();
    
    $("#account-registered-handler").css("visibility", "visible");
    $("#register-pwd").val("");
    $("#register-confirm-pwd").val("");
    $("#register-uname").val("");
});

ipc.on("account_already_exists_error", function () {
    let error_msg = "Sorry!<br> Account already exists with that username";
    $("#invalid-credentials-error-msg").html(error_msg);
    $("#invalid-credentials-handler").css("visibility", "visible");
});



$("#login-btn").click(function() {
    console.log("Login button clicked!");

    let uname = $("#login-uname").val().trim();
    let pwd = $("#login-pwd").val().trim();

    let error_msg = "Sorry!<br>";
    let error_occured = false;

    if (uname.length == 0 || uname.length >= 255) {
        console.error("username has invalid length");
        error_msg += "username has invalid length<br>";
        error_occured = true;
    }
    else if (pwd.length == 0) {
        console.error("password cannot be empty or just contain spaces");
        error_msg += "You have to provide the Password<br>";
        error_occured = true;
    }
    else if (pwd.length >= 50) {
        console.error("password is too long");
        error_msg += "Incorrect! Password<br>";
        error_occured = true;
    }

    if (error_occured) {
        console.log("error occured");
        $("#invalid-credentials-error-msg").html(error_msg);
        $("#invalid-credentials-handler").css("visibility", "visible");
        return;
    }
    
    console.log(uname, pwd);
    ipc.send("account_login", {
        username: uname,
        password: pwd
    });
});


ipc.on("login_error", function (event, data) {
    let error_msg = `Sorry!<br> ${data.msg}`;
    $("#invalid-credentials-error-msg").html(error_msg);
    $("#invalid-credentials-handler").css("visibility", "visible");
});

ipc.on("login_success", function (event, data) {
    console.log(data.username + " has been logged into the system");

    // redirect to the home page
    // i am doing this by dynamically creating a link and clicking that link
    var link = document.createElement('a');
    link.href = "../html/home.html";
    document.body.appendChild(link);
    link.click();     
});




$("#invalid-credentials-handler-cross-btn").click(function() {
    $("#invalid-credentials-handler").css("visibility", "hidden");
});

$("#account-registered-handler-cross-btn").click(function() {
    $("#account-registered-handler").css("visibility", "hidden");
});




// --------------------------------------------------------------------------

// closing window with button
$("#window-close-btn").click(function (){
    console.log("close btn clicked");
    ipc.send("close-window");
});