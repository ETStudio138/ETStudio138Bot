// commands.ts
import { sendMenu, sendMessage, sendPhoto, sendMainButton, checkSubscription, getBotName } from "./api";
import { BotEnv } from "../env";
import menuItemsData from './menuItems.json';

const get_start_content = `...`;
const get_first_content = `...`;
const get_buh_content = `...`;

const callbackTexts = menuItemsData.menuItems.reduce(
  (acc: { [key: string]: { response_text: string; parse_mode?: "Markdown" | "HTML" | null } }, item) => {
    acc[item.callback_data] = { response_text: item.response_text, parse_mode: item.parse_mode || null };
    return acc;
  },
  {}
);

const menuContent = menuItemsData.menuItems.map(item => [{
    text: item.text,
    callback_data: item.callback_data
}]);

interface TelegramMessage {
    message?: {
        chat: { id: number };
        text: string;
        message_id: number;
        from: { id: number };
    };
    callback_query?: {
        data: string;
        from: { id: number };
    };
}

export const handleTelegramMessage = async (
    body: TelegramMessage,
    env: BotEnv
): Promise<Response> => {
    const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
    const CHANNEL_CHAT_ID = env.CHANNEL_CHAT_ID;
    const LINK_SUBSCRIBED_CHANNEL = env.LINK_SUBSCRIBED_CHANNEL;
    const message = body.message;
    const callbackQuery = body.callback_query;

    let botName = "...";
    try {
        botName = await getBotName(BOT_TOKEN) || " ";
    } catch (error) {
        console.error("Error fetching bot name:", error);
    }
    const formattedBotName = botName.replace('_', '\\_');

    if (callbackQuery) {
        const chatId = callbackQuery.from.id;
        const callbackData = callbackQuery.data;

        const isSubscribed = await checkSubscription(chatId, BOT_TOKEN, CHANNEL_CHAT_ID);
        if (!isSubscribed) {
            await sendMessage(chatId, `❌ To use the bot, subscribe to the channel: ${LINK_SUBSCRIBED_CHANNEL}`, BOT_TOKEN);
            await sendMenu(chatId, [[{ text: '🔄 Refresh', callback_data: 'update' }]], BOT_TOKEN);
            return new Response("User not subscribed");
        }

        if (callbackData === 'get_buh_content') {
            const imageUrl = 'https://access-etstudio-bot.pages.dev/buh_final_tax_reporting.png';
            await sendPhoto(chatId, imageUrl, get_buh_content, BOT_TOKEN, "Markdown");
        } else if (callbackData === 'get_first_content') {
            await sendMessage(chatId, `Hello! I am the bot 👉 **${formattedBotName}**. ${get_first_content}`, BOT_TOKEN, "Markdown");
        } else if (callbackData === 'main_menu') {
            await sendMenu(chatId, menuContent, BOT_TOKEN);
        } else if (callbackTexts[callbackData]) {
            const { response_text, parse_mode } = callbackTexts[callbackData];
            await sendMessage(chatId, response_text, BOT_TOKEN, parse_mode || null);
            await sendMainButton(chatId, BOT_TOKEN);
        } else {
            await sendMessage(chatId, 'Unknown command.', BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        }
    } else if (message) {
        const chatId = message.chat.id;
        const isSubscribed = await checkSubscription(chatId, BOT_TOKEN, CHANNEL_CHAT_ID);

        if (message.text === '/start') {
            await sendMessage(chatId, `Hello! I am the bot 👉 ${formattedBotName}. ${get_start_content}`, BOT_TOKEN, "Markdown");
            if (!isSubscribed) {
                await sendMessage(chatId, `❌ To use the bot, subscribe to the channel: ${LINK_SUBSCRIBED_CHANNEL}`, BOT_TOKEN);
                await sendMenu(chatId, [[{ text: '🔄 Refresh', callback_data: 'update' }]], BOT_TOKEN);
                return new Response('User not subscribed');
            }
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (message.text === '/help') {
            await sendMessage(chatId, "Help:\n/start - start\n/help - помощь\n/help_buh - помощь по нулевой отчетности", BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (message.text === '/get_first_content') {
            if (!isSubscribed) {
                await sendMessage(chatId, `❌ To use the bot, subscribe to the channel: ${LINK_SUBSCRIBED_CHANNEL}`, BOT_TOKEN);
                await sendMenu(chatId, [[{ text: '🔄 Refresh', callback_data: 'update' }]], BOT_TOKEN);
                return new Response('User not subscribed');
            }
            await sendMessage(chatId, `Hello! I am the bot 👉 **${formattedBotName}**. ${get_first_content}`, BOT_TOKEN, "Markdown");
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (message.text === '/help_buh') {
            await sendMessage(chatId, get_buh_content, BOT_TOKEN, "Markdown");
            await sendMainButton(chatId, BOT_TOKEN);
        } else {
            await sendMessage(chatId, "❓ Unknown command. Help:\n/start - start\n/help - help", BOT_TOKEN);
        }
    }

    return new Response('OK');
};
