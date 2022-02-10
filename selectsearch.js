// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#customizing_select_styles

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

function selectSearch(selectElement) {
    // main entry point
    const selectWrapper = document.createElement("div");
    const dropdownWrapper = document.createElement("div");
    const header = document.createElement("div");
    const optionsList = document.createElement("ul");

    const labelContainer = document.createElement("div");
    const currentValueLabel = document.createElement("div");
    const labelArrow = document.createElement("div");

    const originalOptions = selectElement.options;
    const parent = selectElement.parentElement;
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
    selectWrapper.tabIndex = 1;

    // add header
    header.classList.add("select-search", "header");

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
    for (let attribute of selectElement.attributes) {
        selectWrapper.dataset[attribute.name] = attribute.value;
    }

    // search field
    const searchDiv = document.createElement("div");
    const searchInput = document.createElement("input");

    dropdownWrapper.classList.add("select-search", "dropdown");
    searchDiv.appendChild(searchInput);
    searchInput.classList.add("select-search", "select");
    searchInput.setAttribute("type", "search");
    searchInput.setAttribute("placeholder", "search");

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

    // copy mimic options
    for (let i = 0; i < originalOptions.length; i++) {
        const optionElement = document.createElement("li");
        const labelElement = document.createElement("span");
        const o = originalOptions[i];
        for (let attribute of o.attributes) {
            optionElement.dataset[attribute.name] = attribute.value;
        }
        optionElement.classList.add("select-search", "option");
        labelElement.classList.add("select-search", "label");
        labelElement.innerText = o.label;
        optionElement.dataset.value = o.value;
        optionElement.dataset.label = o.label;
        // TODO
        // Want a way to associate optionElement back to original <option> object
        // and call <option>.selected = !<option>.selected or something like
        // that.
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement/Option
        optionElement.onclick = optionClick;
        optionElement.onkeyup = optionKeyUp;
        optionElement.tabIndex = i + 1;
        optionElement.appendChild(labelElement);
        optionsList.appendChild(optionElement);
    }

    // copy mimic option groups
    for (let originalOptionGroup of selectElement.querySelectorAll("optgroup")) {
        const optgroup = document.createElement("div");
        const label = document.createElement("div");
        const options = originalOptionGroup.querySelectorAll("option");
        Object.assign(optgroup, originalOptionGroup);
        optgroup.classList.add("select-search", "optgroup");
        label.classList.add("select-search", "label");
        label.innerText = originalOptionGroup.label;
        optgroup.appendChild(label);
        selectWrapper.appendChild(optgroup);
        for (o of options) {
            const optionElement = document.createElement("li");
            const label = document.createElement("div");
            for (attribute of o.attributes) {
                optionElement.dataset[attribute.name] = attribute.value;
            }
            optionElement.classList.add("select-search", "option");
            label.classList.add("select-search", "label");
            label.innerText = o.label;
            optionElement.tabIndex = i + 1;
            optionElement.dataset.value = o.value;
            optionElement.dataset.label = o.label;
            optionElement.onclick = optionClick;
            optionElement.onkeyup = optionKeyUp;
            optionElement.tabIndex = i + 1;
            optionElement.appendChild(label);
            optgroup.appendChild(optionElement);
        };
    };

    // why was this here? it is just overwritten.
    //selectWrapper.onclick = function(event) {
    //    event.preventDefault();
    //}

    parent.classList.add("select-search", "select", "wrapper");
    parent.insertBefore(selectWrapper, selectElement);
    header.appendChild(selectElement);
    dropdownWrapper.appendChild(optionsList);
    selectWrapper.appendChild(dropdownWrapper)

    // commenting this out did not break the positioning.
    //optionsList.style.top = header.offsetTop + header.offsetHeight + "px";

    optionsList.classList.add("select-search", "options-list");

    // open/close dropdown
    // this was selectWrapper
    // TODO:
    // * add escape key to close
    header.onclick = function(event) {
        event.stopPropagation();
        const isOpen = dropdownWrapper.hasAttribute("data-open");
        if (isOpen) {
            dropdownWrapper.removeAttribute("data-open");
        } else {
            dropdownWrapper.setAttribute("data-open", "");
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
