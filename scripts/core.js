const objects = [];

class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Vector4 {
  constructor(x, y, width, height) {
    this.position = new Vector2(x, y);
    this.size = new Vector2(width, height);
  }
}

class GameObject {
  constructor(x, y, width, height) {
    this.transform = new Vector4(x, y, width, height);
    this.destroyed = false;
  }
}

function update() {
  for (let i = 0; i < objects.length; i++) {
    if(objects[i].destroyed) { objects.splice(i, 1); i--; }
    else { if(objects[i].update) objects[i].update(); }
  }
}

function collisions() {
  objects.forEach((object1, x) => {
    if(object1.collision) {
      for (let y = objects.length - 1; y > x; y--) {
        const object2 = objects[y];
        if(object2.collision) {
          if(abs(object1.transform.position.x - object2.transform.position.x) < (object1.transform.size.x + object2.transform.size.x) / 2 &
             abs(object1.transform.position.y - object2.transform.position.y) < (object1.transform.size.y + object2.transform.size.y) / 2) {
            object1.collision(object2);
            object2.collision(object1);
          }
        }
      }
    }
  });
}

function lateUpdate() { objects.forEach((object) => { if(object.lateUpdate) object.lateUpdate(); }); }

function tick() {
  requestAnimationFrame(tick);
  update(); collisions(); lateUpdate();
}

requestAnimationFrame(tick);
