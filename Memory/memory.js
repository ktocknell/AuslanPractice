document.addEventListener("DOMContentLoaded", () => {

  // ==== STUDENT INFO ====
  const studentName = localStorage.getItem("studentName") || "Unknown";
  const studentClass = localStorage.getItem("studentClass") || "Unknown";
  document.getElementById("student-info").innerText =
    `${studentName} (${studentClass})`;

  // ==== TOPIC DATA ====
  const topic = localStorage.getItem("memoryTopic");
  if (!topic) location.href = "hub.html";

  const vocab = {
    animals: ["cat","dog","cow","horse","bird","fish","duck","pig","sheep","lion","bear","frog","snake","mouse","rabbit","tiger","goat","ant","bee","owl"],
    food: ["apple","banana","bread","milk","cheese","rice","egg","cake","pizza","carrot","corn","fish","meat","soup","orange","pear","icecream","water","chicken","chips"],
    school: ["book","pen","pencil","bag","desk","chair","teacher","student","school","bus","bell","ruler","paper","glue","scissors","computer","ipad","board","class","library"]
  };

  const selected = shuffle([...vocab[topic]]).slice(0, 15);

  // ==== CREATE TILE SET ====
  let tiles = [];
  selected.forEach(word => {
    tiles.push({ word, type: "sign" });
    tiles.push({ word, type: "image" });
  });

  tiles = shuffle(tiles);

  // ==== GAME STATE ====
  const board = document.getElementById("game-board");
  let firstTile = null;
  let lockBoard = false;
  let matches = 0;
  let attempts = 0;

  const startTime = Date.now();

  // ==== TIMER ====
  setInterval(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").innerText = `Time: ${secs}s`;
  }, 1000);

  // ==== BUILD BOARD ====
  tiles.forEach((tile, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.word = tile.word;
    card.dataset.type = tile.type;

    const img = document.createElement("img");
    img.src = tile.type === "sign"
      ? `assets/${topic}/signs/${tile.word}.png`
      : `assets/${topic}/images/${tile.word}.png`;

    card.appendChild(img);
    board.appendChild(card);

    card.addEventListener("click", () => flipCard(card));
  });

  // ==== FLIP LOGIC ====
  function flipCard(card) {
    if (lockBoard || card.classList.contains("matched") || card === firstTile) return;

    card.classList.add("flipped");

    if (!firstTile) {
      firstTile = card;
      return;
    }

    attempts++;
    const secondTile = card;

    const isMatch =
      firstTile.dataset.word === secondTile.dataset.word &&
      firstTile.dataset.type !== secondTile.dataset.type;

    if (isMatch) {
      firstTile.classList.add("matched");
      secondTile.classList.add("matched");
      firstTile = null;
      matches++;

      if (matches === 15) endGame();
    } else {
      lockBoard = true;
      setTimeout(() => {
        firstTile.classList.remove("flipped");
        secondTile.classList.remove("flipped");
        firstTile = null;
        lockBoard = false;
      }, 900);
    }
  }

  // ==== END GAME ====
  function endGame() {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const percent = Math.round((15 / attempts) * 100);

    document.getElementById("time-result").innerText =
      `Time: ${timeTaken} seconds`;

    document.getElementById("score-result").innerText =
      `Accuracy: ${percent}%`;

    document.getElementById("end-modal").style.display = "flex";

    submitToGoogleForm(timeTaken, percent);
  }

  // ==== GOOGLE FORM ====
  function submitToGoogleForm(time, percent) {
    const form = document.createElement("form");
    form.action = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse";
    form.method = "POST";
    form.target = "hidden_iframe";

    const fields = {
      "entry.1111111111": studentName,
      "entry.2222222222": studentClass,
      "entry.3333333333": topic,
      "entry.4444444444": time,
      "entry.5555555555": percent
    };

    for (const key in fields) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  }

  window.goToHub = () => location.href = "hub.html";

  // ==== UTILS ====
  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

});
