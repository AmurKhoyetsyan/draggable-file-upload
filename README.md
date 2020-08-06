# Drag And Drop (DAD)

## Example

### html

    <label for="addFile" class="choose-file" data-content="Choose a File" multiple="true"></label>
    <input type="file" id="addFile" class="input-file" multiple="false" />

### javascript

    DAD.dragedUpload({
        element: document.querySelectorAll(".label-image"),
        input: document.querySelector(".input-image"),
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
        element: document.querySelectorAll(".input-image"),
        start: () => console.log("Start"),
        end: (res, err) => {
            if(err === null){
                console.log("Res ::: ", res);
            }else {
                console.log("Error ::: ", err);
            }
        }
    });

    DAD.dragableContex(document.querySelectorAll(".navbar"));