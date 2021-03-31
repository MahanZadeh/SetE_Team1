// https://github.com/nizarmah/calendar-javascript-lib

// Implement Calendar functions

var calendar = new Calendar("calendarContainer", // HTML container ID,                           Required
    "small", // Size: (small, medium, large)                                                     Required
    ["Sunday", 3], // [ Starting day, day abbreviation length ]                                  Required
    ["#ffc107", // Primary Color                                                                 Required
        "#ffa000", // Primary Dark Color                                                         Required
        "#ffffff", // Text Color                                                                 Required
        "#ffecb3"
    ], // Text Dark Color                                                                        Required
    { // Following is optional
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        indicator: true, // Day Event Indicator                                                                    Optional
        indicator_type: 1, // Day Event Indicator Type (0 not to display num of events, 1 to display num of events)  Optional
        indicator_pos: "bottom", // Day Event Indicator Position (top, bottom)                                             Optional
        placeholder: "<span>Custom Placeholder</span>"
    });

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        // load data

    }

});