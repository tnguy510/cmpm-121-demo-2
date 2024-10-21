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

let cursorX, cursorY = 0;
let isDrawing = false;


canvas.addEventListener("mousedown", (event) => {
    cursorX = event.offsetX;
    cursorY = event.offsetY;
    isDrawing = true;
});

canvas.addEventListener("mousemove", (event) => {
    if(isDrawing) {
        drawLine(ctx, cursorX, cursorY, event.offsetX, event.offsetY);
        cursorX = event.offsetX;
        cursorY = event.offsetY;
    }
});

canvas.addEventListener("mouseup", (event) => {
    if(isDrawing) {
        drawLine(ctx, cursorX, cursorY, event.offsetX, event.offsetY);
        cursorX = 0;
        cursorY = 0;
        isDrawing = false;
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})