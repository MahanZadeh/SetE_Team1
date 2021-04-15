var userId = undefined;
// `user` should have matching keys to `profile_data_form`
let profileDataForm = {
    "links": [getElem("profile_links")],
    "name": [getElem("profile_name"), getElem("profile_name_large")],
    "email": [getElem("profile_email")],
    "phone": [getElem("profile_phone")],
    "address": [getElem("profile_address")],
    // "profilePic": [getElem("mypic-goes-here")],
};





function getElem(id) {
    return document.getElementById(id);
}

function setValue(node, text) {
    if (node.tagName === "INPUT") {
        node.value = text;
    } else {
        node.innerText = text;
    }
}

function addAsListOfLinks(user_data, parentNode) {
    user_data.forEach(userLink => {
        let liNode = document.createElement("li");
        let a = document.createElement("a");
        a.href = user_data;
        a.textContent = "A link";
        liNode.className = "";
        setValue(liNode, userLink);
        parentNode.appendChild(liNode);
    });

}

function loadUserProfile(user) {
    for (let [key, htmlNodeList] of Object.entries(profileDataForm)) {
        let user_data = user[key];
        for (let element of htmlNodeList) {
            // If  an array, we assume `element` is a ul/ol for links.
            if (Array.isArray(user_data)) {
                addAsListOfLinks(user_data, element);
            } else {
                setValue(element, user_data);
            }
        }
    };

    // Now load profile picture
    $("#mypic-goes-here").attr("src", user.profilePic);
}


// it doesn't quite work, it needs to update the same collection, not create a new one. 

// to grab and update phone number from the profile page and adding it to the database
function addInputListener(key, profileInput) {
    profileInput.addEventListener('blur', event => {
        let inputField = event.currentTarget;
        let data = {};
        data[key] = inputField.value;

        db.collection("users").doc(userId).update(data).then(_ => console.log('added!')).catch(err => console.log(err));
    });
}

function addEventListenersForInputs() {
    for (let [key, listOfElements] of Object.entries(profileDataForm)) {
        for (let htmlElement of listOfElements) {
            if (htmlElement.tagName === "INPUT") {
                addInputListener(key, htmlElement);
            }
        }
    }
    showUploadedPictureListener();
}


// Render the image that was chosen
function showUploadedPictureListener() {
    const fileInput = document.getElementById("mypic-input"); // pointer #1
    const image = document.getElementById("mypic-goes-here"); // pointer #2
    fileInput.addEventListener('change', function(e) { //event listener
        var blob = URL.createObjectURL(e.target.files[0]);
        image.src = blob; //change DOM image
    })
}

function uploadProfilePicListener(userUid) {
    // Let's assume my storage is only enabled for authenticated users 
    // This is set in your firebase console storage "rules" tab
    if (!userUid) { console.err("Not logged in!"); return };

    var fileInput = document.getElementById("mypic-input"); // pointer #1
    const image = document.getElementById("mypic-goes-here"); // pointer #2

    // listen for file selection
    fileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        var blob = URL.createObjectURL(file);
        image.src = blob; // display this image

        //store using this name
        var storageRef = storage.ref("images/" + userUid + ".jpg");

        //upload the picked file
        storageRef.put(file)
            .then(function() {
                console.log('Uploaded to Cloud Storage.');
            });

        //get the URL of stored file
        storageRef.getDownloadURL()
            .then(function(url) { // Get URL of the uploaded file
                console.log(url); // Save the URL into users collection
                db.collection("users").doc(userUid).update({
                        "profilePic": url
                    })
                    .then(function() {
                        console.log('Added Profile Pic URL to Firestore.');
                    })
            });
    });

}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        userId = user.uid;
        db.collection("users").doc(user.uid).get().then(function(user) {
            let userData = user.data();
            uploadProfilePicListener(userId);
            loadUserProfile(userData);
        });
    }
});


addEventListenersForInputs();