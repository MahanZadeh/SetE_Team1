"use strict";
/*

EXPECTED HTML IDS:
#schedule_modal

in schedule_modal:
    title: input for text,
    class_link: input for text,
    start_date: tui.DatePicker,
    end_date: tui.DatePicker

*/

let userId = undefined;
let userSchedules;

/**
 *   Default info used for the calendar, in future each user will be able to modify their own version of this template,
 *   due to time constraint, each user will instead store this information in the cloud, so in future user's can have customized colors for each
 *   event on the calendar.
 */
const CALENDAR_INFO = new(function() {
    this.id = "";
    this.name = "Educal Calendar";
    this.color = "#ffffff";
    this.bgColor = "#9e5fff";
    this.dragBgColor = "#9e5fff";
    this.borderColor = "#9e5fff";
})();

/** Creates date objects for the start and end date in the schedule modal
 *
 */
const [START_DATE_PICKER, END_DATE_PICKER] = (() => {
    let makeDatePicker = (wrapper, element) =>
        new tui.DatePicker(wrapper, {
            date: new Date(),
            input: {
                element,
                format: "yyyy-MM-dd"
            },
        });

    let startPicker = makeDatePicker("#start_wrapper", "#datepicker-start");
    let endPicker = makeDatePicker("#end_wrapper", "#datepicker-end");

    return [startPicker, endPicker];
})();

function saveScheduleToFirebase(scheduleId, schedule) {
    if (!userId) return;

    db.collection('userSchedules').doc(scheduleId).set({
        userId: userId,
        ...schedule
    });

}
/**Updates firebase for new schedule location.
 * 
 * @param {*} changes 
 */
function updateScheduleChanges(scheduleId, changes) {

    if (changes.end) {
        changes.end = firebase.firestore.Timestamp.fromDate(changes.end);
    }
    if (changes.start) {
        changes.start = firebase.firestore.Timestamp.fromDate(changes.start);
    }
    console.log(changes);

    db.collection('userSchedules').doc(scheduleId).update(changes);
}

/**Instantiate `tui.Calendar` objec to `window`.
 
Everything and anything to do with the calendar's client-side functionality, 
this includes creating the calendar, and it's controller (all associated functions)

*/
const calendar = (function(window, Calendar) {
    var cal, resizeThrottled;
    let currentScheduleId;
    cal = new Calendar("#calendar", {
        defaultView: "week",
        calendarId: "calendar",
        useCreationPopup: false,
        useDetailPopup: false,
        template: {
            time: function(schedule) {
                return getTimeTemplate(schedule);
            },
        },
    });

    // event handlers
    cal.on({
        clickMore: function(e) {
            console.log("clickMore", e);
        },
        clickSchedule: function(e) {
            currentScheduleId = e.schedule.id;
            popupScheduleEdit(e.schedule, true);
        },
        clickDayname: function(date) {
            console.log("clickDayname", date);
        },
        beforeCreateSchedule: function(event) {
            popupScheduleEdit(event);
        },
        beforeUpdateSchedule: function(e) {
            var schedule = e.schedule;
            var changes = e.changes;
            cal.updateSchedule(schedule.id, schedule.calendarId, changes);
            updateScheduleChanges(schedule.id, changes);
            refreshScheduleVisibility();
        },
        beforeDeleteSchedule: function(e) {

        },
        afterRenderSchedule: function(e) {},
        clickTimezonesCollapseBtn: function(timezonesCollapsed) {

            if (timezonesCollapsed) {
                cal.setTheme({
                    "week.daygridLeft.width": "77px",
                    "week.timegridLeft.width": "77px",
                });
            } else {
                cal.setTheme({
                    "week.daygridLeft.width": "60px",
                    "week.timegridLeft.width": "60px",
                });
            }

            return true;
        },
    });

    // Controller functions //
    /**
     * Get time template for time 
     * @param {Schedule} schedule - schedule
     * @returns {string}
     */
    function getTimeTemplate(schedule) {
        var start = moment(schedule.start.toUTCString()).format("HH:mm a");
        var html = [];

        html.push("<strong>" + start + "</strong> ");


        html.push(`<a href="${schedule.raw.class_link}">${schedule.title}</a>`);


        return html.join("");
    }

    /**
     * A listener for click the menu
     * @param {Event} e - click event
     */
    function onClickMenu(e) {
        var target = $(e.target).closest('a[role="menuitem"]')[0];
        var action = getDataAction(target);
        var options = cal.getOptions();
        var viewName = "";

        switch (action) {
            case "toggle-daily":
                viewName = "day";
                break;
            case "toggle-weekly":
                viewName = "week";
                break;
            case "toggle-monthly":
                options.month.visibleWeeksCount = 0;
                viewName = "month";
                break;
            case "toggle-weeks2":
                options.month.visibleWeeksCount = 2;
                viewName = "month";
                break;
            case "toggle-weeks3":
                options.month.visibleWeeksCount = 3;
                viewName = "month";
                break;
            case "toggle-narrow-weekend":
                options.month.narrowWeekend = !options.month.narrowWeekend;
                options.week.narrowWeekend = !options.week.narrowWeekend;
                viewName = cal.getViewName();

                target.querySelector("input").checked = options.month.narrowWeekend;
                break;
            case "toggle-start-day-1":
                options.month.startDayOfWeek = options.month.startDayOfWeek ? 0 : 1;
                options.week.startDayOfWeek = options.week.startDayOfWeek ? 0 : 1;
                viewName = cal.getViewName();

                target.querySelector("input").checked = options.month.startDayOfWeek;
                break;
            case "toggle-workweek":
                options.month.workweek = !options.month.workweek;
                options.week.workweek = !options.week.workweek;
                viewName = cal.getViewName();

                target.querySelector("input").checked = !options.month.workweek;
                break;
            default:
                break;
        }

        cal.setOptions(options, true);
        cal.changeView(viewName, true);

        setDropdownCalendarType();
        setRenderRangeText();
        loadUserSchedules();
    }

    function onClickNavi(e) {
        var action = getDataAction(e.target);

        switch (action) {
            case "move-prev":
                cal.prev();
                break;
            case "move-next":
                cal.next();
                break;
            case "move-today":
                cal.today();
                break;
            default:
                return;
        }

        setRenderRangeText();
        loadUserSchedules();
    }


    function getScheduleModalData() {
        return {
            title: $("#title").val(),
            class_link: $("#class_link").val(),
            start: START_DATE_PICKER.getDate(),
            end: END_DATE_PICKER.getDate(),
        };
    }

    /**
     * Show or Hide shedule-editor modal
     * @param {boolean} show - boolean indicating whether to show or hide the modal
     */
    function makeScheduleModalVisible(show) {
        let schedulePopup = $("#schedule_modal");
        schedulePopup.modal(show ? "show" : "hide");
    }

    function loadScheduleIntoModal(schedule) {
        if (schedule.title)
            $('#title').val(schedule.title);
        if (schedule.raw && schedule.raw.class_link)
            $('#class_link').val(schedule.raw.class_link);
        if (schedule.start) START_DATE_PICKER.setDate(schedule.start.toDate());
        if (schedule.end) END_DATE_PICKER.setDate(schedule.end.toDate());

    }

    /**Display schedule editor modal for user.
     *
     * @param {Schedule} schedule
     */
    function popupScheduleEdit(newScheduleEvent, isUpdate = false) {
        // Update the save button for the schedule modal to match the isUpdate boolean.
        // this is done because the save functionality can use isUpdate to determine what kind of write to 
        // firebase we are comitting. 
        $('#modal_save').attr("isUpdate", isUpdate.toString());
        // Clear shedule edit form
        $("#shedule_form")[0].reset();
        loadScheduleIntoModal(newScheduleEvent);
        // Load data into schedule Modal
        makeScheduleModalVisible(true);
    }



    function addNewSchedule(scheduleData) {
        let scheduleObject = makeScheduleObject(null, scheduleData);
        // Add Schedule to calendar client
        cal.createSchedules([scheduleObject]);

        // Format data to firebase compatible data.
        saveScheduleToFirebase(scheduleObject.id, {
            title: scheduleData.title,
            class_link: scheduleData.class_link,
            start: firebase.firestore.Timestamp.fromDate(scheduleData.start),
            end: firebase.firestore.Timestamp.fromDate(scheduleData.end)
        });

        makeScheduleModalVisible(false);
    }

    function refreshScheduleVisibility() {
        cal.toggleSchedules("#calendar", false, true);
        //cal.render(true);

        // calendarElements.forEach(function(input) {
        //     var span = input.nextElementSibling;
        //     span.style.backgroundColor = input.checked ? span.style.borderColor : 'transparent';
        // });
    }

    function setDropdownCalendarType() {
        var calendarTypeName = document.getElementById("calendarTypeName");
        var calendarTypeIcon = document.getElementById("calendarTypeIcon");
        var options = cal.getOptions();
        var type = cal.getViewName();
        var iconClassName;

        if (type === "day") {
            type = "Daily";
            iconClassName = "calendar-icon ic_view_day";
        } else if (type === "week") {
            type = "Weekly";
            iconClassName = "calendar-icon ic_view_week";
        } else if (options.month.visibleWeeksCount === 2) {
            type = "2 weeks";
            iconClassName = "calendar-icon ic_view_week";
        } else if (options.month.visibleWeeksCount === 3) {
            type = "3 weeks";
            iconClassName = "calendar-icon ic_view_week";
        } else {
            type = "Monthly";
            iconClassName = "calendar-icon ic_view_month";
        }

        calendarTypeName.innerHTML = type;
        calendarTypeIcon.className = iconClassName;
    }

    function currentCalendarDate(format) {
        var currentDate = moment([
            cal.getDate().getFullYear(),
            cal.getDate().getMonth(),
            cal.getDate().getDate(),
        ]);

        return currentDate.format(format);
    }

    function setRenderRangeText() {
        var renderRange = document.getElementById("renderRange");
        var options = cal.getOptions();
        var viewName = cal.getViewName();

        var html = [];
        if (viewName === "day") {
            html.push(currentCalendarDate("YYYY.MM.DD"));
        } else if (
            viewName === "month" &&
            (!options.month.visibleWeeksCount || options.month.visibleWeeksCount > 4)
        ) {
            html.push(currentCalendarDate("YYYY.MM"));
        } else {
            html.push(moment(cal.getDateRangeStart().getTime()).format("YYYY.MM.DD"));
            html.push(" ~ ");
            html.push(moment(cal.getDateRangeEnd().getTime()).format(" MM.DD"));
        }
        renderRange.innerHTML = html.join("");
    }

    function makeScheduleObject(id, scheduleData) {
        return {
            id: id ? id : String(chance.guid()),
            calendarId: "calendar",
            title: scheduleData.title,
            isAllDay: false,
            start: scheduleData.start,
            end: scheduleData.end,
            category: scheduleData.isAllDay ? "allday" : "time",
            dueDateClass: "",
            color: CALENDAR_INFO.color,
            bgColor: CALENDAR_INFO.bgColor,
            dragBgColor: CALENDAR_INFO.bgColor,
            borderColor: CALENDAR_INFO.borderColor,
            raw: { class_link: scheduleData.class_link },
            state: scheduleData.state,
        };
    }

    function deleteSchedule(scheduleId) {
        if (scheduleId) {

            cal.deleteSchedule(scheduleId, 'calendar');
            db.collection('userSchedules').doc(scheduleId).delete()
                .catch(e => console.log("Error deleting", e));
            refreshScheduleVisibility();
            makeScheduleModalVisible(false);
        }
    }
    //TODO: Load user data
    cal.loadUserSchedules = function(userSchedules) {
        // early-return if no schedule data.
        if (!userSchedules) return;
        let schedules = [];
        userSchedules.forEach(schedule => {
            // Convert from firebase timestamps to date object.
            schedule.start = schedule.start.toDate();
            schedule.end = schedule.end.toDate();
            schedules.push(makeScheduleObject(schedule.id, schedule));
        });
        cal.createSchedules(schedules);
        refreshScheduleVisibility();
    }

    function setEventListener() {
        $("#menu-navi").on("click", onClickNavi);
        $('.dropdown-menu a[role="menuitem"]').on("click", onClickMenu);
        $("#modal_save").on("click", event => {
            const saveButton = event.target;
            const parsedData = getScheduleModalData();

            if (saveButton.getAttribute("isUpdate") === "true") {
                console.log("Changes= ", parsedData);
                cal.updateSchedule(currentScheduleId, "calendar", parsedData);
                updateScheduleChanges(currentScheduleId, parsedData);
            } else { addNewSchedule(parsedData); }

            makeScheduleModalVisible(false);
        });
        $('#modal_delete').on('click', _ => {
            deleteSchedule(currentScheduleId);
        })
        window.addEventListener("resize", resizeThrottled);

        refreshScheduleVisibility();
    }

    function getDataAction(target) {
        return target.dataset ?
            target.dataset.action :
            target.getAttribute("data-action");
    }
    // end of Controller functions //

    // Final initialization
    resizeThrottled = tui.util.throttle(function() {
        cal.render();
    }, 50);

    window.cal = cal;

    setRenderRangeText();
    setEventListener();
    //
})(window, tui.Calendar);


firebase.auth().onAuthStateChanged((user) => {
    if (user) {

        userId = user.uid;
        // load data
        userSchedules = db.collection("userSchedules").where("userId", "==", userId).get().then(schedules => {
            window.cal.loadUserSchedules(schedules.docs.map(scheduleDoc => {
                console.log(scheduleDoc);
                let data = scheduleDoc.data();
                data.id = scheduleDoc.id;
                return data;
            }));
        });
    }

});