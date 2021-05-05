/***********************************************************************
 *
 * Copyright (c) 2020 Amur Khoyetsyan
 *
 * The MIT License (MIT)
 *
 * When we bring the file closer to the installation area
 * a new class is added to the installation section called "dragover",
 * with which we can shape the installation area․
 *
 ************************************************************************/

/**
 * @type {{elem: {file: [], draggable: [], drag: []}, file: null, data: {name: string, files: []}, name: string}}
 */
 let DAD = {
    name: "Drag And Drop",
    elem: {
        file: [],
        drag: [],
        draggable: []
    },
    file: null,
    data: {
        name: "Drag And Drop",
        files: []
    }
};

/**
 * @type {{input: null, start: undefined, end: undefined, element: null}}
 */
let defaultProps = {
    element: null,
    input: null,
    start: undefined,
    end: undefined
};

/**
 * @param elem
 * @param callback
 * @returns {boolean}
 */
const isEmpty = (elem, callback) => {
    if(Array.isArray(elem)) {
        if(elem.length === 0) {
            callback(new Error("Not a File"));
            return true;
        }

        return false;
    }

    try {
        let keys = Object.keys(elem);

        if(keys.length === 0) {
            callback(new Error("Not a File"));
            return true;
        }

        return false;
    }catch (error) {
        callback(new TypeError('Is not a array or object'));
    }

    return false;
};

/**
 * @param event
 * @param tag
 */
const addClass = (event, tag) =>
{
    if(tag !== null && DAD.elem.drag !== null) {
        DAD.elem.drag.forEach((item, index) => {
            if(item.elem === tag) {
                if(DAD.elem.drag[index].dragover === 1) {
                    DAD.elem.drag[index].dragover = 2;
                    DAD.elem.drag[index].dragenter(item.elem, index);
                }
                !item.elem.classList.contains("dragover") && item.elem.classList.add("dragover");
                return true;
            }
        });
    }else if(DAD.elem.drag !== null) {
        DAD.elem.drag.forEach( (item, index) => {
            if(item.elem === event.target) {
                if(DAD.elem.drag[index].dragover === 1) {
                    DAD.elem.drag[index].dragover = 2;
                    DAD.elem.drag[index].dragleave(item.elem, index);
                }
                !item.elem.classList.contains("dragover") && item.elem.classList.add("dragover");
                return true;
            }
        });
    }
};

/**
 * @param event
 */
const removeClass = event =>
{
    if(DAD.elem.drag !== null) {
        DAD.elem.drag.forEach((item, index) => {
            if(DAD.elem.drag[index].dragover === 2) {
                DAD.elem.drag[index].dragover = 1;
                DAD.elem.drag[index].dragleave(item.elem, index);
            }
            item.elem.classList.contains("dragover") && item.elem.classList.remove("dragover");
            return true;
        });
    }
};

/**
 * @param event
 * @param tag
 */
const dragenter = (event, tag = null) =>
{
    event.preventDefault();
    addClass(event, tag);
};

/**
 * @param event
 */
const dragleave = event =>
{
    event.preventDefault();
    removeClass(event);
};

/**
 * @param event
 * @param tag
 */
const dragover = (event, tag = null) =>
{
    event.preventDefault();
    addClass(event, tag);
};

/**
 * @param elem
 * @returns {{}}
 */
const getElemName = elem =>
{
    let name = {};

    name.id = elem.hasAttribute("id") ? elem.getAttribute("id") : null;
    name.name = elem.hasAttribute("name") ? elem.getAttribute("name") : null;
    name.classes = elem.hasAttribute("class") ? elem.getAttribute("class") : null;
    name.tagName = elem.nodeName;
    name.node = elem;

    return name;
};

/**
 * @param files
 * @returns {FileList}
 * @constructor
 */
function FileListItem(files) {
    files = [].slice.call(Array.isArray(files) ? files : arguments);
    for (var count, arrCount = count = files.length, item = true; arrCount-- && item;) item = files[arrCount] instanceof File;
    if (!item) throw new TypeError("expected argument to FileList is File or array of File objects");
    for (arrCount = (new ClipboardEvent("")).clipboardData || new DataTransfer; count--;) arrCount.items.add(files[count]);
    return arrCount.files;
};

/**
 * @param elem
 * @param type
 * @returns {{index: number, type: string}}
 */
const getIndex = (elem, type) => {
    let indexis = {
        index: -1,
        type: ""
    };

    let len = 0;
    if(type === "drop") {
        len = DAD.elem.drag.length;
        for(let i = 0; i < len; i++) {
            if(DAD.elem.drag[i].elem === elem) {
                return {
                    index: i,
                    type: "drop"
                }
            }
        }
    }else {
        len = DAD.elem.file.length;
        for(let i = 0; i < len; i++) {
            if(DAD.elem.file[i].elem === elem) {
                return {
                    index: i,
                    type: "file"
                }
            }
        }
    }

    return indexis;
};

/**
 * @param event
 * @param element
 * @param type
 * @returns {boolean}
 */
const addFile = (event, element, type) =>
{
    let indexis = getIndex(element, type);

    if(indexis.index !== -1) {
        if(indexis.type === "drop") {
            if(DAD.elem.drag[indexis.index].dragover === 2) {
                DAD.elem.drag[indexis.index].dragover = 1;
                DAD.elem.drag[indexis.index].dragleave(element, indexis.index);
            }
            if(DAD.elem.drag[indexis.index].start !== undefined) {
                DAD.elem.drag[indexis.index].start();
            }
        }else {
            if(DAD.elem.file[indexis.index].start !== undefined) {
                DAD.elem.file[indexis.index].start();
            }
        }
    }

    DAD.file = [];
    DAD.data.files = [];

    removeClass(event);

    if(type === "drop") {
        DAD.file = event.dataTransfer.files;
    }else {
        DAD.file = event.target.files;
    }

    if(isEmpty(DAD.file, (err) => {
        if(indexis.index !== -1) {
            if(indexis.type === "drop") {
                if(DAD.elem.drag[indexis.index].end !== undefined) {
                    DAD.elem.drag[indexis.index].end(null, err);
                }
            }else {
                if(DAD.elem.file[indexis.index].end !== undefined) {
                    DAD.elem.file[indexis.index].end(null, err);
                }
            }
        }
    })) {
        return false;
    }

    let multiple = getTypeMultiple(element);

    if(DAD.file !== undefined) {
        previewFile(DAD.file, type, getElemName(element), multiple).then( res => {
            if(indexis.index !== -1) {
                if(indexis.type === "drop") {
                    if(DAD.elem.drag[indexis.index].input !== null) {
                        if(multiple) {
                            DAD.elem.drag[indexis.index].input.files = new FileListItem([...DAD.file]);
                        }else {
                            DAD.elem.drag[indexis.index].input.files = new FileListItem(DAD.file[0]);
                        }
                    }

                    if(DAD.elem.drag[indexis.index].end !== undefined) {
                        DAD.elem.drag[indexis.index].end(res, null);
                    }
                }else {
                    if(DAD.elem.file[indexis.index].input !== null) {
                        if(multiple) {
                            DAD.elem.file[indexis.index].input.files = new FileListItem([...DAD.file]);
                        }else {
                            DAD.elem.file[indexis.index].input.files = new FileListItem(DAD.file[0]);
                        }
                    }

                    if(DAD.elem.file[indexis.index].end !== undefined) {
                        DAD.elem.file[indexis.index].end(res, null);
                    }
                }
            }
        }).catch( err => {
            if(indexis.index !== -1) {
                if(indexis.type === "drop") {
                    if(DAD.elem.drag[indexis.index].end !== undefined) {
                        DAD.elem.drag[indexis.index].end(null, err);
                    }
                }else {
                    if(DAD.elem.file[indexis.index].end !== undefined) {
                        DAD.elem.file[indexis.index].end(null, err);
                    }
                }
            }
        });
    }

    return true;
};

/**
 * @param file
 * @param type
 * @param inputName
 * @param multiple
 * @param count
 * @returns {Promise<unknown>}
 */
const previewFile = (file, type, inputName, multiple, count = 0) =>
{
    let reader = new FileReader();
    reader.readAsDataURL(file[count]);

    let _self = webkitURL || URL;
    let blob = _self.createObjectURL(file[count]);

    return new Promise((resolve, reject) => {
        reader.onloadend = event => {
            DAD.data.files.push(
                {
                    file: file[count],
                    blob: blob,
                    data: reader.result,
                    filename: file[count].name,
                    type,
                    inputName,
                    total: event.total,
                    loaded: event.loaded
                }
            );

            if(multiple) {
                count ++;
                if(file.length > count) {
                    resolve(previewFile(DAD.file, type, inputName, multiple, count));
                }else {
                    resolve(DAD.data);
                }
            }else {
                resolve(DAD.data);
            }
        };

        reader.onerror = error => {
            reject(new Error("Failed to load ", error));
        };
    });
};

/**
 * @param tags
 * @returns {boolean|boolean}
 */
const isNodeList = tags => typeof tags.length !== "undefined" && typeof tags.item !== "undefined";

/**
 * @param text
 * @returns {boolean}
 */
const toBoolean = text => text === "true";

/**
 * @param elem
 * @returns {boolean}
 */
const getTypeMultiple = elem => {
    let multiple = false;

    if(elem.hasAttribute("multiple") && elem.getAttribute("multiple").length > 0) {
        multiple = toBoolean(elem.getAttribute("multiple"));
    }

    return multiple;
};

/**
 * @param tag
 */
const getAllTabsByParent = tag =>
{
    let all = tag.getElementsByTagName("*");
    for(let element of all) {
        element.addEventListener('dragenter', (event) => dragenter(event, tag), false);
        element.addEventListener('dragover', (event) =>  dragover(event, tag), false);
    }
    tag.addEventListener('dragenter', (event) => dragenter(event, tag), false);
    tag.addEventListener('dragover', (event) =>  dragover(event, tag), false);
};

/**
 * @param element
 */
const elemAddEventDragged = element =>
{
    getAllTabsByParent(element);
    element.addEventListener('dragenter', dragenter, false);
    element.addEventListener('dragleave', dragleave, false);
    element.addEventListener('dragover', dragover, false);
    element.addEventListener('drop', event => {
        event.preventDefault();
        addFile(event, element, "drop");
    }, false);
};

/**
 * @param props
 */
DAD.draggedUpload = (props = defaultProps) =>
{
    let elem = props.element;
    if(elem !== null && isNodeList(elem)) {
        for(let element of elem) {
            DAD.elem.drag.push({
                elem: element,
                input: props.input ? props.input : null,
                dragenter: props.dragenter ? props.dragenter : undefined,
                dragleave: props.dragleave ? props.dragleave : undefined,
                dragover: props.dragenter && props.dragleave ? 1 : 0,
                start: props.start ? props.start : undefined,
                end: props.end ? props.end : undefined
            });
            elemAddEventDragged(element);
        }
    }else if(elem !== null) {
        DAD.elem.drag.push({
            elem: elem,
            input: props.input ? props.input : null,
            dragenter: props.dragenter ? props.dragenter : undefined,
            dragleave: props.dragleave ? props.dragleave : undefined,
            dragover: props.dragenter && props.dragleave ? 1 : 0,
            start: props.start ? props.start : undefined,
            end: props.end ? props.end : undefined
        });
        elemAddEventDragged(elem);
    }
};

/**
 * @param props
 */
DAD.fileChange = (props = defaultProps) =>
{
    let elem = props.element;
    if(elem !== null && isNodeList(elem)) {
        for(let element of elem) {
            DAD.elem.file.push({
                elem: element,
                input: props.input ? props.input : null,
                start: props.start ? props.start : undefined,
                end: props.end ? props.end : undefined
            });
            element.addEventListener('change', (event) => {
                event.preventDefault();
                addFile(event, element, "change");
            }, false);
        }
    }else if(elem !== null) {
        DAD.elem.file.push({
            elem: elem,
            input: props.input ? props.input : null,
            start: props.start ? props.start : undefined,
            end: props.end ? props.end : undefined
        });
        elem.addEventListener('change', (event) => {
            event.preventDefault();
            addFile(event, elem, "change");
        }, false);
    }
};

/**
 * @param event
 */
const dragContext = event =>
{
    DAD.elem.draggable.forEach( item => {
        if(event.target === item.node) {
            let stepX = 0, stepY = 0;

            stepX = item.cords.startX - event.pageX;
            stepY = item.cords.startY - event.pageY;

            item.cords.endX += -stepX;
            item.cords.endY += -stepY;

            item.cords.startX = event.pageX;
            item.cords.startY = event.pageY;

            item.node.style["zIndex"] = "100";
            item.node.style["top"] = `${item.cords.endY}px`;
            item.node.style["left"] = `${item.cords.endX}px`;
        }else {
            item.node.style["zIndex"] = "99";
        }
    });
};

/**
 * @param elem
 */
const addInObject = elem =>
{
    elem.style["position"] = "fixed";
    elem.style["zIndex"] = "99";
    elem.style["cursor"] = "move";

    DAD.elem.draggable.push({
        node: elem,
        cords: {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0
        }
    });
};

/**
 * void
 */
const addEventDragAndDrop = () =>
{
    DAD.elem.draggable.forEach( item => {
        item.node.addEventListener("mousedown", event => {
            let {x, y} = item.node.getBoundingClientRect();

            item.cords.startX = event.pageX;
            item.cords.startY = event.pageY;
            item.cords.endX = x;
            item.cords.endY = y;

            item.node.addEventListener("mousemove", dragContext, false);
        });

        item.node.addEventListener("mouseup", event => {
            item.node.removeEventListener("mousemove", dragContext, false);
        }, false);
    });
};

/**
 * @param elem
 */
DAD.draggableContext = elem =>
{
    if(elem !== null && isNodeList(elem)) {
        for(let item of elem) {
            addInObject(item);
        }
    }else if(elem !== null) {
        addInObject(elem);
    }

    if(elem !== null) {
        addEventDragAndDrop();
    }
};