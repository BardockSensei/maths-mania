let canvas;
let aClouds = [];
let currOperation, goodResult;
let lives = 5;
let level = 1;
let score = 0;
let alea = 0.6;

let player = {
  x: -50,
  y: -50,
  img: null,
};

let isDragging = false;
let pauseButton;

let isPaused = false;
let replayButton;

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

function preload() {
  player.img = loadImage("assets/player.png");
}

function setup() {
  canvas = createCanvas(windowWidth * 0.95, windowHeight * 0.6);
  canvas.parent("canvas_div");

  noStroke();
  angleMode(DEGREES);
  frameRate(60);

  pauseButton = createButton("Pause");
  pauseButton.size(200, 60);
  pauseButton.position(20, height + 90);
  pauseButton.style("font-size", "16px");
  pauseButton.style("background-color", "#ff4444");
  pauseButton.style("color", "white");
  pauseButton.style("border", "none");
  pauseButton.style("border-radius", "5px");
  pauseButton.style("cursor", "pointer");
  pauseButton.elt.id = "pauseButton";

  pauseButton.mousePressed(togglePause);

  pauseButton.mouseOver(() => pauseButton.style("background-color", "#cc0000"));
  pauseButton.mouseOut(() => pauseButton.style("background-color", "#ff4444"));
  pauseButton.mousePressed(togglePause);

  startGame();
}

function startGame() {
  level = 1;
  score = 0;
  aClouds = [];
  player.x = width / 6 - player.img.width / 2;
  player.y = height / 2 - player.img.height / 2;
  generateOperation();
}

function draw() {
  drawSky(); // Dessin du ciel avec dégradé

  if (isPaused) {
    return;
  }

  if (isDragging) {
    player.x = mouseX - player.img.width / 4; // Ajustement pour centrer l'image
    player.y = mouseY - player.img.height / 4;
  }

  image(
    player.img,
    player.x,
    player.y,
    player.img.width / 2,
    player.img.height / 2
  );

  // Affichage de l'opération courante et du score
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(currOperation, width / 2, height - 30);
  text(`Score: ${score}`, width / 2, 30);

  // Génération des nuages toutes les secondes
  if (frameCount % 120 === 0) generateCloud();

  // Barre de vie du joueur
  let lifeBarWidth = 150;
  let lifeBarHeight = 20;
  let lifeBarX = 20;
  let lifeBarY = 20;

  stroke(0);
  noFill();
  rect(lifeBarX, lifeBarY, lifeBarWidth, lifeBarHeight);

  noStroke();
  fill(255, 0, 0);
  let lifeWidth = map(lives, 0, 5, 0, lifeBarWidth);
  rect(lifeBarX, lifeBarY, lifeWidth, lifeBarHeight);

  if (lives <= 0) {
    endGame();
    noLoop();
  }

  // Défilement des nuages
  for (let i = aClouds.length - 1; i >= 0; i--) {
    let lCloud = aClouds[i];
    lCloud.x += lCloud.speed;

    // Dessin du nuage
    fill(255);
    ellipse(lCloud.x, lCloud.y, lCloud.sizeX, lCloud.sizeY);
    ellipse(lCloud.x + lCloud.sizeX / 2, lCloud.y, lCloud.sizeX, lCloud.sizeY);
    ellipse(
      lCloud.x + lCloud.sizeX / 4,
      lCloud.y - lCloud.sizeY / 2,
      lCloud.sizeX,
      lCloud.sizeY
    );

    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(
      lCloud.result,
      lCloud.x + lCloud.sizeX / 4,
      lCloud.y - lCloud.sizeY / 4
    );

    if (checkCollision(lCloud, player)) {
      if (lCloud.result === goodResult) {
        score++;

        if (score % 15 === 0) level++;

        generateOperation();
      } else {
        lives--;
      }

      aClouds.splice(i, 1); // Supprime le nuage après la collision
      continue;
    }

    // Supprime les nuages sortis de l'écran
    if (lCloud.x < -60 || lCloud.x > width + 60) {
      aClouds.splice(i, 1);
    }
  }
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

function generateOperation() {
  let lNums = [];
  let lOperations;

  if (level === 1) {
    lNums = [floor(random(1, 10)), floor(random(1, 10))];
    lOperations = ["+", "-", "*"];
  } else if (level === 2) {
    lNums = [floor(random(1, 100)), floor(random(1, 100))];
    lOperations = ["+", "-", "*"];
  } else {
    lNums = [floor(random(1, 1000)), floor(random(1, 1000))];
    if (level >= 4) {
      lNums = [floor(random(10, 100)), floor(random(2, 10))];
      lOperations = ["+", "-", "*"];
    } else {
      lOperations = ["+", "-"];
    }
  }

  let lOpSelected = random(lOperations);

  switch (lOpSelected) {
    case "+":
      goodResult = lNums[0] + lNums[1];
      break;
    case "-":
      if (lNums[0] < lNums[1]) [lNums[0], lNums[1]] = [lNums[1], lNums[0]];
      goodResult = lNums[0] - lNums[1];
      break;
    case "*":
      goodResult = lNums[0] * lNums[1];
      lOpSelected = "x";
      break;
  }

  currOperation = `${lNums[0]} ${lOpSelected} ${lNums[1]}`;
}

function checkCollision(cloud, player) {
  let playerWidth = player.img.width / 2;
  let playerHeight = player.img.height / 2;

  let cloudWidth = cloud.sizeX;
  let cloudHeight = cloud.sizeY;

  return !(
    (
      player.x > cloud.x + cloudWidth || // Trop à droite
      player.x + playerWidth < cloud.x || // Trop à gauche
      player.y > cloud.y + cloudHeight || // Trop en bas
      player.y + playerHeight < cloud.y
    ) // Trop en haut
  );
}

function generateCloud() {
  if (level >= 4) {
    alea = 0.5;
  }

  let isCorrect = random() < alea; // alea de 60% pour avoir la bonne réponse

  let resultValue;
  if (isCorrect) {
    resultValue = goodResult;
  } else {
    do {
      resultValue = goodResult + floor(random(0, 11));
    } while (resultValue === goodResult);
  }

  aClouds.push({
    x: width + 50,
    y: random(60, height - 60),
    sizeX: 80,
    sizeY: 50,
    speed: random(2, 5) * (this.x < 0 ? 1 : -1),
    result: resultValue,
  });
}

function mousePressed() {
  let buttonX = width - 100;
  let buttonY = 20;
  let buttonSize = 60;

  // Vérifier si le clic est sur le bouton pause
  if (
    mouseX > buttonX &&
    mouseX < buttonX + buttonSize &&
    mouseY > buttonY &&
    mouseY < buttonY + buttonSize
  ) {
    isPaused = !isPaused; // Basculer l'état de pause
    return; // Ne pas activer d'autres interactions
  }

  // Vérifier si le joueur clique sur le personnage
  if (
    mouseX > player.x &&
    mouseX < player.x + player.img.width / 2 &&
    mouseY > player.y &&
    mouseY < player.y + player.img.height / 2
  ) {
    isDragging = true;
  }
}

function mouseReleased() {
  isDragging = false;
}

function endGame() {
  fill(255, 0, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2);
  showReplayButton();
}

function showReplayButton() {
  // Si le bouton existe déjà, ne pas le recréer
  if (replayButton) return;

  replayButton = createButton("Rejouer");
  replayButton.size(200, 60);
  replayButton.position(width / 2 - 100, height / 2 + 50); // Centré sous le message "Game Over"
  replayButton.style("font-size", "20px");
  replayButton.style("background-color", "#4CAF50");
  replayButton.style("color", "white");
  replayButton.style("border", "none");
  replayButton.style("border-radius", "5px");
  replayButton.style("cursor", "pointer");
  replayButton.elt.id = "replayButton";

  // Ajouter un effet de survol (optionnel)
  replayButton.mouseOver(() =>
    replayButton.style("background-color", "#45a049")
  );
  replayButton.mouseOut(() =>
    replayButton.style("background-color", "#4CAF50")
  );

  // Relancer la partie lorsque le bouton est cliqué
  replayButton.mousePressed(() => {
    replayButton.remove(); // Supprimer le bouton une fois cliqué
    replayButton = null;
    resetGame(); // Réinitialiser et redémarrer la partie
  });
}

function resetGame() {
  lives = 5;
  score = 0;
  level = 1;
  aClouds = [];
  isPaused = false;
  loop();
  startGame();
}
