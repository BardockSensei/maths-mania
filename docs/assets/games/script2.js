let canvas;
let targetResult;
let shapes = [];
let score = 0;
let isPaused = false;
let pauseButton;
let shapeCount = 6;

function setup() {
  canvas = createCanvas(windowWidth * 0.95, windowHeight * 0.6);
  canvas.parent("canvas_div");

  noStroke();
  angleMode(DEGREES);
  frameRate(60);

  // Bouton Pause
  pauseButton = createButton("Pause");
  pauseButton.size(200, 60);
  pauseButton.position(20, height + 90);
  pauseButton.style("font-size", "16px");
  pauseButton.style("background-color", "#ff4444");
  pauseButton.style("color", "white");
  pauseButton.style("border", "none");
  pauseButton.style("border-radius", "5px");
  pauseButton.style("cursor", "pointer");
  pauseButton.mousePressed(togglePause);
  pauseButton.mouseOver(() => pauseButton.style("background-color", "#cc0000"));
  pauseButton.mouseOut(() => pauseButton.style("background-color", "#ff4444"));

  shapeCount = 6;
  startGame();
}

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    pauseButton.html("Reprendre");
    noLoop();
  } else {
    pauseButton.html("Pause");
    loop();
  }
}

function startGame() {
  targetResult = int(random(5, 50)); // Générer un résultat cible aléatoire
  shapes = generateShapes(targetResult, shapeCount);
}

function draw() {
  if (isPaused) {
    return;
  }

  drawSky(); // Dessin du ciel avec dégradé

  // Affichage du score et du résultat cible
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(`Trouver : ${targetResult}`, width / 2, height - 30);
  text(`Score: ${score}`, width / 2, 30);

  // Afficher et déplacer les formes
  shapes.forEach((shape) => {
    shape.move();
    shape.display();
  });
}

function drawSky() {
  let ctx = canvas.drawingContext;

  let gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0.0, "#2196F3");
  gradient.addColorStop(0.3, "#42A5F5");
  gradient.addColorStop(0.6, "#90CAF9");
  gradient.addColorStop(1.0, "#E3F2FD");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function mousePressed() {
  shapes.forEach((shape) => {
    if (shape.isClicked(mouseX, mouseY)) {
      if (shape.value === targetResult) {
        score++;
        shapeCount = min(28, shapeCount + 2);
        startGame(); // Générer un nouveau résultat et de nouvelles formes
      } else {
        console.log("Mauvaise réponse !");
      }
    }
  });
}

function generateShapes(target, numShapes) {
  const operations = ["+", "-", "*", "/"];
  const generatedShapes = [];

  for (let i = 0; i < numShapes; i++) {
    const x = random(100, width - 100);
    const y = random(100, height - 150);

    let num1 = int(random(1, 20));
    let num2 = int(random(1, 20));
    let operation = random(operations);

    let value;
    switch (operation) {
      case "+":
        value = num1 + num2;
        break;
      case "-":
        if (num1 < num2) [num1, num2] = [num2, num1]; // Éviter les résultats négatifs
        value = num1 - num2;
        break;
      case "*":
        value = num1 * num2;
        break;
      case "/":
        while (num1 % num2 !== 0 || num2 === 0) {
          num1 = int(random(1, 20));
          num2 = int(random(1, 20));
        }
        value = num1 / num2;
        break;
    }
    value = round(value);

    const shape = new Shape(x, y, `${num1} ${operation} ${num2}`, value);
    generatedShapes.push(shape);
  }

  // Forcer une forme avec le bon résultat et un calcul correct
  const correctShape = random(generatedShapes);
  let num1, num2, operation;

  do {
    operation = random(operations);
    switch (operation) {
      case "+":
        num1 = int(random(1, target));
        num2 = target - num1;
        break;
      case "-":
        num1 = target + int(random(1, 20));
        num2 = num1 - target;
        break;
      case "*":
        num1 = int(random(1, floor(target / 2) + 1));
        num2 = target / num1;
        if (!Number.isInteger(num2)) continue;
        break;
      case "/":
        num2 = int(random(1, 10));
        num1 = target * num2;
        break;
    }
  } while (
    num1 < 0 ||
    num2 < 0 ||
    !Number.isInteger(num1) ||
    !Number.isInteger(num2)
  );

  correctShape.value = target;
  correctShape.text = `${num1} ${operation} ${num2}`;

  return generatedShapes;
}

class Shape {
  constructor(x, y, text, value) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.value = value;
    this.size = 70;
    this.type = random(["circle", "rectangle"]);
    this.dx = random(-2, 2);
    this.dy = random(-2, 2);
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;

    // Rebondir sur les bords
    if (this.x - this.size / 2 < 0 || this.x + this.size / 2 > width) {
      this.dx *= -1;
    }
    if (this.y - this.size / 2 < 0 || this.y + this.size / 2 > height) {
      this.dy *= -1;
    }
  }

  display() {
    fill(255);
    stroke(0);

    if (this.type === "circle") {
      ellipse(this.x, this.y, this.size);
    } else {
      rect(
        this.x - this.size / 2,
        this.y - this.size / 2,
        this.size,
        this.size
      );
    }

    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(this.text, this.x, this.y);
  }

  isClicked(mx, my) {
    if (this.type === "circle") {
      return dist(mx, my, this.x, this.y) < this.size / 2;
    } else {
      return (
        mx > this.x - this.size / 2 &&
        mx < this.x + this.size / 2 &&
        my > this.y - this.size / 2 &&
        my < this.y + this.size / 2
      );
    }
  }
}
