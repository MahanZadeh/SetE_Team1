let params = (new URL(document.location)).searchParams;

function createBootstrapNotification(message) {
    let notificationDiv = document.getElementById("notification_container");

    let setMessage = notificationHtml => {
        notificationDiv.innerHTML = notificationHtml;
        notificationDiv.querySelector("#notification_text").textContent = message;
    };

    // Fetch notification template, then put it's html content into a div and apply the message.
    fetch("./html_templates/authNotification.html").then(function(response) {
        response.text().then(setMessage);
    }).catch(function(err) {
        console.log(`Could not create notification, reason : ${err}`)
    });
}

function checkForNotification(params) {
    if (params.has("loginSuccessful")) {
        createBootstrapNotification("You've been signed in!");
    } else if (params.has("signupSuccessful")) {
        createBootstrapNotification("You've been signed up for EduCal!")
    }
}

checkForNotification(params);