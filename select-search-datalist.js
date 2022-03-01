"use strict";

// not liking the way this looks

document.addEventListener("DOMContentLoaded", function(event) {
    document.querySelectorAll(".select-search-datalist").forEach(function(selectElement) {
        const searchInput = document.getElementById(selectElement.dataset.search);
        searchInput.addEventListener("focus", function(event) {
            for (const opt of selectElement.options) {
                searchInput.list.appendChild(opt);
            }
        });
    });
});
