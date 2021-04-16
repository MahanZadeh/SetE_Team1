/*Implement signout functionality for navigation bar (we'd usually do this with a backend..)*/

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        let signinButtonRef = $('#signin-signout').text("Sign out");
        signinButtonRef.on('click', _ => {
            firebase.auth().signOut().catch(error => console.log(error));
        });

    } else {}
});