import { handleTelegramMessage } from "./telegram/commands";
import { getEnv } from "./env";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "POST") {
      try {
        const body: any = await request.json();
        return await handleTelegramMessage(body, getEnv(env));
      } catch (err) {
        console.error("Ошибка обработки запроса:", err);
        return new Response("Ошибка сервера", { status: 500 });
      }
    }

    if (request.method === "GET") {
      return new Response("HELLO", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    return new Response("Метод не поддерживается", { status: 405 });
  },
};
