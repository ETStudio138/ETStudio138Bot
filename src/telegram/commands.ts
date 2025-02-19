// commands.ts
import { sendMenu, sendMessage, sendMainButton, checkSubscription, getBotName } from "./api";
import { BotEnv } from "../env";
import menuItemsData from './menuItems.json';


const get_start_content = `
*💼 Есть бизнес — сократите расходы!*  
*🛠️ Нет бизнеса — начните без расходов!*  
       
🎯 Решения для вашего бизнеса, которые помогут экономить и зарабатывать:  
✅ **Станьте партнёром программы "Свой в бизнесе | PRIVACY развитие идей и дела".** 💸  
💡 **Запустите сайт на CMS, готовый к рекламе (возможно бесплатно).**  
🔹 **Принимайте платежи без абонентской платы через Telegram и сайт:**  
☁️ Облачная касса от 1.5% за платеж. 
    📜 Всё по 54-ФЗ. 
    🏦 Без кассового аппарата на старте.  
🔹 **Облачная 1С без абонентской оплаты.**  
🔹 **Комплексные решения:** сайт + 1С + реклама от **5000 рублей** в месяц.  
🔹 **Возврат до 20 000 рублей на рекламу через Яндекс.Директ!**  
🔹 ✨ **И многое другое...**

💬 Хотите — берите, хотите — нет. Вы можете получить **500 рублей** за простое действие, а мы получим **1000 рублей** — это просто бонус.  
⎯⎯⎯⎯⎯⎯⎯⎯⎯  
*Начните ваш бизнес — создавайте товары и услуги.* Реклама и продажи понадобятся вашему бизнесу. Сделайте первый шаг, и заработок станет результатом вашего развития. 😉
`;

const get_first_content = `
🚀 Выведите свой бизнес онлайн всего за 3 дня!

1️⃣ Ваш бизнес в интернете за 3 дня!
Мы создаем сайт, интегрируем чат-бота и ИИ-ассистента, чтобы ваши клиенты могли заказывать с первого дня.

2️⃣ Быстрая настройка рекламы и мгновенная адаптация контента!
Реклама не приносит результатов? Просто обновите заголовки, тексты и офферы прямо в CMS — без помощи разработчиков!

3️⃣ Идеально для любого бизнеса!
E-commerce, услуги, инфобизнес, B2B — сайт легко адаптируется под любую нишу и позволяет тестировать офферы на лету.

4️⃣ ИИ анализирует аудиторию и увеличивает продажи!
Отслеживайте поведение клиентов и корректируйте стратегию в реальном времени — ИИ подскажет, что работает лучше всего.

5️⃣ Максимальная гибкость — управляйте контентом на ходу!
Обновляйте офферы, тексты и заголовки прямо во время рекламной кампании — адаптируйтесь под аудиторию и алгоритмы рекламных платформ одним кликом.

💬 Нужно? Берите. Не нужно? Не проблема. Вы получаете 500 рублей за простое действие, а мы — 1000 рублей в качестве бонуса.
⎯⎯⎯⎯⎯⎯⎯⎯⎯
Запускайте бизнес — создавайте продукты и услуги. Вам понадобятся реклама и продажи. Сделайте первый шаг, и доход будет расти вместе с вами. 😉

🛒 [**Купить сейчас**](https://ox1c.ru/init-payment/yandex-direct-seo) — нажмите здесь, чтобы оплатить и запустить свой бизнес!
 `;


// Creating a callbackTexts object for quick access to texts
const callbackTexts = menuItemsData.menuItems.reduce(
  (acc: { [key: string]: { response_text: string; parse_mode?: "Markdown" | "HTML" | null } }, item) => {
    //@ts-ignore
    acc[item.callback_data] = { response_text: item.response_text, parse_mode: item.parse_mode || null };
    return acc;
  },
  {}
);

// Creating menu from JSON data
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

// User message handler
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

        // Subscription check
        const isSubscribed = await checkSubscription(chatId, BOT_TOKEN, CHANNEL_CHAT_ID);
        if (!isSubscribed) {
            await sendMessage(
                chatId,
                `❌ To use the bot, subscribe to the channel: ${LINK_SUBSCRIBED_CHANNEL}\n\nYour bot: ${botName}`,
                BOT_TOKEN
            );
            // Show 'Refresh' button at start
            const buttons = [
                [{ text: '🔄 Refresh', callback_data: 'update' }],
            ];

            await sendMenu(chatId, buttons, BOT_TOKEN);
            return new Response("User not subscribed");
        }

        // Handling button clicks
        if (callbackData === 'get_first_content') {
            // Show menu with buttons from JSON
            await sendMessage(
                chatId,
                `Hello! I am the bot 👉 **${formattedBotName}**.  
                ${get_first_content}
                `,
                BOT_TOKEN, "Markdown"
            ); 
        }
        if (callbackData === 'main_menu') {
            // Show menu with buttons from JSON
            await sendMenu(chatId, menuContent, BOT_TOKEN);
        } else if (callbackTexts[callbackData]) {
            // If it's a command from JSON
            const { response_text, parse_mode } = callbackTexts[callbackData];
            //@ts-ignore
            await sendMessage(chatId, response_text, BOT_TOKEN, parse_mode || null); // Use parse_mode from JSON
            // Show 'Main Menu' button after sending text
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (callbackData === 'help') {
            await sendMessage(chatId, "Help:\n/start - start\n/help - help", BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (callbackData === 'update') {
            await sendMessage(chatId, 'Data updated!', BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        } else {
            await sendMessage(chatId, 'Unknown command.', BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        }
    } else if (message) {
        const chatId = message.chat.id;

        if (message.text === '/start') {
            // Subscription check at start
            const isSubscribed = await checkSubscription(chatId, BOT_TOKEN, CHANNEL_CHAT_ID);

            await sendMessage(
                chatId,
                `Hello! I am the bot 👉 ${formattedBotName}.
                ${get_start_content}
               `,
                BOT_TOKEN, "Markdown"
            ); 
            
            if (!isSubscribed) {
                await sendMessage(
                    chatId,
                    `❌ To use the bot, subscribe to the channel: ${LINK_SUBSCRIBED_CHANNEL}`,
                    BOT_TOKEN
                );
                // Show 'Refresh' button at start
                const buttons = [
                    [{ text: '🔄 Refresh', callback_data: 'update' }],
                ];

                await sendMenu(chatId, buttons, BOT_TOKEN);
                
                return new Response('User not subscribed');
            }

            // Show only 'Main Menu' button upon successful subscription
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (message.text === '/help') {
            // Handling /help command
            await sendMessage(chatId, "Help:\n/start - start\n/help - help", BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (message.text === '/get_first_content') {
            // Проверка подписки
            const isSubscribed = await checkSubscription(chatId, BOT_TOKEN, CHANNEL_CHAT_ID);
            if (!isSubscribed) {
                await sendMessage(
                    chatId,
                    `❌ To use the bot, subscribe to the channel: ${LINK_SUBSCRIBED_CHANNEL}`,
                    BOT_TOKEN
                );
                // Показываем кнопку "Обновить" в случае, если пользователь не подписан
                const buttons = [
                    [{ text: '🔄 Refresh', callback_data: 'update' }],
                ];
                await sendMenu(chatId, buttons, BOT_TOKEN);
                return new Response('User not subscribed');
            }
        
            // Отправляем первое содержимое, если подписка есть
            await sendMessage(
                chatId,
                `Hello! I am the bot 👉 **${formattedBotName}**.  
                ${get_first_content}
                `,
                BOT_TOKEN, "Markdown"
            ); 
        
            // Показываем основное меню после отправки контента
            await sendMainButton(chatId, BOT_TOKEN);
        }        
        
        else {
            // Handling unknown commands
            await sendMessage(chatId, "❓ Unknown command. Help:\n/start - start\n/help - help", BOT_TOKEN);
        }
    }

    return new Response('OK');
};
