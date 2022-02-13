import Dictionary from "./Dictionary.js";
import TargetWords from "./TargetWords.js";

const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");
const guessGrid = document.querySelector("[data-guess-grid]");
let targetWord = TargetWords[Math.floor(Math.random() * 12971)];
const change = document.querySelector(".change");
const reset = document.querySelector(".reset");
const definition = document.querySelector(".definition");
const letterArr = new Set();
console.log(targetWord);

change.addEventListener("click", function () {
  resetBoard();
  targetWord = TargetWords[Math.floor(Math.random() * 12971)];
  startInteraction();
  document.querySelector(".reset").style.display = "none";
  definition.style.display = "none";
  console.log(targetWord);
});
reset.addEventListener("click", function () {
  resetBoard();
  startInteraction();
  document.querySelector(".reset").style.display = "none";
});

const resetBoard = () => {
  letterArr.forEach((letter) => {
    const key = keyboard.querySelector(`[data-key="${letter}"i]`);
    key.classList = "key";
  });
  const tiles = document.getElementsByClassName("tile");
  for (let i = 0; i < 30; i++) {
    if (tiles[i].textContent) {
      tiles[i].textContent = "";
      tiles[i].removeAttribute("data-state");
      tiles[i].removeAttribute("data-letter");
    }
  }
  while (alertContainer.firstChild) {
    alertContainer.removeChild(alertContainer.firstChild);
  }
};

const startInteraction = () => {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);
};
startInteraction();

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);
    return;
  }

  if (e.target.matches("[data-enter]")) {
    submitGuess();
    return;
  }

  if (e.target.matches("[data-delete]")) {
    deleteKey();
    return;
  }
}

function handleKeyPress(e) {
  if (e.key === "Enter") {
    submitGuess();
    return;
  }

  if (e.key === "Backspace" || e.key === "Delete") {
    deleteKey();
    return;
  }

  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key);
    return;
  }
}

function pressKey(key) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORD_LENGTH) return;
  const nextTile = guessGrid.querySelector(":not([data-letter])");
  nextTile.dataset.letter = key.toLowerCase();
  nextTile.textContent = key;
  nextTile.dataset.state = "active";
}

function deleteKey() {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile == null) return;
  lastTile.textContent = "";
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert("Not enough letters");
    shakeTiles(activeTiles);
    return;
  }

  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, "");

  if (!Dictionary.includes(guess)) {
    showAlert("Not in word list");
    shakeTiles(activeTiles);
    return;
  }

  stopInteraction();
  activeTiles.forEach((...params) => flipTile(...params, guess));
}

function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  setTimeout(() => {
    tile.classList.add("flip");
  }, (index * FLIP_ANIMATION_DURATION) / 2);

  tile.addEventListener(
    "transitionend",
    () => {
      tile.classList.remove("flip");
      if (targetWord[index] === letter) {
        tile.dataset.state = "correct";
        key.classList.add("correct");
        letterArr.add(letter);
      } else if (targetWord.includes(letter)) {
        tile.dataset.state = "wrong-location";
        key.classList.add("wrong-location");
        letterArr.add(letter);
      } else {
        tile.dataset.state = "wrong";
        key.classList.add("wrong");
        letterArr.add(letter);
      }

      if (index === array.length - 1) {
        tile.addEventListener(
          "transitionend",
          () => {
            startInteraction();
            checkWinLose(guess, array);
          },
          { once: true }
        );
      }
    },
    { once: true }
  );
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert(message, duration = 1000) {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.classList.add("alert");
  alertContainer.prepend(alert);
  if (duration == null) return;

  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => {
      alert.remove();
    });
  }, duration);
}

function shakeTiles(tiles) {
  tiles.forEach((tile) => {
    tile.classList.add("shake");
    tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("shake");
      },
      { once: true }
    );
  });
}

function checkWinLose(guess, tiles) {
  if (guess === targetWord) {
    showAlert("You Win", 5000);
    danceTiles(tiles);
    stopInteraction();
    document.querySelector(".reset").style.display = "block";
    definition.style.display = "block";
    definition.textContent = "";
    definition.insertAdjacentHTML(
      "beforeend",
      `<div>see definition of <a href="https://www.thefreedictionary.com/${guess.toUpperCase()}" target="_blank">${guess}</a></div>`
    );
    return;
  }

  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
  if (remainingTiles.length === 0) {
    showAlert(targetWord.toUpperCase(), null);
    stopInteraction();
    document.querySelector(".reset").style.display = "block";
  }
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance");
      tile.addEventListener(
        "animationend",
        () => {
          tile.classList.remove("dance");
        },
        { once: true }
      );
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
}
