"use strict";
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#customizing_select_styles

function initSelect(originalSelect) {
    const selectWrapper = document.createElement("div");
    const dropdown = document.createElement("div");
    const header = document.createElement("div");
    //const datalist = document.createElement("datalist");
    const datalist = document.createElement("div");
    const currentValueLabel = document.createElement("span");
    const originalOptions = originalSelect.options;
    const parent = originalSelect.parentElement;
    const multiple = originalSelect.hasAttribute("multiple");

    function optionClick(event) {
        const disabled = this.hasAttribute("data-disabled");
        originalSelect.value = this.dataset.value;
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
    originalSelect.tabIndex = -1;

    selectWrapper.classList.add("select");
    selectWrapper.tabIndex = 1;

    // add header
    header.classList.add("header");
    currentValueLabel.innerText = originalSelect.label;
    header.appendChild(currentValueLabel);
    selectWrapper.appendChild(header);

    // make data- attributes from original
    for (let attribute of originalSelect.attributes) {
        selectWrapper.dataset[attribute.name] = attribute.value;
    }

    // search field
    const searchDiv = document.createElement("div");
    const searchField = document.createElement("input");

    dropdown.classList.add("dropdown");
    searchDiv.appendChild(searchField);
    searchField.setAttribute("type", "search");
    searchField.setAttribute("placeholder", "search");

    // clear search on close?
    // highlight search match?
    searchField.addEventListener("input", function(event) {
        const search = searchField.value;
        if (search === "") {
            datalist.classList.remove("search");
        } else {
            datalist.classList.add("search");
            const regex = new RegExp(`${search}`, "i");
            for (let option of datalist.children) {
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
        datalist.appendChild(option);
    }

    // copy mimic option groups
    for (let originalOptionGroup of originalSelect.querySelectorAll("optgroup")) {
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

    parent.insertBefore(selectWrapper, originalSelect);
    header.appendChild(originalSelect);
    dropdown.appendChild(datalist);
    selectWrapper.appendChild(dropdown)

    // commenting this out did not break the positioning.
    //datalist.style.top = header.offsetTop + header.offsetHeight + "px";

    datalist.classList.add("datalist");

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
    selectWrapper.style.width = width + "px";
}

document.addEventListener("DOMContentLoaded", function(event) {
    for (let selectTag of custom.querySelectorAll("select")) {
        initSelect(selectTag);
    }

    // form submit needs custom?
    document.forms[0].onsubmit = function(event) {
        const data = new FormData(this);
        event.preventDefault();
        let post = document.getElementById("post");
        post.innerText = JSON.stringify([...data.entries()]);
    }
});
