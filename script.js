const starterWords = [
  { id: 1, word: "articulate", partOfSpeech: "adjective", meaning: "Able to express ideas clearly and effectively.", example: "She gave an articulate explanation of the proposal.", tag: "communication", status: "learning" },
  { id: 2, word: "nuance", partOfSpeech: "noun", meaning: "A small but meaningful difference in expression or meaning.", example: "The word has a nuance that is hard to translate directly.", tag: "writing", status: "new" },
  { id: 3, word: "substantiate", partOfSpeech: "verb", meaning: "To support a claim with evidence.", example: "Please substantiate the recommendation with data.", tag: "work", status: "known" }
];

const storageKey = "wordroom-vocabulary";
let words = JSON.parse(localStorage.getItem(storageKey) || "null") || starterWords;
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
