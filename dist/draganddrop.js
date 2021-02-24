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

let defaultProps = {
    element: null,
    input: null,
    start: undefined,
    end: undefined
};

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

const addClass = (event, tag) =>
{
    if(tag !== null && DAD.elem.drag !== null) {
        DAD.elem.drag.forEach( item => {
            if(item.elem === tag) {
                !item.elem.classList.contains("dragover") && item.elem.classList.add("dragover");
                return true;
            }
        });
    }else if(DAD.elem.drag !== null){
        DAD.elem.drag.forEach( item => {
            if(item.elem === event.target) {
                !item.elem.classList.contains("dragover") && item.elem.classList.add("dragover");
                return true;
            }
        });
    }
};

const removeClass = event =>
{
    if(DAD.elem.drag !== null){
        DAD.elem.drag.forEach( item => {
            item.elem.classList.contains("dragover") && item.elem.classList.remove("dragover");
        });
    }
};

const dragenter = (event, tag = null) =>
{
    event.preventDefault();
    addClass(event, tag);
};

const dragleave = event =>
{
    event.preventDefault();
    removeClass(event);
};

const dragover = (event, tag = null) =>
{
    event.preventDefault();
    addClass(event, tag);
};

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

function FileListItem(files) {
    files = [].slice.call(Array.isArray(files) ? files : arguments);
    for (var count, arrCount = count = files.length, item = true; arrCount-- && item;) item = files[arrCount] instanceof File;
    if (!item) throw new TypeError("expected argument to FileList is File or array of File objects");
    for (arrCount = (new ClipboardEvent("")).clipboardData || new DataTransfer; count--;) arrCount.items.add(files[count]);
    return arrCount.files;
};

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

const addFile = (event, element, type) =>
{
    let indexis = getIndex(element, type);

    if(indexis.index !== -1) {
        if(indexis.type === "drop") {
            if(DAD.elem.drag[indexis.index].start !== undefined){
                DAD.elem.drag[indexis.index].start();
            }
        }else {
            if(DAD.elem.file[indexis.index].start !== undefined){
                DAD.elem.file[indexis.index].start();
            }
        }
    }

    DAD.file = [];
    DAD.data.files = [];

    removeClass(event);

    if(type === "drop"){
        DAD.file = event.dataTransfer.files;
    }else {
        DAD.file = event.target.files;
    }

    if(isEmpty(DAD.file, (err) => {
        if(indexis.index !== -1) {
            if(indexis.type === "drop") {
                if(DAD.elem.drag[indexis.index].end !== undefined){
                    DAD.elem.drag[indexis.index].end(null, err);
                }
            }else {
                if(DAD.elem.file[indexis.index].end !== undefined){
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
                        if(multiple){
                            DAD.elem.drag[indexis.index].input.files = new FileListItem([...DAD.file]);
                        }else {
                            DAD.elem.drag[indexis.index].input.files = new FileListItem(DAD.file[0]);
                        }
                    }

                    if(DAD.elem.drag[indexis.index].end !== undefined){
                        DAD.elem.drag[indexis.index].end(res, null);
                    }
                }else {
                    if(DAD.elem.file[indexis.index].input !== null) {
                        if(multiple){
                            DAD.elem.file[indexis.index].input.files = new FileListItem([...DAD.file]);
                        }else {
                            DAD.elem.file[indexis.index].input.files = new FileListItem(DAD.file[0]);
                        }
                    }

                    if(DAD.elem.file[indexis.index].end !== undefined){
                        DAD.elem.file[indexis.index].end(res, null);
                    }
                }
            }
        }).catch( err => {
            if(indexis.index !== -1) {
                if(indexis.type === "drop") {
                    if(DAD.elem.drag[indexis.index].end !== undefined){
                        DAD.elem.drag[indexis.index].end(null, err);
                    }
                }else {
                    if(DAD.elem.file[indexis.index].end !== undefined){
                        DAD.elem.file[indexis.index].end(null, err);
                    }
                }
            }
        });
    }

    return true;
};

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

const isNodelist = tags => typeof tags.length !== "undefined" && typeof tags.item !== "undefined";

const toBoolean = text => text === "true";

const getTypeMultiple = elem => {
    let multiple = false;

    if(elem.hasAttribute("multiple") && elem.getAttribute("multiple").length > 0) {
        multiple = toBoolean(elem.getAttribute("multiple"));
    }

    return multiple;
};

const getAllTabsByParent = tag =>
{
    let all = tag.getElementsByTagName("*");
    for(let element of all) {
        element.addEventListener('dragenter', (event) => dragenter(event, tag), false);
        element.addEventListener('dragover', (event) =>  dragover(event, tag), false);
    }
};

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

DAD.draggedUpload = (props = defaultProps) =>
{
    let elem = props.element;
    if(elem !== null && isNodelist(elem)) {
        for(let element of elem) {
            DAD.elem.drag.push({
                elem: element,
                input: props.input ? props.input : null,
                start: props.start ? props.start : undefined,
                end: props.end ? props.end : undefined
            });
            elemAddEventDragged(element);
        }
    }else if(elem !== null) {
        DAD.elem.drag.push({
            elem: elem,
            input: props.input ? props.input : null,
            start: props.start ? props.start : undefined,
            end: props.end ? props.end : undefined
        });
        elemAddEventDragged(elem);
    }
};

DAD.fileChange = (props = defaultProps) =>
{
    let elem = props.element;
    if(elem !== null && isNodelist(elem)) {
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

const dragContext = event =>
{
    DAD.elem.draggable.forEach( item => {
        if(event.target === item.node){
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

const addInObյect = elem =>
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

DAD.draggableContext = elem =>
{
    if(elem !== null && isNodelist(elem)) {
        for(let item of elem) {
            addInObյect(item);
        }
    }else if(elem !== null) {
        addInObյect(elem);
    }

    if(elem !== null) {
        addEventDragAndDrop();
    }
};