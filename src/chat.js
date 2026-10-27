import { getChatReply } from "./services/chatApi.js";

const chatState = {
  messages: [],
  status: "idle",
  error: null
};

let chatElements = null;

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
          <button id="send-button" type="submit">
            Enviar
          </button>
        </form>

        <p id="chat-error" class="chat-error"
           role="alert"></p>
      </div>
    </section>
  `;
}

function renderMessages() {
  const { messagesContainer } = chatElements;

  messagesContainer.replaceChildren();

  for (const message of chatState.messages) {
    const bubble = document.createElement("div");

    bubble.classList.add(
      "message",
      `message--${message.role}`
    );

    bubble.textContent = message.text;
    messagesContainer.append(bubble);
  }

  if (chatState.status === "loading") {
    const indicator = document.createElement("div");

    indicator.classList.add("typing-indicator");
    indicator.textContent = "T-800 está escribiendo...";

    messagesContainer.append(indicator);
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderChatUI() {
  if (!chatElements?.messagesContainer.isConnected) return;

  const { input, button, errorContainer } = chatElements;
  const isLoading = chatState.status === "loading";

  renderMessages();

  input.disabled = isLoading;
  button.disabled = isLoading;
  button.textContent = isLoading ? "Enviando..." : "Enviar";

  errorContainer.textContent = chatState.error ?? "";

  errorContainer.classList.toggle(
    "chat-error--visible",
    Boolean(chatState.error)
  );
}

async function handleSubmit(event) {
  event.preventDefault();

  if (chatState.status === "loading") return;

  const { input } = chatElements;
  const text = input.value.trim();

  if (!text) {
    input.value = "";
    input.focus();
    input.reportValidity();
    return;
  }

  const userMessage = {
    id: crypto.randomUUID(),
    role: "user",
    text,
    failed: false
  };

  chatState.messages.push(userMessage);
  chatState.status = "loading";
  chatState.error = null;

  input.value = "";
  renderChatUI();

  try {
    const history = chatState.messages
      .filter((message) => !message.failed)
      .slice(-8)
      .map(({ role, text }) => ({ role, text }));

    const reply = await getChatReply(history);

    chatState.messages.push({
      id: crypto.randomUUID(),
      role: "assistant",
      text: reply
    });

    chatState.status = "idle";
  } catch (error) {
    userMessage.failed = true;
    chatState.status = "error";
    chatState.error =
      error instanceof Error
        ? error.message
        : "Ocurrió un error inesperado.";
  } finally {
    renderChatUI();

    if (chatElements?.input.isConnected) {
      chatElements.input.focus();
    }
  }
}

export function initChat(container) {
  chatElements = {
    form: container.querySelector("#chat-form"),
    input: container.querySelector("#chat-input"),
    button: container.querySelector("#send-button"),
    messagesContainer: container.querySelector("#chat-messages"),
    errorContainer: container.querySelector("#chat-error")
  };

  chatElements.form.addEventListener("submit", handleSubmit);

  renderChatUI();
}