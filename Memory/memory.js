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
  if (studentInfo) {
    studentInfo.innerText = `${studentName} (${studentClass})`;
  }

  /* ===============================
     VOCAB DATA (MATCHES HUB TOPICS)
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

if (!vocab[topic]) {
  alert("Topic not found: " + topic);
  window.location.href = "hub.html";
  return;
}

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
    setTimeout(() => feedback.style.display = "none", 2000);
  }

  /* ===============================
     TIMER
  =============================== */
  const timerEl = document.getElementById("timer");
  setInterval(() => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    if (timerEl) timerEl.innerText = `Time: ${seconds}s`;
  }, 1000);

  /* ===============================
     BUILD BOARD
  =============================== */
  tiles.forEach(tile => {

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.word = tile.word;
    card.dataset.type = tile.type;

    // FRONT IMAGE
    const front = document.createElement("img");
    front.className = "card-front";

    if (tile.type === "sign") {
      front.src = `../MatchingGame/assets/${topic}/signs/sign-${tile.word}.png`;
    } else {
      front.src = `../MatchingGame/assets/${topic}/clipart/${tile.word}.png`;
    }

    // BACK IMAGE (topic image from topics folder)
    const back = document.createElement("img");
    back.className = "card-back";
    back.src = `assets/topics/${topic}.png`;

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

    document.getElementById("time-result").innerText = `Time: ${timeTaken} seconds`;
    document.getElementById("score-result").innerText = `Accuracy: ${percent}%`;
    document.getElementById("end-modal").style.display = "flex";
  }

  window.goToHub = () => window.location.href = "hub.html";

  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

});
