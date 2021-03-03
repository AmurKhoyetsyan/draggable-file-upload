/***********************************************************************
 *
 * Copyright (c) 2020 Amur Khoyetsyan
 *
 * The MIT License (MIT)
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