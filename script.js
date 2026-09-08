/* =========================================================
A-CROPPER — SCRIPT.JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

/* =====================================================
   ELEMENTS
===================================================== */

const imageInput = document.getElementById("imageInput");
const browseBtn = document.getElementById("browseBtn");
const dropZone = document.getElementById("dropZone");
const uploadSection = document.getElementById("uploadSection");
const editorSection = document.getElementById("editorSection");
const editorImage = document.getElementById("editorImage");

const themeToggle = document.getElementById("themeToggle");

const shapeButtons = document.querySelectorAll(".shape-btn");
const radiusSlider = document.getElementById("radiusSlider");
const radiusValue = document.getElementById("radiusValue");

const outputWidth = document.getElementById("outputWidth");
const outputHeight = document.getElementById("outputHeight");
const aspectLock = document.getElementById("aspectLock");
const sizePresets = document.querySelectorAll(".size-presets button");

const backgroundButtons = document.querySelectorAll(".bg-btn");
const backgroundColor = document.getElementById("backgroundColor");

const rotateLeft = document.getElementById("rotateLeft");
const flipHorizontal = document.getElementById("flipHorizontal");
const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");
const resetBtn = document.getElementById("resetBtn");

const formatSelect = document.getElementById("formatSelect");
const downloadBtn = document.getElementById("downloadBtn");

const removeBackground = document.getElementById("removeBackground");
const bgStatus = document.getElementById("bgStatus");

const removeColor = document.getElementById("removeColor");
const pickColorBtn = document.getElementById("pickColorBtn");
const toleranceSlider = document.getElementById("toleranceSlider");
const toleranceValue = document.getElementById("toleranceValue");


/* =====================================================
   VARIABLES
===================================================== */

let cropper = null;

let currentShape = "rectangle";
let background = "transparent";

let aspectRatioLocked = true;
let imageAspectRatio = 1;

let scaleX = 1;


/* =====================================================
   THEME
===================================================== */

const savedTheme = localStorage.getItem("aCropperTheme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const darkMode = document.body.classList.contains("dark");

    themeToggle.innerHTML = darkMode
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';

    localStorage.setItem(
        "aCropperTheme",
        darkMode ? "dark" : "light"
    );
});


/* =====================================================
   FILE UPLOAD
===================================================== */

browseBtn.addEventListener("click", () => {
    imageInput.click();
});

dropZone.addEventListener("click", (event) => {

    if (
        event.target.closest("button") ||
        event.target.closest("input")
    ) return;

    imageInput.click();
});


imageInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (file) {
        loadImage(file);
    }

});


/* =====================================================
   DRAG & DROP
===================================================== */

["dragenter", "dragover"].forEach(eventName => {

    dropZone.addEventListener(eventName, event => {

        event.preventDefault();
        dropZone.classList.add("dragover");

    });

});


["dragleave", "drop"].forEach(eventName => {

    dropZone.addEventListener(eventName, event => {

        event.preventDefault();
        dropZone.classList.remove("dragover");

    });

});


dropZone.addEventListener("drop", event => {

    const file = event.dataTransfer.files[0];

    if (file && file.type.startsWith("image/")) {
        loadImage(file);
    }

});


/* =====================================================
   LOAD IMAGE
===================================================== */

function loadImage(file) {

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        return;
    }

    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    const reader = new FileReader();

    reader.onload = event => {

        editorImage.src = event.target.result;

        uploadSection.classList.add("hidden");
        editorSection.classList.remove("hidden");

        editorImage.onload = () => {

            imageAspectRatio =
                editorImage.naturalWidth /
                editorImage.naturalHeight;

            initializeCropper();

            window.scrollTo({
                top: editorSection.offsetTop - 80,
                behavior: "smooth"
            });
        };

    };

    reader.readAsDataURL(file);

}


/* =====================================================
   INITIALIZE CROPPER
===================================================== */

function initializeCropper() {

    if (cropper) {
        cropper.destroy();
    }

    cropper = new Cropper(editorImage, {

        viewMode: 1,

        dragMode: "move",

        autoCropArea: 0.85,

        responsive: true,

        background: false,

        movable: true,

        zoomable: true,

        rotatable: true,

        scalable: true,

        cropBoxMovable: true,

        cropBoxResizable: true,

        toggleDragModeOnDblclick: false

    });

    updateCropperShape();

}


/* =====================================================
   SHAPE SELECTION
===================================================== */

shapeButtons.forEach(button => {

    button.addEventListener("click", () => {

        shapeButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        currentShape = button.dataset.shape;

        updateCropperShape();

    });

});


function updateCropperShape() {

    if (!cropper) return;

    const cropBox = document.querySelector(".cropper-crop-box");
    const face = document.querySelector(".cropper-face");
    const viewBox = document.querySelector(".cropper-view-box");

    if (!cropBox || !face || !viewBox) return;


    /* Reset */

    cropBox.style.borderRadius = "0";
    face.style.borderRadius = "0";
    viewBox.style.borderRadius = "0";


    if (currentShape === "circle") {

        cropper.setAspectRatio(1);

        cropBox.style.borderRadius = "50%";
        face.style.borderRadius = "50%";
        viewBox.style.borderRadius = "50%";

    }


    else if (currentShape === "square") {

        cropper.setAspectRatio(1);

    }


    else if (currentShape === "rectangle") {

        cropper.setAspectRatio(NaN);

    }


    else if (currentShape === "rounded") {

        cropper.setAspectRatio(NaN);

        const radius = radiusSlider.value;

        cropBox.style.borderRadius = radius + "%";
        face.style.borderRadius = radius + "%";
        viewBox.style.borderRadius = radius + "%";

    }

}


/* =====================================================
   ROUNDNESS SLIDER
===================================================== */

radiusSlider.addEventListener("input", () => {

    radiusValue.textContent =
        radiusSlider.value + "%";

    if (currentShape === "rounded") {
        updateCropperShape();
    }

});


/* =====================================================
   ROTATE
===================================================== */

rotateLeft.addEventListener("click", () => {

    if (cropper) {
        cropper.rotate(-90);
    }

});


/* =====================================================
   FLIP
===================================================== */

flipHorizontal.addEventListener("click", () => {

    if (!cropper) return;

    scaleX = scaleX === 1 ? -1 : 1;

    cropper.scaleX(scaleX);

});


/* =====================================================
   ZOOM
===================================================== */

zoomIn.addEventListener("click", () => {

    if (cropper) {
        cropper.zoom(0.1);
    }

});


zoomOut.addEventListener("click", () => {

    if (cropper) {
        cropper.zoom(-0.1);
    }

});


/* =====================================================
   RESET
===================================================== */

resetBtn.addEventListener("click", () => {

    if (!cropper) return;

    cropper.reset();

    scaleX = 1;

    currentShape = "rectangle";

    shapeButtons.forEach(btn => {

        btn.classList.toggle(
            "active",
            btn.dataset.shape === "rectangle"
        );

    });

    updateCropperShape();

});


/* =====================================================
   ASPECT RATIO LOCK
===================================================== */

aspectLock.addEventListener("click", () => {

    aspectRatioLocked = !aspectRatioLocked;

    aspectLock.classList.toggle(
        "active",
        aspectRatioLocked
    );

    aspectLock.innerHTML = aspectRatioLocked
        ? '<i class="fa-solid fa-link"></i>'
        : '<i class="fa-solid fa-link-slash"></i>';

});


outputWidth.addEventListener("input", () => {

    if (!aspectRatioLocked) return;

    const width = parseInt(outputWidth.value);

    if (width > 0) {

        outputHeight.value =
            Math.round(width / imageAspectRatio);

    }

});


outputHeight.addEventListener("input", () => {

    if (!aspectRatioLocked) return;

    const height = parseInt(outputHeight.value);

    if (height > 0) {

        outputWidth.value =
            Math.round(height * imageAspectRatio);

    }

});


/* =====================================================
   SIZE PRESETS
===================================================== */

sizePresets.forEach(button => {

    button.addEventListener("click", () => {

        const size = button.dataset.size;

        outputWidth.value = size;
        outputHeight.value = size;

    });

});


/* =====================================================
   BACKGROUND
===================================================== */

backgroundButtons.forEach(button => {

    button.addEventListener("click", () => {

        backgroundButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        background = button.dataset.bg;

    });

});


backgroundColor.addEventListener("input", () => {

    backgroundButtons.forEach(btn =>
        btn.classList.remove("active")
    );

    background = backgroundColor.value;

});


/* =====================================================
   CREATE FINAL IMAGE
===================================================== */

function createFinalCanvas() {

    if (!cropper) return null;

    const width =
        Math.max(1, parseInt(outputWidth.value) || 512);

    const height =
        Math.max(1, parseInt(outputHeight.value) || 512);


    /* Get cropped image */

    const croppedCanvas =
        cropper.getCroppedCanvas({

            width: width,
            height: height,

            imageSmoothingEnabled: true,
            imageSmoothingQuality: "high"

        });


    /* Final canvas */

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");


    /* Background */

    if (background !== "transparent") {

        ctx.fillStyle = background;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

    }


    /* Clip Shape */

    ctx.save();

    if (currentShape === "circle") {

        const radius =
            Math.min(width, height) / 2;

        ctx.beginPath();

        ctx.arc(
            width / 2,
            height / 2,
            radius,
            0,
            Math.PI * 2
        );

        ctx.closePath();

        ctx.clip();

    }


    else if (currentShape === "rounded") {

        const percentage =
            parseInt(radiusSlider.value) / 100;

        const radius =
            Math.min(width, height) * percentage;

        roundedRectPath(
            ctx,
            0,
            0,
            width,
            height,
            radius
        );

        ctx.clip();

    }


    ctx.drawImage(
        croppedCanvas,
        0,
        0,
        width,
        height
    );

    ctx.restore();

    return canvas;

}


/* =====================================================
   ROUNDED RECTANGLE PATH
===================================================== */

function roundedRectPath(
    ctx,
    x,
    y,
    width,
    height,
    radius
) {

    radius = Math.min(
        radius,
        width / 2,
        height / 2
    );

    ctx.beginPath();

    ctx.moveTo(x + radius, y);

    ctx.lineTo(x + width - radius, y);

    ctx.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + radius
    );

    ctx.lineTo(
        x + width,
        y + height - radius
    );

    ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
    );

    ctx.lineTo(
        x + radius,
        y + height
    );

    ctx.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - radius
    );

    ctx.lineTo(
        x,
        y + radius
    );

    ctx.quadraticCurveTo(
        x,
        y,
        x + radius,
        y
    );

    ctx.closePath();

}


/* =====================================================
   DOWNLOAD
===================================================== */

downloadBtn.addEventListener("click", () => {

    const canvas = createFinalCanvas();

    if (!canvas) return;

    const format = formatSelect.value;

    let mimeType = "image/png";

    if (format === "jpeg") {
        mimeType = "image/jpeg";
    }

    if (format === "webp") {
        mimeType = "image/webp";
    }


    /*
       JPG DOES NOT SUPPORT TRANSPARENCY
       Use white background automatically
    */

    if (
        format === "jpeg" &&
        background === "transparent"
    ) {

        const jpgCanvas =
            document.createElement("canvas");

        jpgCanvas.width = canvas.width;
        jpgCanvas.height = canvas.height;

        const jpgCtx =
            jpgCanvas.getContext("2d");

        jpgCtx.fillStyle = "#ffffff";

        jpgCtx.fillRect(
            0,
            0,
            jpgCanvas.width,
            jpgCanvas.height
        );

        jpgCtx.drawImage(canvas, 0, 0);

        downloadCanvas(
            jpgCanvas,
            mimeType,
            "jpg"
        );

    }

    else {

        downloadCanvas(
            canvas,
            mimeType,
            format
        );

    }

});


function downloadCanvas(
    canvas,
    mimeType,
    extension
) {

    canvas.toBlob(

        blob => {

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                "A-Cropper-" +
                Date.now() +
                "." +
                extension;

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);

        },

        mimeType,

        0.95

    );

}


/* =====================================================
COLOR BACKGROUND REMOVAL
Best for logos with solid backgrounds
===================================================== */

/* Update tolerance number */

toleranceSlider.addEventListener("input", () => {

```
toleranceValue.textContent = toleranceSlider.value;
```

});

/* Pick color from image */

pickColorBtn.addEventListener("click", () => {

```
if (!cropper) return;

bgStatus.textContent =
    "Click on the image to select the background color...";

editorImage.style.cursor = "crosshair";


const pickColor = (event) => {

    const canvasData = cropper.getCanvasData();

    const imageData = cropper.getImageData();


    /*
       Calculate mouse position relative
       to the actual displayed image
    */

    const rect = editorImage.getBoundingClientRect();

    const x = Math.floor(
        (event.clientX - rect.left) *
        (editorImage.naturalWidth / rect.width)
    );

    const y = Math.floor(
        (event.clientY - rect.top) *
        (editorImage.naturalHeight / rect.height)
    );


    /* Create temporary canvas */

    const tempCanvas =
        document.createElement("canvas");

    tempCanvas.width =
        editorImage.naturalWidth;

    tempCanvas.height =
        editorImage.naturalHeight;

    const ctx =
        tempCanvas.getContext("2d");

    ctx.drawImage(
        editorImage,
        0,
        0
    );


    const pixel =
        ctx.getImageData(
            Math.max(0, Math.min(x, tempCanvas.width - 1)),
            Math.max(0, Math.min(y, tempCanvas.height - 1)),
            1,
            1
        ).data;


    /* Convert RGB → HEX */

    const hex =
        "#" +
        [pixel[0], pixel[1], pixel[2]]
            .map(value =>
                value
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("");


    removeColor.value = hex;

    bgStatus.textContent =
        "Color selected: " + hex;

    editorImage.style.cursor = "default";

    editorImage.removeEventListener(
        "click",
        pickColor
    );

};


editorImage.addEventListener(
    "click",
    pickColor
);
```

});

/* =====================================================
REMOVE SELECTED BACKGROUND COLOR
===================================================== */

removeBackground.addEventListener("click", () => {


if (!cropper) return;


try {

    removeBackground.disabled = true;

    removeBackground.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Removing...';

    bgStatus.textContent =
        "Removing selected background color...";


    /*
       Get original image canvas
       BEFORE applying shape crop
    */

    const sourceCanvas =
        cropper.getCroppedCanvas({

            imageSmoothingEnabled: true,
            imageSmoothingQuality: "high"

        });


    const ctx =
        sourceCanvas.getContext("2d");

    const imageData =
        ctx.getImageData(
            0,
            0,
            sourceCanvas.width,
            sourceCanvas.height
        );

    const pixels =
        imageData.data;


    /* Selected HEX → RGB */

    const hex =
        removeColor.value.replace("#", "");

    const targetR =
        parseInt(hex.substring(0, 2), 16);

    const targetG =
        parseInt(hex.substring(2, 4), 16);

    const targetB =
        parseInt(hex.substring(4, 6), 16);

    const tolerance =
        parseInt(toleranceSlider.value);


    /*
       LOOP THROUGH EVERY PIXEL
    */

    for (
        let i = 0;
        i < pixels.length;
        i += 4
    ) {

        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];


        /*
           Calculate RGB color distance
        */

        const distance =
            Math.sqrt(

                Math.pow(r - targetR, 2) +

                Math.pow(g - targetG, 2) +

                Math.pow(b - targetB, 2)

            );


        /*
           Make matching pixels transparent
        */

        if (distance <= tolerance) {

            pixels[i + 3] = 0;

        }

    }


    /*
       Put edited pixels back
    */

    ctx.putImageData(
        imageData,
        0,
        0
    );


    /*
       Convert processed canvas → image
    */

    sourceCanvas.toBlob((blob) => {

        if (!blob) {
            throw new Error(
                "Could not process image"
            );
        }


        const imageURL =
            URL.createObjectURL(blob);


        /*
           Destroy old Cropper
        */

        if (cropper) {

            cropper.destroy();

            cropper = null;

        }


        /*
           Load transparent result
        */

        editorImage.onload = () => {

            imageAspectRatio =
                editorImage.naturalWidth /
                editorImage.naturalHeight;


            initializeCropper();


            /*
               Set transparent background
            */

            background = "transparent";


            backgroundButtons.forEach(btn => {

                btn.classList.toggle(
                    "active",
                    btn.dataset.bg === "transparent"
                );

            });


            bgStatus.textContent =
                "Background removed successfully ✓";


            removeBackground.disabled = false;

            removeBackground.innerHTML =
                '<i class="fa-solid fa-check"></i> Background Removed';


            setTimeout(() => {

                removeBackground.innerHTML =
                    '<i class="fa-solid fa-eraser"></i> Remove Background Color';

            }, 2500);

        };


        editorImage.src = imageURL;

    }, "image/png");


}

catch (error) {

    console.error(
        "Color removal error:",
        error
    );


    bgStatus.textContent =
        "Something went wrong.";

    removeBackground.disabled = false;

    removeBackground.innerHTML =
        '<i class="fa-solid fa-eraser"></i> Try Again';

}


});

});
