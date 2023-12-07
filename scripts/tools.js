// Maths
function abs(value) { return value >= 0 ? value : -value; }

function sqr(value) { return value * value; }

function sign(value) { return value > 0 ? 1 : (value < 0 ? -1 : 0); }

let seed = 0; function random() { return ((seed = (71 * seed + 1) % 100000) / 100000); }

function float2int (value) { return value - value % 1; }
// Maths


// Render
const layers = [];
class Layer {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");

    document.querySelector("body").appendChild(this.canvas);
    this.canvas.width  = 1080;
    this.canvas.height = 1920;
    this.context.imageSmoothingEnabled = false;
  }
}
layers.push(new Layer());

function renderImage(image, transform, layer) {
  layers[layer].context.drawImage(image,
    transform.position.x - transform.size.x / 2,
    transform.position.y - transform.size.y / 2,
    transform.size.x,
    transform.size.y);
}

function clearTransform(transform, layer) {
  layers[layer].context.clearRect(
    transform.position.x - transform.size.x / 2,
    transform.position.y - transform.size.y / 2,
    transform.size.x,
    transform.size.y);
}
// Render


// Input
class Mouse extends GameObject {
  constructor() {
    super(0, 0, 0, 0); this.down = false;

    document.addEventListener("mousemove", (event) => mouse.move(event.clientX, event.clientY));
    document.addEventListener("mousedown", () => mouse.down = true);
    document.addEventListener("mouseup", () => mouse.down = false);

    document.addEventListener("touchmove", (event) => mouse.touch(event));
    document.addEventListener("touchstart", (event) => { mouse.touch(event); mouse.down = true; });
    document.addEventListener("touchend", () => mouse.down = false);
  }

  move(x, y) {
    this.transform.position.x = float2int((x - layers[0].canvas.offsetLeft) / (layers[0].canvas.offsetWidth / layers[0].canvas.width));
    this.transform.position.y = float2int((y - layers[0].canvas.offsetTop) / (layers[0].canvas.offsetHeight / layers[0].canvas.height));
  }

  touch(event) { if (event.touches.length > 0) this.move(event.touches[0].clientX, event.touches[0].clientY); }

  collision() { }
}
const mouse = new Mouse(); objects.push(mouse);
// Input


// UI
class Button extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.lastMouseState = false;
    this.pressed = false;
    this.collide = false;
  }

  update() {
    if(this.pressed) {
      if(this.onInterrupt != null & !this.collide) this.onInterrupt();
      else if(this.onRelease != null & !mouse.down) this.onRelease();
    }

    this.pressed = this.pressed ? this.collide & mouse.down : false;
    this.collide = false;
  }

  collision(other) {
    if(other.constructor.name === "Mouse") {
      this.collide = true;
      if(mouse.down & !this.pressed & !this.lastMouseState) {
        this.pressed = true; if (this.onPress != null) this.onPress();
      }
    }
  }

  lateUpdate() { this.lastMouseState = mouse.down; }
}
// UI
