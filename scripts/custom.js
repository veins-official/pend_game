const images = []; let isPlay = false;


class Loader {
    constructor(images_count) { this.images_count = images_count; this.load_progress = 0; }

    load() {
        for (let i = 0; i < this.images_count; i++) {
            images.push(new Image()); images[i].src = "resources/images/" + i + ".png";
            images[i].onload = () => this.setLoadProgress(this.load_progress + 1);
        }
    }

    setLoadProgress(load_progress) {
        this.load_progress = load_progress; console.log("loading: " + this.load_progress / this.images_count * 100 + "%");
        if(this.load_progress === this.images_count) startGame();
    }
}


class Background extends GameObject {
    constructor() { super(540, 960, 1080, 1920); }
    lateUpdate() { clearTransform(this.transform, 2); }
}


class Player extends GameObject {
    constructor() { super(540, 960, 100, 100); this.a = 0; this.speed = 0.4; this.dir = false; }

    update() {
        this.transform.position.x = 540 + 400 * Math.cos(this.a);
        this.transform.position.y = 960 + 400 * Math.sin(this.a);

        if (this.dir) { if(this.a < Math.PI) this.a += this.speed; }
        else { if(this.a > 0) this.a -= this.speed; }

        if(this.a > Math.PI) this.a = Math.PI;
        if(this.a < 0) this.a = 0;
    }

    tap() { this.dir = !this.dir; }

    lateUpdate() {
        layers[2].context.beginPath();
        layers[2].context.arc(this.transform.position.x, this.transform.position.y, this.transform.size.x / 2, 0, 2 * Math.PI, false);
        layers[2].context.fillStyle = '#66fcf1';
        layers[2].context.fill();

        layers[2].context.beginPath();
        layers[2].context.moveTo(540, 960);
        layers[2].context.lineTo(this.transform.position.x, this.transform.position.y);
        layers[2].context.stroke();
    }
    
    collision(other) { if(other.constructor.name == "Bomb") loadScene(Menu); }
}


class Control extends Button {
    constructor() { super(540, 960, 1080, 1920); }
    onPress() { objects[3].tap(); }
}


class LevelGenerator extends GameObject {
    constructor() { super(540, 960, 0, 0); this.time = 0; this.timeout = 1; this.confusion = 0; }

    update() {
        this.time++; if(this.time >= this.timeout * 60) { this.spawn(); this.time = 0; }
        this.confusion += 1/3600; if(this.confusion > 1) this.confusion = 1;
    }

    spawn() {
        let x = float2int(random() * 980) + 50;
        objects.push(new Bomb(x));
        this.timeout = float2int((1.3 + random() * 0.5 * (1 - this.confusion)) * 100) / 100 - this.confusion;
    }
}


class FallingObject extends GameObject {
    constructor(x) { super(x, -50, 100, 100); this.a = 0; this.m = 100; }

    update() {
        this.a += 1/60 * this.m; this.transform.position.y += this.a;
        if(this.transform.position.y > 1970) { this.destroyed = true; this.onDestroy(); }
    }

    lateUpdate() {
        layers[2].context.beginPath();
        layers[2].context.arc(this.transform.position.x, this.transform.position.y, this.transform.size.x / 2, 0, 2 * Math.PI, false);
        layers[2].context.fillStyle = '#c5c6c7';
        layers[2].context.fill();
    }

    onDestroy() { }
}


class Bomb extends FallingObject {
    constructor(x) { super(x); }

    onDestroy() {
        super.onDestroy(); let sizeY = float2int(random() * 700 + 100);

        layers[1].context.beginPath();
        layers[1].context.arc(this.transform.position.x, 1920 - sizeY, this.transform.size.x / 2, 0, 2 * Math.PI, false);
        layers[1].context.rect(this.transform.position.x - this.transform.size.x / 2, 1920 - sizeY, 100, sizeY);
        layers[1].context.fill();
    }

    collision() { }
}


class MenuButton extends Button {
    constructor(x, y, size, img, func) { super(x, y, size, size); this.func = func; this.img = img; this.render(); }

    render() { renderImage(images[this.img], this.transform, 3); }
    animate(value) {
        clearTransform(this.transform, 3);
        this.transform.size.x += value;
        this.transform.size.y += value;
        this.render();
    }

    onRelease() { this.animate(50); this.func.call(); }
    onInterrupt() { this.animate(50); }
    onPress() { this.animate(-50); }
}


class ScoreText extends GameObject {
    constructor() {
        super(50, 100, 100, 200); this.score = 0;
        this.highScore = localStorage.getItem("score") != null ? localStorage.getItem("score") : 0;
    }

    update() {
        if(isPlay) {
            this.score += 1/60; this.render("score")
            if(float2int(this.score) > float2int(this.highScore)) { this.highScore = float2int(this.score); localStorage.setItem("score", this.highScore) }
        }
    }

    render(value) {
        clearTransform(new Vector4(540, this.transform.position.y, 1080, this.transform.size.y), 3);
        layers[3].context.fillText(value == "highScore" ? "Лучшее время:" : "Текущее время:", this.transform.position.x, this.transform.position.y - 50);
        layers[3].context.fillText(float2int(value == "highScore" ? this.highScore : this.score), this.transform.position.x, this.transform.position.y + 50);
    }
}


function clearScene() { for (let i = 2; i < objects.length; i++) objects[i].destroyed = true; }


function loadScene(func) { clearScene(); func.call(); }


function Menu() {
    isPlay = false; objects[1].render("highScore");
    objects.push(new MenuButton(540, 960, 700, 0, () => { loadScene(Game); }));
    objects.push(new MenuButton(930, 1770, 300, 1, () => { if (navigator.share) { navigator.share({ title: "Маятник", url: window.location.href }).then(function () {}).catch(function () {}) } }));
}


function Game() {
    isPlay = true; objects[1].score = 0;
    clearTransform(new Vector4(540, 960, 1080, 1920), 1); clearTransform(new Vector4(540, 960, 1080, 1920), 3);
    objects.push(new Background()); objects.push(new Player());
    objects.push(new Control()); objects.push(new LevelGenerator());
}


function startGame() {
    for (let i = 0; i < 3; i++) layers.push(new Layer());

    layers[0].context.fillStyle = 'black'; layers[0].context.rect(0, 0, 1080, 1920); layers[0].context.fill();
    layers[1].context.globalAlpha = 0.1; layers[1].context.fillStyle = '#c5c6c7';
    layers[2].context.lineWidth = 15; layers[2].context.lineCap = "round"; layers[2].context.strokeStyle = '#66fcf1';
    layers[3].context.font = "100px Monaco, monospace"; layers[3].context.fillStyle = "#c5c6c7";
    layers[3].context.textAlign = 'left'; layers[3].context.textBaseline = 'middle';

    seed = (new Date()).getMilliseconds(); objects.push(new ScoreText()); loadScene(Menu);
}


const loader = new Loader(2); loader.load();
