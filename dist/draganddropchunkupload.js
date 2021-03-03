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

let Chunk = {
    name: 'Chunk Uploader',
    file: {},
    inProcess: null,
    completed: function() {
        let completed = this.file.numberOfChunk - this.inProcess;
        return {
            chunks: (100 * completed) / this.file.numberOfChunk,
            one: 100 / this.file.numberOfChunk
        };
    }
};

let params = {
    chunkSize: 1000000,
    url: null,
    file: null,
    uniqueID: false,
    keys: {
        key: "file",
        end: 'end',
        order: 'order'
    },
    form: {},
    headers: {
        "Content-type": "multipart/form-data"
    },
    start: null,
    end: null,
    onError: null,
    progress: null
};

Chunk.params = params;

const setParams = props => {
    for(let key in props) {
        Chunk.params[key] = props[key];
    }
}

const generateUniqueID = (len = 10, str = '') => {
    str += Math.random().toString(36).substr(2, 9);
    if(str.length > len) {
        return str.substr(0, len);
    }else if(str.length === len) {
        return str;
    }else {
        return generateUniqueID(len, str);
    }
};

const updateProgress = event => {
    if (event.lengthComputable) {
        let percentComplete = Math.round(event.loaded / event.total * 100);

        let completed = Chunk.completed();

        let completedPercent = completed.chunks + ((completed.one * percentComplete) / 100);

        if (Chunk.params.progress !== null) {
            Chunk.params.progress(completedPercent);
        }
    }
};

const fileUploader = chunks => {
    let req = new XMLHttpRequest();

    let header = Chunk.params.headers;

    req.upload.addEventListener("progress", updateProgress);

    req.open('POST', Chunk.params.url);

    for(let key in header) {
        req.setRequestHeader(key, header[key]);
    }

    return new Promise((resolve, reject) => {
        req.send(chunks[0]);

        req.onload = event => {
            resolve({chunks: chunks, event: event.currentTarget});
        };

        req.onerror = err => {
            reject(err);
        };
    });
};

const uploadChunks = chunks => {
    fileUploader(chunks).then(res => {
        res.chunks.shift();
        Chunk.inProcess = res.chunks.length;
        if(res.chunks.length > 0) {
            uploadChunks(res.chunks);
        }else {
            if(Chunk.params.end !== null) {
                let currentTarget = res.event;
                try{
                    Chunk.params.end({
                        response: JSON.parse(currentTarget.response),
                        statusText: currentTarget.statusText,
                        status: currentTarget.status,
                    });
                }catch (err) {
                    Chunk.params.onError(err);
                }
            }
        }
    }).catch(err => {
        if(Chunk.params.onError !== null) {
            Chunk.params.onError(err);
        }
    });
}

const createChunk = (file, start = 0, counter = 1, chunks = []) => {
    let params = Chunk.params;
    let chunkEnd = Math.min(start + params.chunkSize, file.size);
    let chunk = file.slice(start, chunkEnd);

    let chunkForm = new FormData();
    let end = Chunk.file.numberOfChunk === counter;

    chunkForm.append(params.keys.key, chunk);
    chunkForm.append(params.keys.order, counter);
    chunkForm.append(params.keys.end, end);

    let form = params.form;

    for(let key in form) {
        chunkForm.append(key, form[key]);
    }

    chunks.push(chunkForm);

    if(!end) {
        counter++;
        return createChunk(file, chunkEnd, counter, chunks);
    }

    Chunk.inProcess = counter;

    uploadChunks(chunks);
};

Chunk.uploader = options => {
    setParams(options);

    let file = options.file;

    if(file !== null) {
        try {
            if(Chunk.params.start !== null) {
                Chunk.params.start();
            }

            Chunk.file.fileSize = file.size;
            Chunk.file.numberOfChunk = Math.ceil(file.size / Chunk.params.chunkSize);

            if(Chunk.params.uniqueID) {
                Chunk.params.form.uuid = generateUniqueID(Chunk.params.uniqueID);
            }

            createChunk(file);
        }catch (err) {
            if(Chunk.params.onError !== null) {
                Chunk.params.onError(err);
            }
        }
    }else {
        if(Chunk.params.onError !== null) {
            Chunk.params.onError(new TypeError('Change File'));
        }
    }
};

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
            addInObject(item);
        }
    }else if(elem !== null) {
        addInObject(elem);
    }

    if(elem !== null) {
        addEventDragAndDrop();
    }
};