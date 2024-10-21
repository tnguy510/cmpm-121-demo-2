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

//const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
app.append(canvas);

//ctx.fillStyle = "green";
//ctx.fillRect(10, 10, 150, 100);
