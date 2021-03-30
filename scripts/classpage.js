// `user` should have matching keys to `profile_data_form`
let course_data = {
    "coursename": [getElem("classname")],
    "instructor": [getElem("instructorname")],
    "outline": [getElem("outlinebutton")],
    "": [getElem("lecturebutton")],
    "": [getElem("labbutton")],
};


function getFormInputs() {
    document.getElementById("name_change").addEventListener('click', function () {
        firebase.auth().onAuthStateChanged(function (user) {

            // get various values from the form
            let  class_name = document.getElementById("name_input").value;

            db.collection("courses")
                .collection("name")
                .add({
                    "coursename": class_name,   //from text field
                })
        })
    })
}
getFormInputs();