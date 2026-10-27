export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Método no permitido." },
        { status: 405 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "El JSON recibido es inválido." },
        { status: 400 }
      );
    }

    const messages = body?.messages;

    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      !messages.every(
        (message) =>
          ["user", "assistant"].includes(message?.role) &&
          typeof message.text === "string" &&
          message.text.trim().length > 0
      ) ||
      messages.at(-1).role !== "user"
    ) {
      return Response.json(
        { error: "Historial de conversación inválido." },
        { status: 400 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const lastMessage = messages.at(-1);

    if (lastMessage.text.toLowerCase() === "/error") {
      return Response.json(
        { error: "Falló la conexión simulada." },
        { status: 503 }
      );
    }

    return Response.json({
      reply: `Afirmativo. Recibí ${messages.length} mensajes del historial.`
    });
  }
};