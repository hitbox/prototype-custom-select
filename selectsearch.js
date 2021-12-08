// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#customizing_select_styles

function createChevronDown() {
    const xmlns = "http://www.w3.org/2000/svg";
    const chevronDownSVG = document.createElementNS(xmlns, "svg");
    chevronDownSVG.setAttributeNS(null, "width", "1rem");
    chevronDownSVG.setAttributeNS(null, "height", "1rem");
    chevronDownSVG.setAttributeNS(null, "viewBox", "0 0 100 100");

    const chevronDownPath = document.createElementNS(xmlns, "polyline");
    chevronDownPath.setAttributeNS(null, "points", "25,50 50,80 75,50");
    chevronDownPath.setAttributeNS(null, "style", "stroke:black;stroke-width:10;fill:none;");
    chevronDownSVG.appendChild(chevronDownPath);

    return chevronDownSVG;
}

function selectSearch(selectElement) {
    const selectWrapper = document.createElement("div");
    const dropdown = document.createElement("div");
    const header = document.createElement("div");
    //const optionsList = document.createElement("datalist");
    const optionsList = document.createElement("div");

    const labelContainer = document.createElement("div");
    const currentValueLabel = document.createElement("div");
    const labelArrow = document.createElement("div");

    const originalOptions = selectElement.options;
    const parent = selectElement.parentElement;
    const multiple = selectElement.hasAttribute("multiple");

    function optionClick(event) {
        const disabled = this.hasAttribute("data-disabled");
        selectElement.value = this.dataset.value;
        currentValueLabel.innerText = this.dataset.label;
        if (disabled) {
            return;
        }
        if (multiple) {
            if (event.shiftKey) {
                const checked = this.hasAttribute("data-checked");
                if (checked) {
                    this.removeAttribute("data-checked");
                } else {
                    this.setAttribute("data-checked", "");
                };
            } else {
                const options = selectWrapper.querySelectorAll(".option");
                for (i = 0; i < options.length; i++) {
                    const option = options[i];
                    option.removeAttribute("data-checked");
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

    // disable tabbing for original select
    selectElement.tabIndex = -1;

    selectWrapper.classList.add("select", "button");
    selectWrapper.tabIndex = 1;

    // add header
    header.classList.add("header");

    currentValueLabel.innerText = selectElement.label;
    currentValueLabel.classList.add("value");

    labelArrow.classList.add("arrow");
    const chevronDownSVG = createChevronDown();
    labelArrow.appendChild(chevronDownSVG);

    labelContainer.classList.add("label-container");
    labelContainer.appendChild(currentValueLabel);
    labelContainer.appendChild(labelArrow);

    header.appendChild(labelContainer);
    selectWrapper.appendChild(header);

    // make data- attributes from original
    for (let attribute of selectElement.attributes) {
        selectWrapper.dataset[attribute.name] = attribute.value;
    }

    // search field
    const searchDiv = document.createElement("div");
    const searchField = document.createElement("input");

    dropdown.classList.add("dropdown");
    searchDiv.appendChild(searchField);
    searchField.classList.add("select");
    searchField.setAttribute("type", "search");
    searchField.setAttribute("placeholder", "search");

    // clear search on close?
    // clear search on click or enter?
    // highlight search match?
    searchField.addEventListener("input", function(event) {
        // update search on typing
        const search = searchField.value;
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

    dropdown.appendChild(searchDiv);

    // copy mimic options
    for (let i = 0; i < originalOptions.length; i++) {
        const option = document.createElement("div");
        const label = document.createElement("div");
        const o = originalOptions[i];
        for (let attribute of o.attributes) {
            option.dataset[attribute.name] = attribute.value;
        }
        option.classList.add("option");
        label.classList.add("label");
        label.innerText = o.label;
        option.dataset.value = o.value;
        option.dataset.label = o.label;
        option.onclick = optionClick;
        option.onkeyup = optionKeyUp;
        option.tabIndex = i + 1;
        option.appendChild(label);
        optionsList.appendChild(option);
    }

    // copy mimic option groups
    for (let originalOptionGroup of selectElement.querySelectorAll("optgroup")) {
        const optgroup = document.createElement("div");
        const label = document.createElement("div");
        const options = originalOptionGroup.querySelectorAll("option");
        Object.assign(optgroup, originalOptionGroup);
        optgroup.classList.add("optgroup");
        label.classList.add("label");
        label.innerText = originalOptionGroup.label;
        optgroup.appendChild(label);
        selectWrapper.appendChild(optgroup);
        for (o of options) {
            const option = document.createElement("div");
            const label = document.createElement("div");
            for (attribute of o.attributes) {
                option.dataset[attribute.name] = attribute.value;
            }
            option.classList.add("option");
            label.classList.add("label");
            label.innerText = o.label;
            option.tabIndex = i + 1;
            option.dataset.value = o.value;
            option.dataset.label = o.label;
            option.onclick = optionClick;
            option.onkeyup = optionKeyUp;
            option.tabIndex = i + 1;
            option.appendChild(label);
            optgroup.appendChild(option);
        };
    };

    // why was this here? it is just overwritten.
    //selectWrapper.onclick = function(event) {
    //    event.preventDefault();
    //}

    parent.classList.add("select", "wrapper");
    parent.insertBefore(selectWrapper, selectElement);
    header.appendChild(selectElement);
    dropdown.appendChild(optionsList);
    selectWrapper.appendChild(dropdown)

    // commenting this out did not break the positioning.
    //optionsList.style.top = header.offsetTop + header.offsetHeight + "px";

    optionsList.classList.add("options-list");

    // open/close dropdown
    // this was selectWrapper
    // TODO:
    // * add escape key to close
    header.onclick = function(event) {
        if (multiple) {
            // pass
        } else {
            const isOpen = dropdown.hasAttribute("data-open");
            event.stopPropagation();
            if (isOpen) {
                dropdown.removeAttribute("data-open");
            } else {
                dropdown.setAttribute("data-open", "");
            }
        }
    };

    // click on enter
    selectWrapper.onkeyup = function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            selectWrapper.click();
        }
    };

    searchField.onclick = function(event) {
        // document click below hides us if we don't stop it
        event.stopImmediatePropagation();
    };

    // hide on click away
    document.addEventListener("click", function(event) {
        if (dropdown.hasAttribute("data-open")) {
            dropdown.removeAttribute("data-open");
        }
    });

    // calculate width
    const width = Math.max(...Array.from(originalOptions).map(function(element) {
        currentValueLabel.innerText = element.label;
        return selectWrapper.offsetWidth;
    }));
    //selectWrapper.style.width = width + "px";
}

// having tons of problems trying to make this a module.
// flask run doesn't serve them correctly as application/javascript which throws error.
// have to <script type="module"... or error because of this export statement.
// when modules work (here) they're annoying to add all the extra.
// commenting out the export until this is sorted.
//export { selectSearch };
