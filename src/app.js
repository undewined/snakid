"use strict";

import { Popup } from "./Components/Popup.js";

const $ = document;
const $$ = window;

const $BODY = $.body;
const $SELECT = (sel) => $.querySelector(sel);
const $SET_TITLE = (title) => ($.title = title);

$BODY.oncontextmenu = (e) => e.preventDefault();

class App {
  constructor() {
    this.isLoaded = $BODY.classList.contains("active");
  }

  loadApp() {
    setTimeout(() => {
      $BODY.classList.toggle("active", !this.isLoaded);
      $SET_TITLE(this.isLoaded ? "" : "Snakid - Cool Classic Game");
    }, 100);
  }

  static start() {
    toggleMenu(menuActive);
    startGame();
  }
}

const FPS = 12;
const frameInterval = 1000 / FPS;
let lastTime = 0;
let menuActive = true;
let app = new App();

const menu = $SELECT(".contentWrapper");
const canvas = $SELECT("#canvas");
const scoreBtn = $SELECT("#scores");
const backBtn = $SELECT("#back");
const htpCloseBtn = $SELECT(".htpPopUp__card_header-closeBtn");

const ctx =
  canvas?.getContext("2d") ??
  (() => {
    throw new Error("Canvas not found!");
  })();

const toggleMenu = (isActive) => {
  menu.classList.toggle("close", isActive);
  backBtn.classList.toggle("active", isActive);
  menuActive = !isActive;
  return !isActive;
};

const startGame = () => {
  canvas.removeAttribute("hidden");

  const cellSize = 40;
  const cellNumber = 20;
  // const SCREEN_UPDATE = new Event("SCREEN_UPDATE");
  let appleImage = new Image();
  appleImage.src = "src/assets/pic/texture/apple.png";
  new FontFace("PoetsenOne-Regular", "url(font/PoetsenOne-Regular.ttf)");

  class Vector2 {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    add(vector) {
      return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    equals(vector) {
      return this.x === vector.x && this.y === vector.y;
    }

    subtract(vector) {
      return new Vector2(this.x - vector.x, this.y - vector.y);
    }
  }

  class Snake {
    constructor() {
      this.body = [new Vector2(5, 10), new Vector2(4, 10), new Vector2(3, 10)];

      this.direction = new Vector2(0, 0);
      this.newBlock = false;

      this.headUp = new Image();
      this.headUp.src = "src/assets/pic/texture/head_up.png";
      this.headDown = new Image();
      this.headDown.src = "src/assets/pic/texture/head_down.png";
      this.headRight = new Image();
      this.headRight.src = "src/assets/pic/texture/head_right.png";
      this.headLeft = new Image();
      this.headLeft.src = "src/assets/pic/texture/head_left.png";

      this.tailUp = new Image();
      this.tailUp.src = "src/assets/pic/texture/tail_up.png";
      this.tailDown = new Image();
      this.tailDown.src = "src/assets/pic/texture/tail_down.png";
      this.tailRight = new Image();
      this.tailRight.src = "src/assets/pic/texture/tail_right.png";
      this.tailLeft = new Image();
      this.tailLeft.src = "src/assets/pic/texture/tail_left.png";

      this.bodyVertical = new Image();
      this.bodyVertical.src = "src/assets/pic/texture/body_vertical.png";
      this.bodyHorizontal = new Image();
      this.bodyHorizontal.src = "src/assets/pic/texture/body_horizontal.png";

      this.bodyTR = new Image();
      this.bodyTR.src = "src/assets/pic/texture/body_tr.png";
      this.bodyTL = new Image();
      this.bodyTL.src = "src/assets/pic/texture/body_tl.png";
      this.bodyBR = new Image();
      this.bodyBR.src = "src/assets/pic/texture/body_br.png";
      this.bodyBL = new Image();
      this.bodyBL.src = "src/assets/pic/texture/body_bl.png";

      this.crunchSound = new Audio("src/assets/sound/crunch.wav");
    }

    drawSnake() {
      this.updateHeadGraphics();
      this.updateTailGraphics();

      for (let index = 0; index < this.body.length; index++) {
        let block = this.body[index];
        let x = block.x * cellSize;
        let y = block.y * cellSize;
        let blockRect = new Path2D();
        blockRect.rect(x, y, cellSize, cellSize);

        if (index === 0) {
          ctx.drawImage(this.head, x, y);
        } else if (index === this.body.length - 1) {
          ctx.drawImage(this.tail, x, y);
        } else {
          let previousBlock = this.body[index + 1].subtract(block);
          let nextBlock = this.body[index - 1].subtract(block);
          if (previousBlock.x === nextBlock.x) {
            ctx.drawImage(this.bodyVertical, x, y);
          } else if (previousBlock.y === nextBlock.y) {
            ctx.drawImage(this.bodyHorizontal, x, y);
          } else {
            if (
              (previousBlock.x === -1 && nextBlock.y === -1) ||
              (previousBlock.y === -1 && nextBlock.x === -1)
            ) {
              ctx.drawImage(this.bodyTL, x, y);
            } else if (
              (previousBlock.x === -1 && nextBlock.y === 1) ||
              (previousBlock.y === 1 && nextBlock.x === -1)
            ) {
              ctx.drawImage(this.bodyBL, x, y);
            } else if (
              (previousBlock.x === 1 && nextBlock.y === -1) ||
              (previousBlock.y === -1 && nextBlock.x === 1)
            ) {
              ctx.drawImage(this.bodyTR, x, y);
            } else if (
              (previousBlock.x === 1 && nextBlock.y === 1) ||
              (previousBlock.y === 1 && nextBlock.x === 1)
            ) {
              ctx.drawImage(this.bodyBR, x, y);
            }
          }
        }
      }
    }

    updateHeadGraphics() {
      console.log(this.body[1]);

      let headRelation = this.body[1].subtract(this.body[0]);
      if (headRelation.equals(new Vector2(1, 0))) {
        this.head = this.headLeft;
      } else if (headRelation.equals(new Vector2(-1, 0))) {
        this.head = this.headRight;
      } else if (headRelation.equals(new Vector2(0, 1))) {
        this.head = this.headUp;
      } else if (headRelation.equals(new Vector2(0, -1))) {
        this.head = this.headDown;
      }
    }

    updateTailGraphics() {
      let tailRelation = this.body[this.body.length - 2].subtract(
        this.body[this.body.length - 1]
      );
      if (tailRelation.equals(new Vector2(1, 0))) {
        this.tail = this.tailLeft;
      } else if (tailRelation.equals(new Vector2(-1, 0))) {
        this.tail = this.tailRight;
      } else if (tailRelation.equals(new Vector2(0, 1))) {
        this.tail = this.tailUp;
      } else if (tailRelation.equals(new Vector2(0, -1))) {
        this.tail = this.tailDown;
      }
    }

    moveSnake() {
      if (this.newBlock === true) {
        let bodyCopy = [...this.body];
        bodyCopy.splice(0, 0, bodyCopy[0].add(this.direction));
        this.body = [...bodyCopy];
        this.newBlock = false;
      } else {
        let bodyCopy = this.body.slice(0, -1);
        bodyCopy.splice(0, 0, bodyCopy[0].add(this.direction));
        this.body = [...bodyCopy];
      }
    }

    addBlock() {
      this.newBlock = true;
    }

    playCrunchSound() {
      this.crunchSound.play();
    }

    reset() {
      this.body = [new Vector2(5, 10), new Vector2(4, 10), new Vector2(3, 10)];
      this.direction = new Vector2(0, 0);
    }
  }

  class Fruit {
    constructor() {
      this.randomize();
    }

    drawFruit() {
      let fruitX = this.pos.x * cellSize;
      let fruitY = this.pos.y * cellSize;
      ctx.drawImage(appleImage, fruitX, fruitY);
    }

    randomize() {
      this.x = Math.min(
        16,
        Math.max(0, Math.floor(Math.random() * cellNumber))
      );
      this.y = Math.min(
        10,
        Math.max(0, Math.floor(Math.random() * cellNumber))
      );

      this.pos = new Vector2(this.x, this.y);
    }
  }

  class Main {
    constructor() {
      this.snake = new Snake();
      this.fruit = new Fruit();
    }

    update() {
      this.snake.moveSnake();
      this.checkCollision();
      this.checkFail();
    }

    drawElements() {
      this.drawGrass();
      this.fruit.drawFruit();
      this.snake.drawSnake();
      this.drawScore();
    }

    checkCollision() {
      if (this.fruit.pos.equals(this.snake.body[0])) {
        this.fruit.randomize();
        this.snake.addBlock();
        this.snake.playCrunchSound();
      }

      for (let block of this.snake.body.slice(1)) {
        if (block.equals(this.fruit.pos)) {
          this.fruit.randomize();
        }
      }
    }

    checkFail() {
      if (
        this.snake.body[0].x < 0 ||
        this.snake.body[0].x > 17 ||
        this.snake.body[0].y < 0 ||
        this.snake.body[0].y > 11
      ) {
        this.gameOver();
      }

      if (
        !(0 <= this.snake.body[0].x < cellNumber) ||
        !(0 <= this.snake.body[0].y < cellNumber)
      ) {
        this.gameOver();
      }

      for (let i = 1; i < this.snake.body.length; i++) {
        if (this.snake.body[i].equals(this.snake.body[0])) {
          this.gameOver();
        }
      }
    }

    gameOver() {
      this.snake.reset();
    }

    drawGrass() {
      let grassColor = "rgb(167, 209, 61)";
      for (let row = 0; row < cellNumber; row++) {
        for (let col = 0; col < cellNumber; col++) {
          if (
            (row % 2 === 0 && col % 2 === 0) ||
            (row % 2 !== 0 && col % 2 !== 0)
          ) {
            ctx.fillStyle = grassColor;
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    drawScore() {
      let scoreText = (this.snake.body.length - 3).toString();
      ctx.font = "25px PoetsenOne";
      ctx.fillStyle = "rgb(56, 74, 12)";
      ctx.fillText(
        scoreText,
        canvas.width - 35,
        canvas.height - canvas.height + 35
      );
    }
  }

  const mainGame = new Main();

  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  $.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  });

  $.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    endX = touch.clientX;
    endY = touch.clientY;

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 50) {
        if (mainGame.snake.direction.x !== -1) {
          mainGame.snake.direction = new Vector2(1, 0);
        }
      } else if (deltaX < -50) {
        if (mainGame.snake.direction.x !== 1) {
          mainGame.snake.direction = new Vector2(-1, 0);
        }
      }
    } else {
      if (deltaY > 50) {
        if (mainGame.snake.direction.y !== -1) {
          mainGame.snake.direction = new Vector2(0, 1);
        }
      } else if (deltaY < -50) {
        if (mainGame.snake.direction.y !== 1) {
          mainGame.snake.direction = new Vector2(0, -1);
        }
      }
    }
  });

  $.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowUp":
        if (mainGame.snake.direction.y !== 1) {
          mainGame.snake.direction = new Vector2(0, -1);
        }
        break;
      case "ArrowRight":
        if (mainGame.snake.direction.x !== -1) {
          mainGame.snake.direction = new Vector2(1, 0);
        }
        break;
      case "ArrowDown":
        if (mainGame.snake.direction.y !== -1) {
          mainGame.snake.direction = new Vector2(0, 1);
        }
        break;
      case "ArrowLeft":
        if (mainGame.snake.direction.x !== 1) {
          mainGame.snake.direction = new Vector2(-1, 0);
        }
        break;
    }
  });

  let mouseStartX, mouseStartY;

  document.addEventListener("mousedown", (e) => {
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
  });

  document.addEventListener("mouseup", (e) => {
    const deltaX = e.clientX - mouseStartX;
    const deltaY = e.clientY - mouseStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        if (mainGame.snake.direction.x !== -1) {
          mainGame.snake.direction = new Vector2(1, 0);
        }
      } else {
        if (mainGame.snake.direction.x !== 1) {
          mainGame.snake.direction = new Vector2(-1, 0);
        }
      }
    } else {
      if (deltaY > 0) {
        if (mainGame.snake.direction.y !== -1) {
          mainGame.snake.direction = new Vector2(0, 1);
        }
      } else {
        if (mainGame.snake.direction.y !== 1) {
          mainGame.snake.direction = new Vector2(0, -1);
        }
      }
    }
  });

  const gameLoop = (timestamp) => {
    if (timestamp - lastTime >= frameInterval) {
      mainGame.update();
      ctx.fillStyle = "rgb(175, 215, 70)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      mainGame.drawElements();
      lastTime = timestamp;
    }

    requestAnimationFrame(gameLoop);
  };

  requestAnimationFrame(gameLoop);
};

const finishGame = () => {
  canvas.setAttribute("hidden", "");
  clearInterval(snakeInterval);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const tutorialHandler = () => {
  $SELECT("#htpPopUp")?.classList.toggle("active");
};

htpCloseBtn?.addEventListener("click", tutorialHandler);
$SELECT("#tutorial")?.addEventListener("click", tutorialHandler);
$SELECT("#start")?.addEventListener("click", App.start);

backBtn?.addEventListener("click", () => {
  toggleMenu(menuActive);
  finishGame();
});

scoreBtn?.addEventListener("click", () => {
  const prevPopup = $SELECT("snk-popup");
  if (prevPopup) prevPopup.remove();

  const popup = document.createElement("snk-popup");
  popup.setAttribute("title", "Scores");
  $BODY.appendChild(popup);
});

$$.customElements.define("snk-popup", Popup);
$.addEventListener("DOMContentLoaded", () => app.loadApp());
