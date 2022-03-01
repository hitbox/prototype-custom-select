"use strict";
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#customizing_select_styles

// NOTE
// * Looked into custom elements but it looks like that is for a completely
//   new, custom element. It would not let me extend HTMLSelectElement.

function createChevronDown() {
    /* solid down-pointing triangle */
    const xmlns = "http://www.w3.org/2000/svg";
    const chevronDownSVG = document.createElementNS(xmlns, "svg");
    // TODO: is this the best thing for width/height
    chevronDownSVG.setAttributeNS(null, "width", "15");
    chevronDownSVG.setAttributeNS(null, "height", "15");
    chevronDownSVG.setAttributeNS(null, "viewBox", "0 0 100 100");

    const chevronDownPath = document.createElementNS(xmlns, "polyline");
    chevronDownPath.setAttributeNS(null, "points", "25,50 50,80 75,50");
    chevronDownPath.setAttributeNS(null, "style", "stroke:black;stroke-width:10;fill:none;");
    chevronDownSVG.appendChild(chevronDownPath);

    return chevronDownSVG;
}

function OptionListItem(selectElement, optionElement) {
    /* Mimic <option> as <li> */
    const liElement = document.createElement("li");
    const spanLabel = document.createElement("span");

    // reference to original <option> for searching.
    liElement.optionElement = optionElement;

    // update classes
    liElement.classList.add("select-search", "select-search-option");
    spanLabel.classList.add("select-search", "select-search-label");

    // update displayed label text
    spanLabel.innerText = optionElement.innerText;
    liElement.appendChild(spanLabel);

    // events - click
    liElement.addEventListener("click", function(event) {
        if (selectElement.multiple) {
            // multiple select - toggle real <option> element
            optionElement.selected = !optionElement.selected;
        } else {
            // single selection - let the <select> input handle unchecking the
            // other <option> tags
            selectElement.value = optionElement.value;
        }
        // notify underlying, real <select>
        const inputEvent = new InputEvent("input", {
            view: window,
            bubbles: true,
            cancellable: false,
        });
        selectElement.dispatchEvent(inputEvent);
        event.stopPropagation();
    });

    // events - keydown
    liElement.addEventListener("keydown", function(event) {
        // skip if key modifier
        if (event.shiftKey || event.altKey || event.ctrlKey) {
            return
        }
        if (event.key === "ArrowDown") {
            if (event.target.nextSibling) {
                event.target.nextSibling.focus();
                event.preventDefault();
            }
        } else if (event.key === "ArrowUp") {
            if (event.target.previousSibling) {
                event.target.previousSibling.focus();
                event.preventDefault();
            } else {
                searchInput.focus();
            }
        } else if (event.code === "Space") {
            /* relay click to element on spacebar */
            const clickEvent = new MouseEvent("click", {
                view: window,
                bubbles: true,
                cancellable: false,
            });
            liElement.dispatchEvent(clickEvent);
        }
    });
    return liElement;
}

function OptionList(selectElement) {
    /* Mimic <option> tags inside <select> */
    const ulElement = document.createElement("ul");

    ulElement.classList.add("select-search", "select-search-options-list");
    // copy mimic options
    const entries = Array.apply(null, selectElement.options).entries();
    for (const [index, originalOptionElement] of entries) {
        const liElement = OptionListItem(selectElement, originalOptionElement);
        liElement.tabIndex = index + 1;
        ulElement.appendChild(liElement);
    }

    function updateAll() {
        // reflect our <li> against the <option> tags of <select>
        ulElement.querySelectorAll(":scope > li").forEach(function(li) {
            if (li.optionElement.selected) {
                li.dataset.selected = "selected";
            } else {
                delete li.dataset.selected;
            }
        });
    }

    // on input (change) to <select>
    selectElement.addEventListener("input", function(event) {
        updateAll();
    });

    updateAll();

    return ulElement;
}

function SearchInput(selectElement, options) {
    /* search input for custom <select> fascade */
    const wrapper = document.createElement("div");

    // search input
    const searchInputElement = document.createElement("input");
    searchInputElement.classList.add("select-search");
    searchInputElement.setAttribute("type", "search");
    searchInputElement.setAttribute("placeholder", options.placeholder);
    wrapper.appendChild(searchInputElement);

    if (options.caseSensitive) {
    // checkbox for case sensitivity
        const caseSensitiveCheckboxElement = document.createElement("input");
        caseSensitiveCheckboxElement.setAttribute("type", "checkbox")
        caseSensitiveCheckboxElement.checked = options.caseSensitiveDefault;

        // wrap checkbox with label
        const caseSensitiveLabelElement = document.createElement("label");
        const span = document.createElement("span");
        span.innerText = "Case sensitive";
        caseSensitiveLabelElement.appendChild(caseSensitiveCheckboxElement);
        caseSensitiveLabelElement.appendChild(span);
        wrapper.appendChild(caseSensitiveLabelElement);

        // update search when checkbox changed
        caseSensitiveCheckboxElement.addEventListener("input", function(event) {
            updateSearch();
        });
    }

    const originalMultiple = selectElement.multiple;

    function restoreSelectElement() {
        selectElement.multiple = originalMultiple;
        //searchInputElement.value = "";
        // notify search input that it was updated
        const e = new Event("input", {bubbles: true, cancellable: true});
        searchInputElement.dispatchEvent(e);
    }

    selectElement.addEventListener("input", function(event) {
        restoreSelectElement();
    });

    function updateSearch() {
        /* update search on typing */
        const pattern = searchInputElement.value;
        if (pattern === "") {
            // empty search, remove hidden attribute from all <option>
            // elements.
            for (const optionElement of selectElement.options) {
                optionElement.removeAttribute("hidden");
            }
        } else {
            // non-empty pattern, do search
            var flags = "";
            if (options.caseSensitive && !(caseSensitiveCheckboxElement.checked)) {
                flags += "i";
            }
            let regex = new RegExp(pattern, flags);
            for (const optionElement of selectElement.options) {
                let index = optionElement.label.search(regex);
                if (index === -1 && !optionElement.selected) {
                    // no match and not selected, hide the <option> element.
                    optionElement.setAttribute("hidden", "");
                } else {
                    // match, ensure <option> is visible
                    optionElement.removeAttribute("hidden");
                }
            }
            // hack to make dropdown show
            selectElement.multiple = true;
        }
    }

    searchInputElement.addEventListener("input", updateSearch());
    searchInputElement.addEventListener("blur", restoreSelectElement);

    return wrapper
}


function DropdownButton() {
    /* <div> to look like a menulist button */
    const divButtonWrapper = document.createElement("div");
    const spanLabel = document.createElement("span");
    const svgSymbol = createChevronDown();

    spanLabel.classList.add("select-search", "select-search-label");
    divButtonWrapper.classList.add("select-search", "select-search-button")

    divButtonWrapper.spanLabel = spanLabel;
    divButtonWrapper.appendChild(spanLabel);
    divButtonWrapper.appendChild(svgSymbol);

    return divButtonWrapper;
}

function HeaderDropdown(optionsWrapper) {
    /* Mimic <select> dropdown button for single selections */
    const divDropdownWrapper = document.createElement("div");
    const divDropButton = DropdownButton();

    divDropdownWrapper.appendChild(divDropButton);
    divDropdownWrapper.appendChild(optionsWrapper);

    if (!optionsWrapper.selectElement.multiple) {
        // update the displayed text on the dropdown mimic
        function updateLabelText() {
            const text = optionsWrapper.selectElement.selectedOptions[0].label;
            divDropButton.spanLabel.innerText = text;
        }

        optionsWrapper.selectElement.addEventListener("input", function(event) {
            updateLabelText();
            // hide if not multiple select
            if (!optionsWrapper.selectElement.multiple) {
                optionsWrapper.classList.remove("select-search-open")
            }
        });

        // initial text
        updateLabelText();
    }

    // click dropdown button
    divDropButton.addEventListener("click", function(event) {
        optionsWrapper.classList.toggle("select-search-open");
        event.stopPropagation();
    });

    // hide when something that is not ours is clicked
    window.addEventListener("click", function(event) {
        if (!divDropdownWrapper.contains(event.target)) {
            optionsWrapper.classList.remove("select-search-open");
        }
    });

    return divDropdownWrapper;
}

function selectSearch(
    selectElement,
    options = {
        hideSelectElement: true,
        searchInput: {
            placeholder: "search",
            caseSensitive: false, // include case sensitive input
            caseSensitiveDefault: false, // default value if case sensitive input included
        }
    },
) {
    /* add search to <select> */
    const divWrapper = document.createElement("div");

    const ulOptionList = OptionList(selectElement);
    const inputSearch = SearchInput(selectElement, options.searchInput);

    // save original <select> element
    divWrapper.selectElement = selectElement;

    const parent = selectElement.parentNode;
    selectElement  = parent.removeChild(selectElement);

    divWrapper.appendChild(inputSearch);

    //divWrapper.appendChild(ulOptionList);
    divWrapper.appendChild(selectElement);

    parent.appendChild(divWrapper);

    if (selectElement.multiple) {
        // multiple - add to parent
        // XXX
        //selectElement.parentNode.appendChild(divWrapper);
    } else {
        // single - make button and add to parent
        // const divHeader = HeaderDropdown(divWrapper);
        // divWrapper.classList.add("select-search", "select-search-dropdown")
        // divHeader.appendChild(divWrapper);
        // selectElement.parentNode.appendChild(divHeader);
    }

    // optionally hide original (default: true)
    if (options.hideSelectElement) {
        // XXX
        //selectElement.style.display = "none";
    }
}
