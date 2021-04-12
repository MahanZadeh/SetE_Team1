// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBYfXLEIHoACLXQ3BTXwA1skw7os88VZdg",
    authDomain: "educal-9f53f.firebaseapp.com",
    projectId: "educal-9f53f",
    storageBucket: "educal-9f53f.appspot.com",
    messagingSenderId: "859862306977",
    appId: "1:859862306977:web:44b23e0d9f7e83c89aa0e0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
var storage = firebase.storage();



/*Origianl Firbase Storage Rules

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth == null;
    }
  }
}


*/
