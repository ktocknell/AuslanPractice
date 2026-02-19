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
  studentInfo.innerText =
    `${studentName} (${studentClass}) – ${topic.toUpperCase()}`;

  /* ===============================
     ELEMENTS
  =============================== */

  const board = document.getElementById("game-board");
  const difficultyModal = document.getElementById("difficulty-modal");
  const endModal = document.getElementById("end-modal");
  const endContent = document.getElementById("end-modal-content");
  const timerEl = document.getElementById("timer");

  const finishBtn = document.getElementById("finish-btn");
  const continueBtn = document.getElementById("continue-btn");
  const againBtn = document.getElementById("again-btn");
  const stopBtn = document.getElementById("stop-btn");

  /* ===============================
     GAME STATE
  =============================== */

  let firstCard = null;
  let lockBoard = false;
  let matches = 0;
  let attempts = 0;
  let totalMatches = 0;

  let currentLevel = null;

  let timerInterval = null;
  let startTime = 0;
  let elapsedTime = 0;
  let isPaused = false;

  /* ===============================
     BEST TIME
  =============================== */

  const bestKey = `memoryBest_${studentName}_${topic}`;
  const bestDisplay = document.getElementById("best-time-display");

  function showBestTime() {
    const best = localStorage.getItem(bestKey);
    if (best && bestDisplay) {
      bestDisplay.innerText = `Best Time: ${best}s`;
    }
  }

  showBestTime();

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

  const difficultySettings = {
    easy: { columns: 4, rows: 3 },
    middle: { columns: 5, rows: 4 },
    hard: { columns: 6, rows: 4 }
  };

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

  /* ===============================
     START GAME
  =============================== */

  function startGame(level) {

    currentLevel = level;

    const { columns, rows } = difficultySettings[level];
    totalMatches = (columns * rows) / 2;

    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    matches = 0;
    attempts = 0;
    firstCard = null;
    lockBoard = false;
    isPaused = false;
    elapsedTime = 0;

    const words = shuffle([...vocab[topic]]).slice(0, totalMatches);

    let tiles = [];
    words.forEach(word => {
      tiles.push({ word, type: "sign" });
      tiles.push({ word, type: "image" });
    });

    shuffle(tiles).forEach(tile => buildCard(tile));

    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
  }

  /* ===============================
     BUILD CARD
  =============================== */

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
      }, 600);
    } else {
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        card.classList.remove("flipped");
        resetTurn();
      }, 900);
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
    elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerEl.innerText = `Time: ${elapsedTime}s`;
  }

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

  /* ===============================
     END GAME
  =============================== */

  function endGame() {

    clearInterval(timerInterval);

    const timeTaken = elapsedTime;

    const percent = attempts === 0
      ? 0
      : Math.round((matches / attempts) * 100);

    document.getElementById("time-result").innerText =
      `Time: ${timeTaken}s`;

    document.getElementById("score-result").innerText =
      `Accuracy: ${percent}%`;

    // Remove old clap
    const oldClap = endContent.querySelector(".clap-gif");
    if (oldClap) oldClap.remove();

    // Check record
    let previousBest = parseInt(localStorage.getItem(bestKey));
    let isNewRecord = false;

    if (!previousBest || timeTaken < previousBest) {
      localStorage.setItem(bestKey, timeTaken);
      isNewRecord = true;
    }

    if (isNewRecord) {
      const clap = document.createElement("img");
      clap.src = "assets/auslan-clap.gif";
      clap.classList.add("clap-gif");
      clap.style.width = "150px";
      clap.style.marginTop = "15px";
      endContent.appendChild(clap);
    }

    endModal.style.display = "flex";
  }

  /* ===============================
     BUTTONS
  =============================== */

  if (stopBtn) stopBtn.addEventListener("click", () => {
    pauseGame();
    endGame();
  });

  if (continueBtn) continueBtn.addEventListener("click", () => {
    endModal.style.display = "none";
    resumeGame();
  });

  if (againBtn) againBtn.addEventListener("click", () => {
    endModal.style.display = "none";
    startGame(currentLevel);
  });

  if (finishBtn) finishBtn.addEventListener("click", () => {
    window.location.href = "hub.html";
  });

  /* ===============================
     SHUFFLE
  =============================== */

  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

});
