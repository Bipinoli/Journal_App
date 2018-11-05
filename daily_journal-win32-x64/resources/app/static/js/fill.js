const electron = require("electron");
const ipc = electron.ipcRenderer;
const url = require("url");

const $ = require("jquery");

// ----------- Today's date ---------------------
var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var today  = new Date();
var date_string = today.toLocaleDateString("en-US", options);
console.log(date_string);
$("#date-today").text(date_string);

$("#plus-btn").click(function () {
    console.log("+ clicked");

    let html = `
        <div class="response-item card">
            <form action="#">

                    <textarea name="description" rows="2" class="textarea response-field description" placeholder="description" required autocomplete="off"></textarea>

                    <div class="level category-remove response-field">
                        <div class="select is-rounded level-left">
                            <select name="category" class="category" required>
                                <option value="education" selected="selected">Education</option>
                                <option value="entertainment">Entertainment</option>
                                <option value="finance">Finance</option>
                                <option value="medical">Medical</option>
                                <option value="development">Development</option>
                            </select>
                        </div>
                        
                        <div class="button level-right is-danger is-outlined is-rounded remove-btn">Remove</div>
                    </div>
            </form>
        </div>
        `;
    
    $(html).appendTo("#response");
});

// this doesn't work on dynamically generated html
// because it works by direct binding
// $(".remove-btn").click(function () {
//     console.log("remove btn clicked");
//     if ( $(this).parent().parent().parent().is(":first-child") ) {
//         console.log("first child");
//     }
//     else    
//         console.log("not first child");
// });


// delegated binding
// works with dynamically generated html
$("body").on("click", ".remove-btn", function () {
    console.log("remove btn clicked");
    $(this).parent().parent().parent().remove();
});


$("body").on("click", "#done-btn", function (){
    console.log("done btn clicked");

    let good_to_send = true;
    let info = [];

    $(".response-item").each(function (i, item) {
        let descp = $(item).find(".description").val();
        descp = descp.trim();

        if (descp.length >= 10000 || descp.length <= 0) {
            console.log("description cannot be empty or longer than 10000 chars");
            $("#error-notif").css("visibility", "visible");
            good_to_send = false;
            return;
        }
        let category = $(item).find(".category").val();
        console.log(descp, category);

        info.push({description: descp, category: category});
    });

    if (good_to_send)
        ipc.send("data-stream", info);


    if (good_to_send) {

        // redirect to the home page
        // i am doing this by dynamically creating a link and clicking that link
        var link = document.createElement('a');
        link.href = "../html/home.html";
        document.body.appendChild(link);
        link.click(); 
    }

});


$("#error-notif-cross-btn").click(function () {
    $("#error-notif").css("visibility", "hidden");
});

$("#cancel-btn").click(function () {
    // redirect to the home page
    // i am doing this by dynamically creating a link and clicking that link
    var link = document.createElement('a');
    link.href = "../html/home.html";
    document.body.appendChild(link);
    link.click();
});



// closing window with button
$("#window-close-btn").click(function (){
    console.log("close btn clicked");
    ipc.send("close-window");
});