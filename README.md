# Drag And Drop (DAD)

## Example

### html

    <label for="addFile" class="choose-file" data-content="Choose a File" multiple="true"></label>
    <input type="file" id="addFile" class="input-file" multiple="false" />

### javascript

    DAD.dragedUpload({
        element: doc.querySelectorAll(".label-image"),
        input: doc.querySelector(".input-image"),
        start: () => loader.classList.contains("d-none") && loader.classList.remove("d-none"),
        end: (res, err) => {
            console.log(res)
            if(err === null){
                if(imageName !== null) {
                    imageName.innerText = res.files[0].filename;
                }
            }else {
                console.log("Error ::: ", err);
            }
            !loader.classList.contains("d-none") && loader.classList.add("d-none");
        }
    });

    DAD.fileChange({
        element: doc.querySelectorAll(".input-image"),
        start: () => loader.classList.contains("d-none") && loader.classList.remove("d-none"),
        end: (res, err) => {
            if(err === null){
                if(imageName !== null) {
                    imageName.innerText = res.files[0].filename;
                }
            }else {
                console.log("Error ::: ", err);
            }
            !loader.classList.contains("d-none") && loader.classList.add("d-none");
        }
    });

    DAD.dragableContex(doc.querySelectorAll(".navbar"));