const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const ejs = require('ejs');
const qrcode = require('qrcode');
const { authenticator } = require('otplib');

// const cors = require('cors');
// app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/static', express.static('static'));

app.engine('html', ejs.__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.get('/', function (req, res) {
  res.render('login');
});

const cases = {
  admin: {
    pwd: '123456',
    secret: ''
  },
  user: {
    pwd: '111111',
    secret: ''
  }
};

function genQrCode(userName, secret) {
  return new Promise(function (resolve, reject) {
    const otpauth = authenticator.keyuri(userName, 'demo', secret);
    qrcode.toDataURL(otpauth, (err, imageUrl) => {
      if (err) {
        console.log('Error with QR');
        reject(err);
      }
      // data:image/png;base64
      resolve(imageUrl);
    });
  });
}

app.post('/login', async function (req, res) {
  const obj = {
    result: '',
    tfaImg: ''
  };
  const account = req.body.account;
  const password = req.body.password;

  if (cases[account]?.pwd === password) {
    obj.result = 'ok';

    if (cases[account]?.secret === '') {
      const _secret = authenticator.generateSecret();
      cases[account].secret = _secret;
      obj.tfaImg = await genQrCode(account, _secret);
    }
  } else {
    obj.result = 'fail';
  }

  res.json(obj);
});


app.post('/tfaValidate', async function (req, res) {
  const obj = {
    result: ''
  };
  const _account = req.body.account;
  const _token = req.body.token;

  const secret = cases[_account].secret;

  const isValid = authenticator.check(_token, secret);
  obj.result = (isValid) ? 'ok' : 'fail';

  res.json(obj);
});

/* 範例
app.post('/', function (req, res) {
  console.dir(req.body);
  res.send('OK');
});


app.get('/who/:name?', function (req, res) {
  var name = req.params.name;
  res.send(name + ' 在這邊歐');
});

app.get('/who/:name?/:title?', function (req, res) {
  var name = req.params.name;
  var title = req.params.title;
  res.send('<p>名稱: ' + name + '<br>值稱: ' + title + '</p>');
});

app.get('*', function (req, res) {
  res.send('沒有東西噢');
});
*/

var port = 88;
var server = app.listen(port, function () {
  console.log('Server Listening on port ' + port);
});   