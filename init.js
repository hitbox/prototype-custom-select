"use strict";

// see selectsearch.js:bottom for why this is commented out
//import { selectSearch } from "./selectsearch.js";

const optionNames = [
    "Carrots",
    "Peas",
    "Beans",
    "Tater",
    "Cabbage",
    "Broccoli",
    "Bread",
    "Taco",
    "Pizza",
    "Greek Yogourt",
    "Hamburger",
    "Peanuts",
    "Coffee",
    "Onions",
    "Burrito",
    "Ketchup",
    "Salt",
    "Steak",
    "Pork",
    "Water",
    "Mustard",
    "Baseball",
    "Basketball",
    "Football",
];

document.addEventListener("DOMContentLoaded", function(event) {
    // add a bunch of <option> tags
    for (let selectTag of document.querySelectorAll("select")) {
        // add some options
        optionNames.map(function(optionName, index) {
            let option = document.createElement("option");
            option.setAttribute("value", index);
            option.innerText = optionName;
            // https://www.w3schools.com/jsref/met_select_add.asp
            selectTag.add(option);
        });
    }

    // customize all <select class="search">
    for (let selectTag of document.querySelectorAll("select.search")) {
        selectSearch(selectTag);
    }

    // dump form post to html
    document.forms[0].onsubmit = function(event) {
        event.preventDefault();
        const data = new FormData(this);
        const post = document.getElementById("post");
        const wrapper = document.createElement("div");
        const timestamp = document.createElement("pre");
        timestamp.innerText = new Date();
        wrapper.appendChild(timestamp);
        for (let item of data.entries()) {
            let prewrap = document.createElement("div");
            let name = document.createElement("pre");
            let value = document.createElement("pre");

            // TODO: better output
            prewrap.appendChild(name);
            prewrap.appendChild(value);

            name.innerText = item[0];
            value.innerText = item[1];
            wrapper.appendChild(prewrap);
        }
        post.prepend(wrapper);

    }
});
