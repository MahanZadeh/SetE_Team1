/* 
 * file:input_utils.js
 * contains utility functions for handling and converting input
 */

function testUtils(testFunc, UserIn, expectedOut) {
    return testFunc(UserIn) === expectedOut;
}

function testAll() {
    // Crashes if not equal.
    console.assert(testUtils(toPhoneNumber, "+1(123456-7890", "+1 (123) 456-7890"), "Logic error in toPhoneNumber()");
    console.assert(testUtils(toCapitalCase, "foobar", "Foobar"), "Logic error in toCapitalCase()");
    console.assert(testUtils(toTitleCase, "foo bar", "Foo Bar"), "Logic error in toTitleCase()");
    console.assert(true, "If true is false, what else is wrong with this world!");
    // console.assert(testUtils(testFunc, UserIn, expectedOut), "Logic error in ");
    // console.assert(testUtils(testFunc, UserIn, expectedOut), "Logic error in ");
    // console.assert(testUtils(testFunc, UserIn, expectedOut), "Logic error in ");
    // console.assert(testUtils(testFunc, UserIn, expectedOut), "Logic error in ");
    // console.assert(testUtils(testFunc, UserIn, expectedOut), "Logic error in ");
    // console.assert(testUtils(testFunc, UserIn, expectedOut), "Logic error in ");
}

function toCapitalCase(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}


function toTitleCase(str) {
    str = str.toLowerCase();
    return str.split(" ").map(word => toCapitalCase(word)).join(" ");
}

function toPhoneNumber(str) {
    str = str.replace(/\D{1}/gi, "");
    switch (str.length) {
        case 10:
            return `(${str.slice(0, 3)}) ${str.slice(3, 6)}-${str.slice(6)}`;
        case 11:
            return `+${str.charAt(0)} (${str.slice(1, 4)}) ${str.slice(4, 7)}-${str.slice(7)}`;
        case 12:
            return `+${str.slice(0, 2)} (${str.slice(2, 5)}) ${str.slice(5, 8)}-${str.slice(8)}`;
        default:
            return str;
    }
}


// call functions below here
testAll();

/*
 * end of file
 */