const express = require('express');
const mongoose = require('mongoose');
const app = express();
const { billRouter } = require('./routes/bill');
const { CONNECT_LINK } = require('./utils/connectLink');

mongoose.connect(CONNECT_LINK, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on(
  'error',
  console.error.bind(console, 'Помилка підключення до бази даних:'),
);

db.once('open', function () {
  console.log('Підключено до бази даних');
});

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.use('/bill', billRouter);

app.listen(3000, () => {
  console.log('Сервер запущено на порті 3000');
});
