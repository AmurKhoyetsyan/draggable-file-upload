# Drag And Drop (DAD)

## Example

<img src="./img/example.png" width="500" alt="Drop file here draggable file upload" />

### Package connection

    <script type="text/javascript" src="***Path of javascript***"></script>

    1. Your Path + /draganddrop.js
    or
    2. Your Path + /draganddrop.min.js

### html

    <label for="addFile" class="choose-file" data-content="Choose a File" multiple="true"></label>
    <input type="file" id="addFile" class="input-file" multiple="false" />

### javascript

    DAD.dragedUpload({
        element: document.querySelectorAll(".choose-file"),
        input: document.querySelector(".input-file"),
        start: () => console.log("Start"),
        end: (res, err) => {
            if(err === null){
                console.log("Res ::: ", res);
            }else {
                console.log("Error ::: ", err);
            }
        }
    });

    DAD.fileChange({
        element: document.querySelectorAll(".input-file"),
        start: () => console.log("Start"),
        end: (res, err) => {
            if(err === null){
                console.log("Res ::: ", res);
            }else {
                console.log("Error ::: ", err);
            }
        }
    });

<img src="./img/example1.png" width="500" alt="Drop file here draggable file upload" />

When we bring the file closer to the installation area a new class is added to the installation section called ***"dragover"***, with which we can shape the installation area․

<img src="./img/example2.png" width="500" alt="Drop file here draggable file upload" />

    DAD.draggableContex(document.querySelectorAll(".navbar"));