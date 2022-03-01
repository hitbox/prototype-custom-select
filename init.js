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
    "Children",
    "Colored Sneakers",
    "Teacher",
    "Completely Irrelevant",
];

document.addEventListener("DOMContentLoaded", function(event) {
    const selectRandom = false;
    // add <options> to all <select> tags
    // same randomly selected option so they all match
    let selectedIndex = Math.floor(Math.random() * optionNames.length);
    for (let selectElement of document.querySelectorAll("select.touch")) {
        // add some options
        optionNames.map(function(optionName, index) {
            let option = document.createElement("option");
            option.setAttribute("value", index);
            option.innerText = optionName;
            // https://www.w3schools.com/jsref/met_select_add.asp
            selectElement.add(option);
        });
        if (selectRandom) {
            selectElement.value = selectElement.options[selectedIndex].value;
        }
    }

    // customize all <select class="search">
    for (let selectTag of document.querySelectorAll("select.search.touch")) {
        selectSearch(selectTag, {hideSelectElement: true});
    }

    document.forms[0].onsubmit = function(event) {
        event.preventDefault();
        const post = document.getElementById("post");
        const wrapper = document.createElement("div");
        const timestamp = document.createElement("pre");
        timestamp.innerText = new Date();
        wrapper.appendChild(timestamp);
        const formdata = new FormData(this);
        for (const item of formdata) {
            const prewrap = document.createElement("div");
            const name = document.createElement("pre");
            const value = document.createElement("pre");

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
