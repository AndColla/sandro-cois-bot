import * as TelegramBot from 'node-telegram-bot-api';
import client from '../../redisClient';

interface User {
    count: number;
    name: string;
}

const getUsers = async (chatId: Number): Promise<User[]> => {
    let users: User[] = [];
    const keys = await client.scan(
        0,
        'COUNT',
        1000,
        'MATCH',
        `chat:${chatId}:user:*`
    );
    for (let key of keys[1]) {
        let user = await client.hmget(key, 'name', 'stats');
        users.push({ name: user[0], count: +user[1] });
    }
    return users;
};

const prettyPrint = (users: User[]): string => {
    let message = `STATS DELL'ERA SANDRO COIS\n\n`;
    for (let u in users) {
        let emojiMedal = '';
        if (u === '0') {
            emojiMedal = '🥇';
        }
        if (u === '1') {
            emojiMedal = '🥈';
        }
        if (u === '2') {
            emojiMedal = '🥉';
        }
        message += `${emojiMedal} ${users[u].name} - ${users[u].count}\n`;
    }
    return message;
};

export default (bot: TelegramBot) => async (
    msg: TelegramBot.Message
): Promise<void> => {
    const users = await getUsers(msg.chat.id);
    const sortedUsers = users.sort((a, b) => b.count - a.count);
    const message = prettyPrint(sortedUsers);
    bot.sendMessage(msg.chat.id, message);
};
