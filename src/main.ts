import "./style.css";

const APP_NAME = "Blows You Up";
const app = document.querySelector<HTMLDivElement>("#app")!;
const header = document.createElement("h1");

document.title = APP_NAME;
app.innerHTML = APP_NAME;
header.innerHTML = "Drawing Time";
app.append(header);

interface Displayable {
    display (cxt: CanvasRenderingContext2D): void;
    addPoint (x: number, y: number): void;
}

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 256;

const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
app.append(canvas);

ctx.strokeStyle = "black";
ctx.lineWidth = 2;

const drawingChanged = new Event("drawing-changed");
let isDrawing = false;
let strokes: Displayable[] = [];
let strokeStack: Displayable[] = [];
let currentStroke: Displayable;


function DisplayObject(): Displayable {
    const points: {x: number; y: number }[] = [];

    function addPoint(x: number, y: number) {
        points.push({x, y});
    }

    function display(ctx: CanvasRenderingContext2D) {
        for(let i = 1; i < points.length - 1; i++) {
            drawLine(ctx, points[i-1].x, points[i-1].y, points[i].x, points[i].y);
        }
    }

    return {display, addPoint};
}

function displayAll(ctx: CanvasRenderingContext2D){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(stroke => stroke.display(ctx));
}

canvas.addEventListener("drawing-changed", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < strokes.length; i++){
        strokes[i].display(ctx);
    }
});

canvas.addEventListener("mousedown", (event) => {
    strokeStack = [];
    currentStroke = DisplayObject();
    currentStroke.addPoint(event.offsetX, event.offsetY);
    strokes.push(currentStroke);
    isDrawing = true;
});

canvas.addEventListener("mousemove", (event) => {
    if(isDrawing) {
        currentStroke.addPoint(event.offsetX, event.offsetY);
        canvas.dispatchEvent(drawingChanged);
    }
});

document.addEventListener("mouseup", (event) => {
    if(isDrawing) {
        currentStroke.addPoint(event.offsetX, event.offsetY);
        isDrawing = false;
        canvas.dispatchEvent(drawingChanged);
    }
});

function drawLine(line: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    line.beginPath();
    line.moveTo(x1, y1);
    line.lineTo(x2, y2);
    line.stroke();
    line.closePath();
}

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear Canvas";
app.append(clearButton);

clearButton.addEventListener("click", () => {
    strokes = [];
    strokeStack = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
app.append(undoButton);

undoButton.addEventListener("click", () => {
    if(strokes.length){
        strokeStack.push(strokes.pop()!);
        canvas.dispatchEvent(drawingChanged);
    }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
app.append(redoButton);

redoButton.addEventListener("click", () => {
    if(strokeStack.length){
        strokes.push(strokeStack.pop()!);
        canvas.dispatchEvent(drawingChanged);
    }
})