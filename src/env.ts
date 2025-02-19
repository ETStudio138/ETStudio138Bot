export interface BotEnv {
    TELEGRAM_BOT_TOKEN: string;
    LINK_SUBSCRIBED_CHANNEL: string;
    CHANNEL_CHAT_ID: string;
  }
  
  export const getEnv = (env: Env): BotEnv => ({
    TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
    LINK_SUBSCRIBED_CHANNEL: env.LINK_SUBSCRIBED_CHANNEL,
    CHANNEL_CHAT_ID: env.CHANNEL_CHAT_ID
  });
  