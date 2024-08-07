/*
  Бот-сервер для Youtube-downloader

v1.0.0-020824

  TODO:
    * Отправлять ошибку если видео не найдено. Пример для теста: https://www.youtube.com/watch?v=ehZcWE
    * Ограничивать количество попыток скачать видео
    * Ограничивать количество попыток закачать видео на хостинг
    * Уведомлять пользователя об ошибках

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


// config
const ablyKey = 'IBK3WA.bMRjog:UwNFpacs1Pu98g_yXdowJNWLrF2NEAXbZzHKghS8_cw';
const TELEGRAM_BOT_TOKEN = '497682600:AAEvCZCHXlRDM-lS3QHm571FID6d5_r3gsw'
// TODO: сделать получение ключа с сервера (для не френдзоны)

// init
import Ably from 'ably';
import TeleBot from "telebot";
import SimplDB from 'simpl.db';
import { v4 as uuidv4 } from 'uuid';

const ably = new Ably.Realtime(ablyKey)
const channel = ably.channels.get("get-started")
const myUUID = uuidv4();

// start
const db = new SimplDB();
// БД пользователей
const Users = db.createCollection('users');
// БД заданий
const Tasks = db.createCollection('tasks');

ably.connection.once("connected", () => {
  console.log("SERVER: Connected to Ably!")
})

const bot = new TeleBot({
  token: TELEGRAM_BOT_TOKEN,
})

bot.on(/.*youtube.com\/.*/, (message) => {
  const myUUID = uuidv4();
  const today = new Date();

  console.log('[0] Human request', message.text)
  Tasks.create({
    id: myUUID,
    tgId: message.from.id,
    url: message.text,
    addedAt: today,
    complitedAt: ''
  })

  channel.publish("first", `{"url":"${message.text}", "id":"${myUUID}"}`)
});

// bot.on('text', async (message) => {
//   console.log('human is here', message)
// })

bot.on(['/start', '/hello'], async (message) => {
  const userData = Users.get(user => user.tgId === message.from.id); // { name: 'Peter', age: 20 }

  const today = new Date();

  if (!userData) { // новый пользователь
    Users.create({
      tgId: message.from.id,
      firstName: message.from.first_name,
      lastName: message.from.last_name,
      userName: message.from.user_name,
      registeredAt: today,
      lastAccessAt: today
    });

  } else { //уже зареганый
    Users.update(
      user => user.tgId === message.from.id,
      target => target.lastAccessAt = today
    );
  }
})

channel.subscribe("server", (message) => { // server - имя этого исполнителя
  console.log("Message received: " + message.data)
  const data = JSON.parse(message.data) // TODO try/catch
  const today = new Date();

  const task = Tasks.get(task => task.id === data.id);
  Tasks.update(
    task => task.complitedAt = today,
    target => target.id = data.id
  )

  console.log(task, task.tgId)
  bot.sendMessage(task.tgId, 'Задание выполнено! Можете скачать по адресу: https://triton.foundation/' + task.id + '.mp4');
  // 284293876 - @rominsky
  // 6605158418 Roman Milovsky

});

bot.start()

