// `user` should have matching keys to `profile_data_form`
let profile_data_form = {
    "links": [getElem("profile_links")],
    "name": [getElem("profile_name"), getElem("profile_name_large")],
    "email": [getElem("profile_email")],
    "phone": [getElem("profile_phone")],
    "address": [getElem("profile_address")],
    "courseIds": [getElem("profile_courses")]
};


function getElem(id) {
    return document.getElementById(id);
}

function setValue(node, text) {
    node.innerText = text;
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

    for (let [key, htmlNodeList] of Object.entries(profile_data_form)) {
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


}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        db.collection("users").doc(user.uid).get().then(function(user) {
            loadUserProfile(user.data());
        });
    }
});


// it doesn't quite work, it needs to update the same collection, not create a new one. 

// to grab and update phone number from the profile page and adding it to the database
function getFormInputs() {
    document.getElementById("phone_change").addEventListener('click', function () {
        firebase.auth().onAuthStateChanged(function (user) {

            // get various values from the form
            let  phone = document.getElementById("phone_input").value;

            db.collection("users")
                .doc(user.uid)
                .collection("links")
                .add({
                    "phone": phone,   //from text field
                })
        })
    })
}
getFormInputs();