const template = document.createElement("template");
template.innerHTML = `
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css"
    integrity="sha512-NhSC1YmyruXifcj/KFRWoC561YpHpc5Jtzgvbuzx5VozKpWvQ+4nXhPdFgmx8xqexRcpAglTj9sIBWINXa8x5w=="
    crossorigin="anonymous"
  />
  <link rel="stylesheet" href="./src/Components/Popup.css" />

  <section class="popupContainer">
    <main class="popup__content">
      <header class="popup__header">
        <h2 class="popup__title"></h2>
        <span class="popup__closeButton">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
          </svg>
        </span>
      </header>
      <div class="separator"></div>
      <div class="popup__description">
        <ul data-fetch="scores"></ul>
      </div>
    </main>
  </section>
`;

export class Popup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.removeDuplicates();
    this.setupCloseButton();
    this.renderTitle();
    this.renderScores();
  }

  removeDuplicates() {
    const existingPopups = document.querySelectorAll("snk-popup");
    if (existingPopups.length > 1) {
      for (let i = 0; i < existingPopups.length - 1; i++) {
        existingPopups[i].remove();
      }
    }
  }

  setupCloseButton() {
    const closeBtn = this.SELECT(".popup__closeButton");
    closeBtn?.addEventListener("click", () => {
      this.remove();
    });
  }

  get scores() {
    try {
      const raw = localStorage.getItem("scores");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  SELECT(selector) {
    return this.shadowRoot.querySelector(selector);
  }

  renderTitle() {
    const title = this.getAttribute("title") || "Popup";
    const titleElement = this.SELECT(".popup__title");
    titleElement.textContent = title;
  }

  renderScores() {
    const ul = this.SELECT('[data-fetch="scores"]');
    if (!ul) return;

    ul.innerHTML = this.scores.length
      ? this.scores.map((score) => `<li>${score}</li>`).join("")
      : `<li class="no-data">No scores yet.</li>`;
  }
}
