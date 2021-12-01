"use strict";

import { selectSearch } from "./selectsearch.js";

document.addEventListener("DOMContentLoaded", function(event) {
    // customize all <select> inside #custom
    for (let selectTag of custom.querySelectorAll("select")) {
        selectSearch(selectTag);
    }

    // dump form post to html
    document.forms[0].onsubmit = function(event) {
        const data = new FormData(this);
        event.preventDefault();
        let post = document.getElementById("post");
        post.innerText = JSON.stringify([...data.entries()]);
    }
});
