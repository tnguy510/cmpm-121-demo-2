import "./style.css";

const APP_NAME = "Blows You Up";
const app = document.querySelector<HTMLDivElement>("#app")!;
const header = document.createElement("h1");

document.title = APP_NAME;
app.innerHTML = APP_NAME;
header.innerHTML = "Drawing Time";
app.append(header);

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 256;

const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
app.append(canvas);

ctx.strokeStyle = "black";
ctx.lineWidth = 2;

const drawingChanged = new Event("drawing-changed");
let isDrawing = false;
let strokes: number[][][] = [];
let strokeStack: number[][][] = [];
let numStroke = -1;

canvas.addEventListener("drawing-changed", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < strokes.length; i++){
        for(let j = 1; j < strokes[i].length; j++){
            drawLine(ctx, strokes[i][j-1][0], strokes[i][j-1][1], strokes[i][j][0], strokes[i][j][1]);
        }
    }
});

canvas.addEventListener("mousedown", (event) => {
    strokes.push([]);
    strokeStack = [];
    numStroke++;
    strokes[numStroke].push([event.offsetX, event.offsetY]);
    isDrawing = true;
});

canvas.addEventListener("mousemove", (event) => {
    if(isDrawing) {
        strokes[numStroke].push([event.offsetX, event.offsetY]);
        canvas.dispatchEvent(drawingChanged);
    }
});

document.addEventListener("mouseup", (event) => {
    if(isDrawing) {
        strokes[numStroke].push([event.offsetX, event.offsetY]);
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
    numStroke = -1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
app.append(undoButton);

undoButton.addEventListener("click", () => {
    if(strokes.length){
        strokeStack.push(strokes.pop()!);
        canvas.dispatchEvent(drawingChanged);
        numStroke--;
    }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
app.append(redoButton);

redoButton.addEventListener("click", () => {
    if(strokeStack.length){
        strokes.push(strokeStack.pop()!);
        canvas.dispatchEvent(drawingChanged);
        numStroke++;
    }
})