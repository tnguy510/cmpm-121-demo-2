import "./style.css";

const APP_NAME = "THE  GREAT  PAPYRUS'S  NEW  HOBBY";
const app = document.querySelector<HTMLDivElement>("#app")!;
const header = document.createElement("h1");
const audio = document.getElementById('audio') as HTMLAudioElement;
document.title = APP_NAME;
app.innerHTML = APP_NAME;
header.innerHTML = "ITS DRAWING TIME";
app.append(header);

// Initialization of HTML Elements // ===================================

// Tool Buttons
const toolsContainer = document.createElement("div");
app.append(toolsContainer);

const clearButton = document.createElement("button");
clearButton.innerHTML = "CLEAR CANVAS";
toolsContainer.append(clearButton);

const undoButton = document.createElement("button");
undoButton.innerHTML = "UNDO";
toolsContainer.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerHTML = "REDO";
toolsContainer.append(redoButton);

const thinButton = document.createElement("button");
thinButton.innerHTML = "THIN BRUSH";
toolsContainer.append(thinButton);

const thickButton = document.createElement("button");
thickButton.innerHTML = "THICK BRUSH";
toolsContainer.append(thickButton);

const exportButton = document.createElement("button");
exportButton.innerHTML = "EXPORT";
toolsContainer.append(exportButton);

// Canvas
const canvas = document.createElement("canvas");
canvas.width = canvas.height = 256;

const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
app.append(canvas);

// Sticker Buttons
const stickerContainer = document.createElement("div");
app.append(stickerContainer);

const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "CUSTOM STICKER";
stickerContainer.append(customStickerButton);

// Initialization of preset stickers
const stickerArr = ["🍝", "🦴", "🧩"];

for (const i in stickerArr){
    createStickerButton(stickerArr[i]);
}

// =============================================================

// Interface for all Displayable objects and what is required to return
interface Displayable {
    display (ctx: CanvasRenderingContext2D): void;
    scale (ctx: CanvasRenderingContext2D, scaleGoal: number): void;
} 

// Stroke variables
let currentWidth: number = 2; // Width of tool
const colorArray = ["black", "blue", "red", "orange"]; // Colors to be used
let currentColor = "black";
ctx.strokeStyle = "black";

let strokes: Displayable[] = [];
let strokeStack: Displayable[] = []; // Strokes being held
let currentStroke: ReturnType<typeof DisplayStroke> | null = null;

// Sticker variables
let currentSticker: ReturnType<typeof createSticker> | null = null;
let lastSticker: string;
const scaleGoal = 4;

// Drawing
const drawingChanged = new Event("drawing-changed");
let isDrawing = false;
let activeToolPreview: Displayable | null = null; // Preview of tool on cursor

// Displays All Current Strokes to the canvas
function DisplayStroke(): Displayable & { addPoint (x: number, y: number): void}{
    const points: {x: number; y: number }[] = [];
    const brushWidth = currentWidth;
    const brushColor = currentColor;

    //Reiterates through a "point" array where every point is saved with width and color that then 
    //redraws the entire canvas
    function display(ctx: CanvasRenderingContext2D) {
        for(let i = 1; i < points.length - 1; i++) {
            drawLine(ctx, points[i-1].x, points[i-1].y, points[i].x, points[i].y, brushWidth, brushColor);
        }
    }

    //Scales the canvas when export is called
    function scale(ctx: CanvasRenderingContext2D, scale: number){
        const scaleArr: {x: number; y: number }[] = [];
        const scaleLine: number = brushWidth * scale;
        for(let i = 1; i < points.length; i++){
            const x = points[i].x * scale;
            const y = points[i].y * scale;
            scaleArr.push({x, y});
        }
        
        //Redraws the canvas by the scaled goal
        for(let i = 1; i < scaleArr.length; i++){
            drawLine(ctx, scaleArr[i-1].x, scaleArr[i-1].y, scaleArr[i].x, scaleArr[i].y, scaleLine, brushColor);
        }
    }

    return {display, 
        addPoint: (x: number, y: number): void => {points.push({x, y});}, 
        scale
    };
}

// Clears the canvas and redraws each stroke in the stroke array
function displayAll(ctx: CanvasRenderingContext2D){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(stroke => stroke.display(ctx));
}

// Takes a starting x and y coordinate and moves a canvas rendering object to the end x and y coordinate with respective width and color
function drawLine(line: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number, color: string) {
    line.beginPath();
    line.lineWidth = width;
    line.strokeStyle = color;
    line.moveTo(x1, y1);
    line.lineTo(x2, y2);
    line.stroke();
    line.closePath();
}

function randomLineColor(){
    currentColor = colorArray[Math.floor(Math.random() * colorArray.length)];
    console.log(currentColor);
}

function createStickerButton(sticker: string){
    const stickerButton = document.createElement("button");
    stickerButton.innerHTML = sticker;
    stickerContainer.append(stickerButton);

    stickerButton.addEventListener("click", () => {
        lastSticker = stickerButton.innerHTML;
    });
}

// Creates a sticker which is a string. Scales up is scaling is called
function createSticker(mouseX: number, mouseY: number, sticker: string): Displayable {
    return {
        display: (ctx: CanvasRenderingContext2D) => {
            ctx.font = "40px Arial";
            ctx.fillText(sticker, mouseX, mouseY);
        },
        scale: (ctx: CanvasRenderingContext2D, scaleGoal: number) => {
            ctx.font = 40 * scaleGoal+"px serif";
            ctx.fillText(sticker, mouseX * scaleGoal, mouseY * scaleGoal);
        }
    }
}

// Shows where the cursor is for the brush tools
function createToolPreview(mouseX: number, mouseY: number): Displayable {
    return {
        display: (ctx: CanvasRenderingContext2D) => {
            ctx.save();
            ctx.beginPath();
            //Creates the preview through Math
            ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
            ctx.fillStyle = currentColor;
            ctx.fill();
            ctx.restore();
        },
        scale: (ctx: CanvasRenderingContext2D) => {
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
        }
    };
}

// Shows where the cursor is for the stickers
function createStickerPreview(mouseX: number, mouseY: number, sticker: string): Displayable {
    return {
        display: (ctx: CanvasRenderingContext2D) => {
            ctx.save();
            ctx.font = "40px Arial";
            ctx.fillText(sticker, mouseX, mouseY);
            ctx.restore();
        },
        scale: (ctx: CanvasRenderingContext2D) => {
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
        }
    }
}

// Event that's called whenever an edit is made to the canvas to update in real time
canvas.addEventListener("drawing-changed", () => {
    displayAll(ctx);
    activeToolPreview?.display(ctx);
});

canvas.addEventListener("mousedown", (event) => {
    if(lastSticker){
        currentStroke = DisplayStroke();
        currentSticker = createSticker(event.offsetX, event.offsetY, lastSticker);
        strokes.push(currentSticker);

        //If you want to only place one sticker at a time uncomment this line
        //lastSticker = "";
    }
    else{
        currentStroke = DisplayStroke();
        currentStroke.addPoint(event.offsetX, event.offsetY);
        strokes.push(currentStroke);
    }

    //strokeStack is set to empty so you cannot redo a previous stroke after undoing and drawing over it
    strokeStack = [];
    isDrawing = true;
    activeToolPreview = null;
});

canvas.addEventListener("mousemove", (event) => {
    if(isDrawing && currentStroke) {
        currentStroke.addPoint(event.offsetX, event.offsetY);
        displayAll(ctx);
        canvas.dispatchEvent(drawingChanged);
    }
    else{
        const toolMovedEvent = new CustomEvent("tool-moved", {
            detail: {x: event.offsetX, y: event.offsetY}
        });
        canvas.dispatchEvent(toolMovedEvent);
    }
    canvas.dispatchEvent(drawingChanged);

});

document.addEventListener("mouseup", (event) => {
    if(isDrawing && currentStroke) {
        currentStroke.addPoint(event.offsetX, event.offsetY);
        isDrawing = false;
        canvas.dispatchEvent(drawingChanged);
    }
    if(audio.paused) {
        audio.play();
    }

});

// Moves cursor around in real time for toolPreview
canvas.addEventListener("tool-moved", (event) => {
    const detail = (event as CustomEvent).detail;
    const {x, y, sticker} = detail;

    if(sticker){
        lastSticker = sticker;
    }
    if(!isDrawing){
        if(!lastSticker){
            activeToolPreview = createToolPreview(x, y);
        }
        else{
            activeToolPreview = createStickerPreview(x, y, lastSticker);
        }
        displayAll(ctx);
        canvas.style.cursor = "none";
    }
    else{
        canvas.style.cursor = "default";
    }
});


// Clears entire canvas
clearButton.addEventListener("click", () => {
    strokes = [];
    strokeStack = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})


// Undoes the most current stroke and adds it to a stack
undoButton.addEventListener("click", () => {
    if(strokes.length){
        strokeStack.push(strokes.pop()!);
        canvas.dispatchEvent(drawingChanged);
    }
});


// Re adds the most current stroke in strokeStack
redoButton.addEventListener("click", () => {
    if(strokeStack.length){
        strokes.push(strokeStack.pop()!);
        canvas.dispatchEvent(drawingChanged);
    }
});


// Thins the stroke tool to a certain width
thinButton.addEventListener("click", () => {
    lastSticker = "";
    currentWidth = 2;
    randomLineColor();
});

// Thickens the stroke tool to a certain width
thickButton.addEventListener("click", () => {
    lastSticker = "";
    currentWidth = 5;
    randomLineColor();
});

// Add a custom sticker which is based on a string
customStickerButton.addEventListener("click", () => {
    const text = prompt("ADD STICKER TEXT");
    if(text){
        createStickerButton(text!);
    }
})

// Exports entire canvas and scales up to 1024 by 1024
exportButton.addEventListener("click", () => {
    const canvasExport = document.createElement("canvas");
    const ctxExport = <CanvasRenderingContext2D>canvasExport.getContext("2d");
    canvasExport.width = canvasExport.height = 1024;
    ctxExport.fillStyle = "white";
    ctxExport.fillRect(0, 0, canvasExport.width, canvasExport.height);

    for(let i = 0; i < strokes.length; i++){
        strokes[i].scale(ctxExport, scaleGoal);
    }

    const exportImage = document.createElement("a");
    exportImage.href = canvasExport.toDataURL("image/png");
    exportImage.download = "canvas.png";
    exportImage.click();
});