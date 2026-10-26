const chatState = {
  messages: []
};

export function renderChat() {
  return `
    <section class="view chat-view">
      <h1>Terminal T-800</h1>

      <div class="chat-layout">
        <div
          id="chat-messages"
          class="chat-messages"
          role="log"
          aria-label="Conversación"
          aria-live="polite"
        ></div>

        <form id="chat-form" class="chat-form">
          <input
            id="chat-input"
            type="text"
            placeholder="Escribí tu mensaje..."
            autocomplete="off"
            maxlength="500"
            required
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </section>
  `;
}

export function initChat(container) {
  const form = container.querySelector("#chat-form");
  const input = container.querySelector("#chat-input");
  const messagesContainer = container.querySelector("#chat-messages");

  function renderMessages() {
    messagesContainer.replaceChildren();

    for (const message of chatState.messages) {
      const bubble = document.createElement("div");

      bubble.classList.add("message", `message--${message.role}`);
      bubble.textContent = message.text;

      messagesContainer.append(bubble);
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = input.value.trim();

    if (!text) {
      input.value = "";
      input.focus();
      input.reportValidity();
      return;
    }G

    chatState.messages.push({
      id: crypto.randomUUID(),
      role: "user",
      text: text
    });

    // Respuesta simulada
    chatState.messages.push({
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Afirmativo. Mensaje recibido."
    });

    input.value = "";
    renderMessages();
    input.focus();
  });

  renderMessages();
}