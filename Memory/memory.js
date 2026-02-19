document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     STUDENT + TOPIC
  =============================== */

  const studentName = localStorage.getItem("studentName") || "Unknown";
  const studentClass = localStorage.getItem("studentClass") || "Unknown";
  const topic = localStorage.getItem("memoryTopic");

  if (!topic) {
    window.location.href = "hub.html";
    return;
  }

  const studentInfo = document.getElementById("student-info");
  studentInfo.innerText = `${studentName} (${studentClass}) – ${topic.toUpperCase()}`;

  const finishBtn = document.getElementById("finish-btn");
  const continueBtn = document.getElementById("continue-btn");
  const againBtn = document.getElementById("again-btn");
  const stopBtn = document.getElementById("stop-btn");

  /* ===============================
     VOCAB
  =============================== */

  const vocab = {
    alphabet: ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],
    animals: ["cat","dog","cow","horse","bird","fish","duck","pig","sheep","lion","bear","frog","snake","mouse","rabbit","tiger","goat","ant","bee","owl"],
    colours: ["red","blue","green","yellow","orange","purple","pink","brown","black","white"],
    food: ["apple","banana","blueberry","cherry","grape","orange","pear","pineapple","raspberry","strawberry","watermelon","fruit","carrot","corn","cucumber","lettuce","mushroom","onion","peas","beans","potato","pumpkin","tomato","vegetables"],
    transport: ["car","bus","train","plane","boat","bike","truck","helicopter","scooter","tram"],
    clothing: ["hat","shirt","short","thong","bathers","skirt","jumper","pants","shoes","socks","jacket","umbrella","scarf","beanie","gloves","clothes","dress"],
    emotions: ["happy","calm","relaxed","focused","confident","loved","supported","thankful","proud","sad","disappointed","withdrawn","bored","sick","tired","exhausted","lonely","shy","silly","excited","shock","embarassed","annoyed","nervous","stressed","worried","confused","angry","furious","ashamed","teased","jealous","unsafe","scared","pain","frustrated"],
    numbers: ["one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen"]
  };

  const board = document.getElementById("game-board");
  const difficultyModal = document.getElementById("difficulty-modal");
  const timerEl = document.getElementById("timer");

  const difficultySettings = {
    easy: { columns: 4, rows: 3 },
    middle: { columns: 5, rows: 4 },
    hard: { columns: 6, rows: 4 }
  };

  let firstCard = null;
  let lockBoard = false;
  let matches = 0;
  let attempts = 0;
  let totalMatches = 0;
  let timerInterval;
  let startTime;

  /* ===============================
     BEST TIME
  =============================== */

  const bestKey = `memoryBest_${studentName}_${topic}`;
  const bestTime = localStorage.getItem(bestKey);

  if (bestTime) {
    alert(`Best Time for ${topic}: ${bestTime}s`);
  }


  /* ===============================
     DIFFICULTY SELECTION
  =============================== */

  document.querySelectorAll(".difficulty-options img")
    .forEach(img => {
      img.addEventListener("click", () => {
        difficultyModal.style.display = "none";
        startGame(img.dataset.level);
      });
    });


  function startGame(level) {
    elapsedTime = 0;
    isPaused = false;
    currentLevel = level;


    const { columns, rows } = difficultySettings[level];
    totalMatches = (columns * rows) / 2;

    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    matches = 0;
    attempts = 0;
    firstCard = null;
    lockBoard = false;

    const words = shuffle([...vocab[topic]]).slice(0, totalMatches);

    let tiles = [];
    words.forEach(word => {
      tiles.push({ word, type: "sign" });
      tiles.push({ word, type: "image" });
    });

    tiles = shuffle(tiles);

    tiles.forEach(tile => buildCard(tile));

    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
  }


  function buildCard(tile) {

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.word = tile.word;
    card.dataset.type = tile.type;

    const inner = document.createElement("div");
    inner.className = "card-inner";

    const front = document.createElement("img");
    front.className = "card-front";

    if (tile.type === "sign") {
      front.src = `../MatchingGame/assets/${topic}/signs/sign-${tile.word}.png`;
    } else {
      front.src = `../MatchingGame/assets/${topic}/clipart/${tile.word}.png`;
    }

    const back = document.createElement("img");
    back.className = "card-back";
    back.src = `assets/topics/${topic}.png`;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    board.appendChild(card);

    card.addEventListener("click", () => flipCard(card));
  }


  /* ===============================
     FLIP LOGIC
  =============================== */

  function flipCard(card) {

    if (lockBoard || card.classList.contains("flipped") || card.classList.contains("matched"))
      return;

    card.classList.add("flipped");

    if (!firstCard) {
      firstCard = card;
      return;
    }

    attempts++;
    lockBoard = true;

    const isMatch =
      firstCard.dataset.word === card.dataset.word &&
      firstCard.dataset.type !== card.dataset.type;

    if (isMatch) {
      setTimeout(() => {
        firstCard.classList.add("matched");
        card.classList.add("matched");
        resetTurn();
        matches++;
        if (matches === totalMatches) endGame();
      }, 800);
    } else {
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        card.classList.remove("flipped");
        resetTurn();
      }, 1000);
    }
  }

  function resetTurn() {
    firstCard = null;
    lockBoard = false;
  }


  /* ===============================
     TIMER
  =============================== */

  function updateTimer() {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    timerEl.innerText = `Time: ${seconds}s`;
  }


  /* ===============================
     END GAME
  =============================== */

  function endGame() {

    clearInterval(timerInterval);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const percent = Math.round((totalMatches / attempts) * 100);

    document.getElementById("time-result").innerText = `Time: ${timeTaken}s`;
    document.getElementById("score-result").innerText = `Accuracy: ${percent}%`;

    // Save best time
    if (!bestTime || timeTaken < bestTime) {
      localStorage.setItem(bestKey, timeTaken);
    }

    // Add clap gif
    const clap = document.createElement("img");
    clap.src = "assets/auslan-clap.gif";
    clap.style.width = "150px";
    clap.style.marginTop = "15px";
    document.getElementById("end-modal-content").appendChild(clap);

    document.getElementById("end-modal").style.display = "flex";
  }


  /* ===============================
     BUTTONS
  =============================== */

 /* ===============================
   PAUSE / STOP SYSTEM
================================ */

let isPaused = false;

function pauseGame() {
  clearInterval(timerInterval);
  lockBoard = true;
  isPaused = true;
}

function resumeGame() {
  if (!isPaused) return;
  startTime = Date.now() - (elapsedTime * 1000);
  timerInterval = setInterval(updateTimer, 1000);
  lockBoard = false;
  isPaused = false;
}

let elapsedTime = 0;

function updateTimer() {
  elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  timerEl.innerText = `Time: ${elapsedTime}s`;
}

/* ===============================
   STOP BUTTON
================================ */

if (stopBtn) stopBtn.addEventListener("click", () => {

  pauseGame();

  const percent = attempts === 0
    ? 0
    : Math.round((matches / attempts) * 100);

  document.getElementById("time-result").innerText =
    `Time: ${elapsedTime}s`;

  document.getElementById("score-result").innerText =
    `Accuracy: ${percent}%`;

  document.getElementById("end-modal").style.display = "flex";

});


/* ===============================
   CONTINUE
================================ */

if (continueBtn) continueBtn.addEventListener("click", () => {
  document.getElementById("end-modal").style.display = "none";
  resumeGame();
});


/* ===============================
   AGAIN (Restart Same Topic)
================================ */

if (againBtn) againBtn.addEventListener("click", () => {
  document.getElementById("end-modal").style.display = "none";
  startGame(currentLevel);
});


/* ===============================
   FINISH (Back to Hub)
================================ */

if (finishBtn) finishBtn.addEventListener("click", () => {
  window.location.href = "hub.html";
});
