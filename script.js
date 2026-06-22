const starterWords = [
  { id: 1, word: "Electrical", partOfSpeech: "adjective", meaning: "Electricity / power supply system.", example: "Data centre electrical infrastructure.", tag: "data centre", status: "new" },
  { id: 2, word: "HVAC", partOfSpeech: "noun", meaning: "Heating, ventilation and air conditioning.", example: "HVAC is primarily responsible for heat dissipation in a data centre.", tag: "data centre", status: "new" },
  { id: 3, word: "Mission-Critical", partOfSpeech: "adjective", meaning: "Critical to operations; cannot be shut down.", example: "Mission-critical systems must remain available.", tag: "data centre", status: "new" },
  { id: 4, word: "Data Centre", partOfSpeech: "noun", meaning: "A data centre.", example: "Australian spelling. American English: Data Center.", tag: "data centre", status: "new" },
  { id: 5, word: "One-Line Diagram (SLD)", partOfSpeech: "noun", meaning: "Single-line diagram.", example: "One of the most important drawings in the electrical industry.", tag: "electrical", status: "new" },
  { id: 6, word: "UPS", partOfSpeech: "noun", meaning: "Uninterruptible power supply.", example: "Provides power immediately when there is an outage.", tag: "electrical", status: "new" },
  { id: 7, word: "Rectifier", partOfSpeech: "noun", meaning: "A device that converts alternating current to direct current.", example: "A rectifier charges the battery bank.", tag: "electrical", status: "new" },
  { id: 8, word: "Battery Bank", partOfSpeech: "noun", meaning: "A group of batteries used as backup power.", example: "The battery bank supplies backup power for the UPS.", tag: "electrical", status: "new" },
  { id: 9, word: "Switchgear", partOfSpeech: "noun", meaning: "Electrical control and protection equipment.", example: "The switchgear protects and controls the power system.", tag: "electrical", status: "new" },
  { id: 10, word: "PDU", partOfSpeech: "noun", meaning: "Power distribution unit.", example: "A PDU distributes power to server racks.", tag: "data centre", status: "new" }
];

const storageKey = "wordroom-vocabulary-v2";
const legacyStorageKey = "wordroom-vocabulary";
const savedWords = localStorage.getItem(storageKey);
let words = savedWords ? JSON.parse(savedWords) : starterWords;
if (!savedWords) localStorage.removeItem(legacyStorageKey);
let activeFilter = "all";
let cardIndex = 0;
let isRevealed = false;

const elements = {
  list: document.querySelector("#word-list"), empty: document.querySelector("#empty-state"), count: document.querySelector("#word-count"),
  search: document.querySelector("#search"), dialog: document.querySelector("#word-dialog"), form: document.querySelector("#word-form"),
  card: document.querySelector("#flashcard"), cardWord: document.querySelector("#card-word"), cardDetail: document.querySelector("#card-detail"),
  cardLabel: document.querySelector("#card-label"), cardHint: document.querySelector("#card-hint"), reviewCount: document.querySelector("#review-count")
};

function saveWords() { localStorage.setItem(storageKey, JSON.stringify(words)); }
function filteredWords() {
  const query = elements.search.value.trim().toLowerCase();
  return words.filter((entry) => (activeFilter === "all" || entry.status === activeFilter) && [entry.word, entry.meaning, entry.tag, entry.partOfSpeech].join(" ").toLowerCase().includes(query));
}
function renderWords() {
  const visibleWords = filteredWords();
  elements.list.innerHTML = "";
  const template = document.querySelector("#word-template");
  visibleWords.forEach((entry) => {
    const node = template.content.cloneNode(true);
    node.querySelector("h3").textContent = entry.word;
    node.querySelector(".part-of-speech").textContent = entry.partOfSpeech || "";
    node.querySelector(".meaning").textContent = entry.meaning;
    const example = node.querySelector(".example");
    example.textContent = entry.example ? `"${entry.example}"` : "";
    node.querySelector(".tag").textContent = entry.tag || "untagged";
    const status = node.querySelector(".status"); status.textContent = entry.status; status.dataset.status = entry.status;
    status.addEventListener("click", () => cycleStatus(entry.id));
    node.querySelector(".delete").addEventListener("click", () => deleteWord(entry.id));
    elements.list.appendChild(node);
  });
  elements.empty.hidden = visibleWords.length > 0;
  elements.count.textContent = words.length;
  renderCard();
}
function cycleStatus(id) {
  const states = ["new", "learning", "known"];
  const entry = words.find((word) => word.id === id);
  entry.status = states[(states.indexOf(entry.status) + 1) % states.length];
  saveWords(); renderWords();
}
function deleteWord(id) { words = words.filter((entry) => entry.id !== id); cardIndex = 0; saveWords(); renderWords(); }
function renderCard() {
  if (!words.length) {
    elements.cardWord.textContent = "Add a word to begin"; elements.cardDetail.textContent = "Your saved words will appear here for review.";
    elements.cardLabel.textContent = "WORD"; elements.cardHint.textContent = ""; elements.reviewCount.textContent = "0 / 0"; return;
  }
  cardIndex = (cardIndex + words.length) % words.length;
  const entry = words[cardIndex];
  elements.card.classList.toggle("is-revealed", isRevealed);
  elements.cardLabel.textContent = isRevealed ? `${entry.partOfSpeech || "word"} - ${entry.tag || "untagged"}` : "WORD";
  elements.cardWord.textContent = entry.word;
  elements.cardDetail.textContent = isRevealed ? `${entry.meaning}${entry.example ? ` "${entry.example}"` : ""}` : "";
  elements.cardHint.textContent = isRevealed ? "Tap to hide" : "Tap to reveal";
  elements.reviewCount.textContent = `${cardIndex + 1} / ${words.length}`;
}
document.querySelector("#open-add").addEventListener("click", () => elements.dialog.showModal());
document.querySelector("#close-add").addEventListener("click", () => elements.dialog.close());
elements.form.addEventListener("submit", (event) => {
  event.preventDefault(); const data = new FormData(elements.form);
  words.unshift({ id: Date.now(), word: data.get("word"), partOfSpeech: data.get("partOfSpeech"), meaning: data.get("meaning"), example: data.get("example"), tag: data.get("tag"), status: data.get("status") });
  cardIndex = 0; isRevealed = false; saveWords(); elements.form.reset(); elements.dialog.close(); renderWords();
});
elements.search.addEventListener("input", renderWords);
document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => { activeFilter = button.dataset.filter; document.querySelectorAll(".filter").forEach((item) => item.classList.toggle("is-active", item === button)); renderWords(); }));
elements.card.addEventListener("click", () => { if (words.length) { isRevealed = !isRevealed; renderCard(); } });
document.querySelector("#next-card").addEventListener("click", () => { if (words.length) { cardIndex++; isRevealed = false; renderCard(); } });
document.querySelector("#previous-card").addEventListener("click", () => { if (words.length) { cardIndex--; isRevealed = false; renderCard(); } });
document.querySelector("#mark-known").addEventListener("click", () => { if (words.length) { words[cardIndex].status = "known"; saveWords(); renderWords(); } });
document.querySelector("#theme-toggle").addEventListener("click", () => document.body.classList.toggle("dark"));
renderWords();
