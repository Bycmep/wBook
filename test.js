/* global document */
function User() {
    'use strict';
    var name = "Anonymous";

    function sayHi(name2) {
        window.console.log("Hello, " + name2 + "!");
    }
    
    
    return {
        sayHi: sayHi
    };

}

new User().sayHi("Someone");