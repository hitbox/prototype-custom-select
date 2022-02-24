// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#customizing_select_styles

// NOTE
// * Looked into custom elements but it looks like that is for a completely
//   new, custom element. It would not let me extend HTMLSelectElement.

function createChevronDown() {
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

function mimicOptionElement(originalOptionElement) {
    /*
     * Create HTML element to mimic <option>
     */
    // <li><span>...</span></li>
    // new elements to mimic <option> elements
    const newOptionElement = document.createElement("li");
    const newLabelElement = document.createElement("span");
    // update data-* attributes from original's regular attributes
    newOptionElement.dataset = {...originalOptionElement.attributes};
    // update classes
    newOptionElement.classList.add("select-search", "option");
    newLabelElement.classList.add("select-search", "label");
    // update displayed text
    newLabelElement.innerText = originalOptionElement.innerText;
    newOptionElement.dataset.value = originalOptionElement.value;
    newOptionElement.dataset.label = originalOptionElement.label;
    newOptionElement.appendChild(newLabelElement);
    return newOptionElement;
}

function selectSearch(selectElement) {
    // main entry point
    const selectWrapper = document.createElement("div");
    const dropdownWrapper = document.createElement("div");
    const header = document.createElement("header");
    const optionsList = document.createElement("ul");

    const labelContainer = document.createElement("div");
    const currentValueLabel = document.createElement("div");
    const labelArrow = document.createElement("div");

    const originalOptions = selectElement.options;
    const multiple = selectElement.hasAttribute("multiple");

    function optionClick(event) {
        const disabled = this.hasAttribute("data-disabled");
        if (disabled) {
            return;
        }
        selectElement.value = this.dataset.value;
        currentValueLabel.innerText = this.dataset.label;
        // handle multiple selection capability
        if (selectElement.multiple) {
            if (event.shiftKey) {
                const checked = this.hasAttribute("data-checked");
                if (checked) {
                    this.removeAttribute("data-checked");
                } else {
                    this.setAttribute("data-checked", "");
                };
            } else if (event.ctrlKey) {
                this.dataset.checked = !this.dataset.checked;
                event.stopPropagation();
            } else {
                // remove all other checkeds
                const options = selectWrapper.querySelectorAll(".option");
                for (let i = 0; i < options.length; i++) {
                    options[i].removeAttribute("data-checked");
                };
                this.setAttribute("data-checked", "");
            };
        };
    }

    function optionKeyUp(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.keyCode === 13) {
            this.click();
        }
    };

    //
    const resizeObserver = new ResizeObserver(function(entries) {
        for (let entry of entries) {
            if (entry.contentBoxSize) {
                labelContainer.style.width = entry.contentRect.width;
            }
        }
    });

    resizeObserver.observe(selectWrapper);

    // disable tabbing for original select
    selectElement.tabIndex = -1;

    selectWrapper.classList.add("select-search", "select", "button");

    // add header
    header.classList.add("select-search", "header");
    header.tabIndex = 0;

    header.addEventListener("keydown", function(event) {
        if (!(event.shifKey || event.ctrlKey)) {
            if (event.key === "ArrowDown") {
                if (event.altKey) {
                    showDropdown();
                } else {
                    optionsList.firstChild.focus();
                    /* is this the correct method to stop scrolling down */
                    event.preventDefault();
                }
            }
        }
    });

    currentValueLabel.innerText = selectElement.label;
    currentValueLabel.classList.add("select-search", "value");

    labelArrow.classList.add("select-search", "arrow");
    const chevronDownSVG = createChevronDown();
    labelArrow.appendChild(chevronDownSVG);

    labelContainer.classList.add("select-search", "label-container");
    labelContainer.appendChild(currentValueLabel);
    labelContainer.appendChild(labelArrow);

    header.appendChild(labelContainer);
    selectWrapper.appendChild(header);

    // make data- attributes from original
    selectWrapper.dataset = {...selectElement.attributes};

    // search field
    const searchDiv = document.createElement("div");
    const searchInput = document.createElement("input");

    dropdownWrapper.classList.add("select-search", "dropdown");
    searchDiv.appendChild(searchInput);
    searchInput.classList.add("select-search", "select");
    searchInput.setAttribute("type", "search");
    searchInput.setAttribute("placeholder", "search");

    searchInput.addEventListener("keydown", function(event) {
        if (event.key === "ArrowDown" && !event.key.ctrlKey
            && !event.key.altKey && !event.key.shiftKey) {
            optionsList.firstChild.focus();
            event.preventDefault();
        }
    });

    // clear search on close?
    // clear search on click or enter?
    // highlight search match?
    searchInput.addEventListener("input", function(event) {
        // update search on typing
        const search = searchInput.value;
        if (search === "") {
            optionsList.classList.remove("search");
        } else {
            optionsList.classList.add("search");
            const regex = new RegExp(`${search}`, "i");
            for (let option of optionsList.children) {
                let haystack = option.dataset["label"];
                let index = haystack.search(regex);
                if (index === -1) {
                    option.classList.remove("match");
                } else {
                    option.classList.add("match");
                }
            }
        }
    });

    dropdownWrapper.appendChild(searchDiv);

    window.addEventListener("focusin", function(event) {
        // focusin because focus doesn't bubble
        if (!selectWrapper.contains(event.target)) {
            // an element outside this wrapper has received focus, hide ourself.
            hideDropdown();
        }
    });

    function simulateBlur(optionElement) {
        // remove our focus
        optionElement.classList.remove("selected");
        optionElement.blur();
    }

    function simulateFocus(optionElement) {
        // remove from all other custom option elements
        for (const elem of document.querySelectorAll(".select-search.option.selected")) {
            elem.classList.remove("selected");
        }
        // make this the focused
        optionElement.classList.add("selected");
        optionElement.focus();
    }

    // copy mimic options
    for (const [index, originalOptionElement] of Array.apply(null, selectElement.options).entries()) {
        const newOptionElement = mimicOptionElement(originalOptionElement);
        newOptionElement.tabIndex = index + 1;
        // events
        newOptionElement.onclick = optionClick;
        newOptionElement.onkeyup = optionKeyUp;
        // events - keydown
        newOptionElement.addEventListener("keydown", function(event) {
            console.log(event);
            if (!(event.shiftKey || event.altKey || event.ctrlKey)) {
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
                }
            }
        });
        // events - focus
        newOptionElement.addEventListener("focus", function(event) {
            simulateFocus(event.target);
        });
        // events - mouseenter
        newOptionElement.addEventListener("mouseenter", function(event) {
            simulateFocus(event.target);
        });
        // events - blur
        newOptionElement.addEventListener("blur", function(event) {
            simulateBlur(event.target);
        });
        // events - mouseenter
        newOptionElement.addEventListener("mouseexit", function(event) {
            simulateBlur(event.target);
        });
        // finally add to parent
        optionsList.appendChild(newOptionElement);
    }

    // insert ourself inside parent
    selectElement.parentNode.insertBefore(selectWrapper, selectElement);
    header.appendChild(selectElement);
    dropdownWrapper.appendChild(optionsList);
    selectWrapper.appendChild(dropdownWrapper)

    optionsList.classList.add("select-search", "options-list");
    optionsList.tabIndex = "-1";

    // XXX
    // LEFT OFF HERE
    // it's behaving pretty good with the keyboard
    // focusing working decent
    // coloring could use some work
    // this code is getting ugly again
    //

    function hideDropdown() {
        dropdownWrapper.removeAttribute("data-open");
    }

    function showDropdown() {
        dropdownWrapper.setAttribute("data-open", "");
    }

    // open/close dropdown
    // this was selectWrapper
    // TODO:
    // * add escape key to close
    header.onclick = function(event) {
        event.stopPropagation();
        const isOpen = dropdownWrapper.hasAttribute("data-open");
        if (isOpen) {
            hideDropdown();
        } else {
            showDropdown();
        }
    };

    // click on enter
    selectWrapper.onkeyup = function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            selectWrapper.click();
        }
    };

    //
    searchInput.onclick = function(event) {
        // document click below hides us if we don't stop it
        event.stopImmediatePropagation();
    };

    // hide on click away
    document.addEventListener("click", function(event) {
        if (dropdownWrapper.hasAttribute("data-open")) {
            dropdownWrapper.removeAttribute("data-open");
        }
    });

    // // calculate width
    // const width = Math.max(...Array.from(originalOptions).map(function(element) {
    //     currentValueLabel.innerText = element.label;
    //     return selectWrapper.offsetWidth;
    // }));
    //selectWrapper.style.width = width + "px";
}

// having tons of problems trying to make this a module.
// flask run doesn't serve them correctly as application/javascript which throws error.
// have to <script type="module"... or error because of this export statement.
// when modules work (here) they're annoying to add all the extra.
// commenting out the export until this is sorted.
//export { selectSearch };
