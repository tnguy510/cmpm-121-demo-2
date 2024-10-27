import "./style.css";

const APP_NAME = "Blows You Up";
const app = document.querySelector<HTMLDivElement>("#app")!;
const header = document.createElement("h1");

document.title = APP_NAME;
app.innerHTML = APP_NAME;
header.innerHTML = "DRAWING TIME";
app.append(header);

interface Displayable {
    display (ctx: CanvasRenderingContext2D): void;
    scale (ctx: CanvasRenderingContext2D, scaleGoal: number): void;
} 

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 256;

const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
app.append(canvas);

let currentWidth: number = 2;
ctx.strokeStyle = "black";

const drawingChanged = new Event("drawing-changed");
const stickerArr = ["🍝", "🦴", "🧩"];
let isDrawing = false;
let strokes: Displayable[] = [];
let strokeStack: Displayable[] = [];
let currentStroke: ReturnType<typeof DisplayStroke> | null = null;
let activeToolPreview: Displayable | null = null;
let currentSticker: ReturnType<typeof createSticker> | null = null;
let lastSticker: string;
let scaleGoal = 4;

function DisplayStroke(): Displayable & { addPoint (x: number, y: number): void}{
    const points: {x: number; y: number }[] = [];
    const currScale = scaleGoal;
    const brushWidth = currentWidth;

    function display(ctx: CanvasRenderingContext2D) {
        for(let i = 1; i < points.length - 1; i++) {
            drawLine(ctx, points[i-1].x, points[i-1].y, points[i].x, points[i].y, brushWidth);
        }
    }

    function scale(ctx: CanvasRenderingContext2D, scale: number){
        const scaleArr: {x: number; y: number }[] = [];
        const scaleLine: number = brushWidth * currScale;
        for(let i = 1; i < points.length; i++){
            const x = points[i].x *= currScale;
            const y = points[i].y *= currScale;
            scaleArr.push({x, y});
        }
    
        for(let i = 1; i < scaleArr.length; i++){
            drawLine(ctx, scaleArr[i-1].x, scaleArr[i-1].y, scaleArr[i].x, scaleArr[i].y, scaleLine)
        }
    }

    return {display, 
        addPoint: (x: number, y: number): void => {points.push({x, y});}, 
        scale
    };
}

function displayAll(ctx: CanvasRenderingContext2D){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(stroke => stroke.display(ctx));
}

function drawLine(line: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number) {
    line.beginPath();
    line.lineWidth = width;
    line.moveTo(x1, y1);
    line.lineTo(x2, y2);
    line.stroke();
    line.closePath();
}

function createStickerButton(sticker: string){
    const stickerButton = document.createElement("button");
    stickerButton.innerHTML = sticker;
    app.append(stickerButton);

    stickerButton.addEventListener("click", () => {
        lastSticker = stickerButton.innerHTML;
    });
}

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

function createToolPreview(mouseX: number, mouseY: number): Displayable {
    return {
        display: (ctx: CanvasRenderingContext2D) => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
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

canvas.addEventListener("drawing-changed", () => {
    displayAll(ctx);
    activeToolPreview?.display(ctx);
});

canvas.addEventListener("mousedown", (event) => {
    if(lastSticker){
        currentStroke = DisplayStroke();
        currentSticker = createSticker(event.offsetX, event.offsetY, lastSticker);
        strokes.push(currentSticker);
        lastSticker = "";
    }
    else{
        currentStroke = DisplayStroke();
        currentStroke.addPoint(event.offsetX, event.offsetY);
        strokes.push(currentStroke);
    }
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

});

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

const clearButton = document.createElement("button");
clearButton.innerHTML = "CLEAR CANVAS";
app.append(clearButton);

clearButton.addEventListener("click", () => {
    strokes = [];
    strokeStack = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

const undoButton = document.createElement("button");
undoButton.innerHTML = "UNDO";
app.append(undoButton);

undoButton.addEventListener("click", () => {
    if(strokes.length){
        strokeStack.push(strokes.pop()!);
        canvas.dispatchEvent(drawingChanged);
    }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "REDO";
app.append(redoButton);

redoButton.addEventListener("click", () => {
    if(strokeStack.length){
        strokes.push(strokeStack.pop()!);
        canvas.dispatchEvent(drawingChanged);
    }
});

const thinButton = document.createElement("button");
thinButton.innerHTML = "THIN BRUSH";
app.append(thinButton);

thinButton.addEventListener("click", () => {
    currentWidth = 2;
});

const thickButton = document.createElement("button");
thickButton.innerHTML = "THICK BRUSH";
app.append(thickButton);

thickButton.addEventListener("click", () => {
    currentWidth = 5;
});

const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "CUSTOM STICKER";
app.append(customStickerButton);

customStickerButton.addEventListener("click", () => {
    const text = prompt("ADD STICKER TEXT");
    if(text){
        createStickerButton(text!);
    }
})

for (const i in stickerArr){
    createStickerButton(stickerArr[i]);
}

const exportButton = document.createElement("button");
exportButton.innerHTML = "EXPORT";
app.append(exportButton);

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