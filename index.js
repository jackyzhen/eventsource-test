const express = require('express');
const EventEmitter = require('events');
const EventSourceEmitter = require('event-source-emitter');
const bodyParser = require('body-parser')

const app = express();

app.use(express.static('./client'));
app.use(bodyParser.json())

const eventEmitter = new EventEmitter();

let emitters = [];
let userNum = 0;

app.get('/events', (req, res) => {

  const emitter = new EventSourceEmitter(req, res, {keepAlive: true});

  emitter.emit('update', { msg: 'new user joined!', userNum: ++userNum } );

  emitter.onClose = () => {
    emitter.emit('update', { msg: 'user left!', userNum: --userNum })
  };

  emitters.push(emitter);
});

app.post('/msg', (req, res) => {
  const { name, msg } = req.body;
  emitters.forEach(emitter => {
    emitter.emit('update', { name, msg, time: Date.now() });
  });
  res.end();
});

app.listen(3000, () => {
  console.info('Server listening on localhost:3000');
});