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
    user_data.forEach(function(stringEntry) {
        let liNode = document.createElement("li");
        let a = document.createElement("a");
        a.href = user_data;
        a.textContent = "A link";
        liNode.className = "";
        setValue(liNode, stringEntry);
        parentNode.appendChild(liNode);
    });

}

function loadUserProfile(user) {
    Object.keys(profile_data_form).forEach(function(key) {
        profile_data_form[key].forEach(function(profile_node) {
            let user_data = user[key];
            if (Array.isArray(user_data)) {
                addAsListOfLinks(user_data, profile_node);
            } else {
                setValue(profile_node, user_data);
            }
        })
    })
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        db.collection("users").doc(user.uid).get().then(function(user) {
            loadUserProfile(user.data());
        })
    }
});