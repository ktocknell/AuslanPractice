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

  document.getElementById("student-info").innerText =
    `${studentName} (${studentClass})`;

  /* ===============================
     VOCAB DATA
  =============================== */
  const vocab = {
    alphabet: ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],
    animals: ["cat","dog","cow","horse","bird","fish","duck","pig","sheep","lion","bear","frog","snake","mouse","rabbit","tiger","goat","ant","bee","owl"],
    colours: ["red","blue","green","yellow","orange","purple","pink","brown","black","white"],
    food: ["apple","banana","blueberry","cherry","grape","orange","pear","pineapple","raspberry","strawberry","watermelon","fruit","carrot","corn","cucumber","lettuce","mushroom","onion","peas","beans","potato","pumpkin","tomato","vegetables"],
    weather: ["sunny","windy","weather","cyclone","earthquake","hot","cold","snowy","rain","lightning","rainbow","cloudy"],
    school: ["book","pen","pencil","bag","desk","chair","teacher","student","school","bus","bell","ruler","paper","glue","scissors","computer","ipad","board","class","library"],
    clothes: ["hat","shirt","short","thong","bathers","skirt","jumper","pants","shoes","socks","jacket","umbrella","scarf","beanie","gloves","clothes","dress"],
    feelings: ["happy","calm","relaxed","focused","confident","loved","supported","thankful","proud","sad","disappointed","withdrawn","bored","sick","tired","exhausted","lonely","shy","silly","excited","shock","embarassed","annoyed","nervous","stressed","worried","confused","angry","furious","ashamed","teased","jealous","unsafe","scared","pain","frustrated"],
    numbers: ["one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen"]
  };

  /* ===============================
     GAME SETUP
  =============================== */
  const words = shuffle([...vocab[topic]]).slice(0, 15);

  let tiles = [];
  words.forEach(word => {
    tiles.push({ word, type: "sign" });
    tiles.push({ word, type: "image" });
  });
  tiles = shuffle(tiles);

  const board = document.getElementById("game-board");

  let firstCard = null;
  let lockBoard = false;
  let matches = 0;
  let attempts = 0;

  const startTime = Date.now();

  /* ===============================
     FEEDBACK IMAGE
  =============================== */
  const feedback = document.createElement("img");
  feedback.id = "feedbackImage";
  feedback.style.position = "fixed";
  feedback.style.top = "50%";
  feedback.style.left = "50%";
  feedback.style.transform = "translate(-50%, -50%)";
  feedback.style.width = "220px";
  feedback.style.display = "none";
  feedback.style.zIndex = "9999";
  document.body.appendChild(feedback);

  function showFeedback(correct) {
    feedback.src = correct ? "assets/correct.png" : "assets/wrong.png";
    feedback.style.display = "block";

    setTimeout(() => {
      feedback.style.display = "none";
    }, 2000);
  }

  /* ===============================
     TIMER
  =============================== */
  const timerEl = document.getElementById("timer");
  setInterval(() => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    timerEl.innerText = `Time: ${seconds}s`;
  }, 1000);

  /* ===============================
     BUILD BOARD
  =============================== */
  tiles.forEach(tile => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.word = tile.word;
    card.dataset.type = tile.type;

    // Front image
    const front = document.createElement("img");
    front.className = "card-front";
    front.src = tile.type === "sign"
      ? `assets/${topic}/signs/${tile.word}.png`
      : `assets/${topic}/images/${tile.word}.png`;

    // Back image (topic sign)
    const back = document.createElement("img");
    back.className = "card-back";
    back.src = `assets/${topic}.png`;

    card.appendChild(front);
    card.appendChild(back);
    board.appendChild(card);

    card.addEventListener("click", () => flipCard(card));
  });

  /* ===============================
     FLIP LOGIC
  =============================== */
  function flipCard(card) {
    if (lockBoard) return;
    if (card.classList.contains("flipped")) return;
    if (card.classList.contains("matched")) return;

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
      showFeedback(true);

      setTimeout(() => {
        firstCard.classList.add("matched");
        card.classList.add("matched");
        firstCard = null;
        lockBoard = false;
        matches++;

        if (matches === 15) endGame();
      }, 2000);

    } else {
      showFeedback(false);

      setTimeout(() => {
        firstCard.classList.remove("flipped");
        card.classList.remove("flipped");
        firstCard = null;
        lockBoard = false;
      }, 2000);
    }
  }

  /* ===============================
     END GAME
  =============================== */
  function endGame() {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const percent = Math.round((15 / attempts) * 100);

    document.getElementById("time-result").innerText =
      `Time: ${timeTaken} seconds`;

    document.getElementById("score-result").innerText =
      `Accuracy: ${percent}%`;

    document.getElementById("end-modal").style.display = "flex";

    submitResults(timeTaken, percent);
  }

  /* ===============================
     GOOGLE FORM
  =============================== */
  function submitResults(time, percent) {
    const form = document.createElement("form");
    form.action = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse";
    form.method = "POST";
    form.target = "hidden_iframe";

    const data = {
      "entry.1111111111": studentName,
      "entry.2222222222": studentClass,
      "entry.3333333333": topic,
      "entry.4444444444": time,
      "entry.5555555555": percent
    };

    for (const key in data) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  }

  window.goToHub = () => window.location.href = "hub.html";

  /* ===============================
     UTILS
  =============================== */
  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

});
