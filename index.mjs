const TELEGRAM_BOT_TOKEN = '5331314045:AAGteqffCXtxyNEM-l-6hFKieVzsKn3Lh_Y'

import TeleBot from "telebot";

// init
const bot = new TeleBot({
    token: TELEGRAM_BOT_TOKEN,
})

const getResultRegex = /{"id":"(.+)", "status":"done"}/gm;
const urlRegex = /file\s+(.+?\.mp4)/;

// Это для общения с кожанным
bot.on(['/start', '/hello'], async (msg) => {
    let message = {};
    message.userID = msg.from.id;
    message.firstName = msg.from.first_name;
    message.lastName = msg.from.last_name;
    message.userName = msg.from.username; // ник
    message.messageDate = msg.date;
    message.messageText = msg.text;
    message.messageChat = msg.chat.id;

    const { users } = db.data;
    const userData =  users.find((users) => users.tgId === message.userID);
    const today = new Date();
    if (!userData) { // новый пользователь
        // await db.update(({ users }) => users.push({
        //     tgId: message.userID,
        //     firstName: message.firstName,
        //     lastName: message.lastName,
        //     userName: message.userName,
        //     registeredAt: today,
        //     lastAccessAt: today
        // }))
        // msg.reply.text('Welcome!')
    } else { //уже зареганый
        userData.lastAccessAt = today
        // db.update((userData) => {})
        // msg.reply.text('Again')
    }
})

// Это для общения с человеком
bot.on(/.*youtube.com\/.*/, (msg) => {
    // console.log(msg)
    console.log('human request')
    // messages.push(msg.text)
    // emitter.emit('new_link')
});

// Это для общения с исполнителем
bot.on(getResultRegex, (msg) => {
    console.log('bot responce')
    console.log(msg)
    // messages.push(msg.text)
    // emitter.emit('new_link')
});

bot.start()
// для теста
bot.sendMessage('-1002238341419',`{"url":"https://www.youtube.com/watch?v=pVXSLTGzNLw", "id":"1001"}"`) // первый параметр - чат куда слать уведомления
/*
    получить ссылку от человека
    присвоить uuid
    записать в БД:
        url
        uuid
        tgUserID
    отправить задачу
    при получение статуса
        отметить задачу в бд выполненной
        отправить заказчику ссылку
*/

