const express = require('express')
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
const TelegramBot = require('node-telegram-bot-api');
const token = '940524194:AAEyD1AUytEBH7qqP6Q6gM-6pXPYOo_PTY8';
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
var fs = require('fs');
var db
var dbUsers = require('./db');
//var jsParsed=require('./logic.json');

//var debug=require('debug');



passport.use(new Strategy(
  function (username, password, cb) {
    dbUsers.users.findByUsername(username, function (err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  dbUsers.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});



MongoClient.connect('mongodb://serg:1234@ds125288.mlab.com:25288/armlist', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(process.env.PORT || 3000, () => {
    console.log('listening on 3000')
  })
})




var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};




app.set('view engine', 'ejs')
app.set('views', __dirname + '/views');
app.use(allowCrossDomain);
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(bodyParser.json())
app.use(express.static('public'))



app.use(passport.initialize());
app.use(passport.session());

//BOT
const bot = new TelegramBot(token, { polling: true });
bot.onText(/\/start/, (msg, match) => {


  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  const id = msg.chat.id;
  fs.appendFile('chatids.txt', id + '-', function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, 'Бот почав роботу, будь-які +/- зміни вище певної суми будуть відправлені. Бот на стадії розробки.Відправивши звичайне повідомлення отримаєте дані по залах' + 'ВАШЕ ІД->>>>>>>>:' + id);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const id = msg.chat.id
  // send a message to the chat acknowledging receipt of their message
  var content;
  /* db.collection('quotes').find().toArray((err, result) => {
     if (err) return console.log(err)
     for(var i=0; i<result.length; i++){
     bot.sendMessage(chatId, result[i].name+' '+result[i].quote+'  Картки: '+result[i].cardsCash);
     }
   });*/

  // debug('__________________________mess________');

  bot.sendMessage(chatId, 'v.2.0 ok ВАШЕ ІД->>>>>>>>:' + id);

});
//BOT END

var timerId = setInterval(function () {
  //bot.sendMessage(626376656, 'Timer');
  //bot.sendMessage(481503296, 'Login');
  // var dani=[];
  db.collection('quotes').find().toArray((err, result) => {
    if (err) return console.log(err)
    // bot.sendMessage(626376656, 'STARTED');

    for (var i = 0; i < result.length; i++) {
      //bot.sendMessage(626376656, 'q');

      if (result[i].quote.indexOf("+") !== -1) {
        var know = parseInt(result[i].quote.substr(1));
        var last = parseInt(result[i].lt);
        var z = 30000;
        var t = 10000;
        if ((result[i].name == 'Живова 7') || (result[i].name == 'Обнова')) {
          z = 45000;
        }
        //bot.sendMessage(626376656, 'know:'+know+'last:'+last);

        if ((know > z) && (last < 1)) {
          db.collection('quotes')
            .findOneAndUpdate({ name: result[i].name }, {
              $set: {
                lt: know,

              }

            });
          bot.sendMessage(626376656, 'Зверніть увагу: ' + result[i].name + ':+' + know + ' ' + ' На картках:' + result[i].cardsCash);
          bot.sendMessage(464115643, 'Зверніть увагу: ' + result[i].name + ':+' + know + ' ' + ' На картках:' + result[i].cardsCash);
          bot.sendMessage(854071253, 'Зверніть увагу: ' + result[i].name + ':+' + know + ' ' + ' На картках:' + result[i].cardsCash);
          bot.sendMessage(690655842, 'Зверніть увагу: ' + result[i].name + ':+' + know + ' ' + ' На картках:' + result[i].cardsCash);

        }


        else if ((know > z) && ((know - last) >= t)) {
          db.collection('quotes')
            .findOneAndUpdate({ name: result[i].name }, {
              $set: {
                lt: know,

              }

            });
          bot.sendMessage(626376656, 'Зверніть увагу: ' + result[i].name + ':+' + know + ' ' + ' На картках:' + result[i].cardsCash);
          bot.sendMessage(464115643, 'Зверніть увагу: ' + result[i].name + ':+' + know + ' ' + ' На картках:' + result[i].cardsCash);
          bot.sendMessage(481503296, 'Зверніть увагу: ' + result[i].name + ':+' + know + ' ' + ' На картках:' + result[i].cardsCash);
          bot.sendMessage(690655842, 'Зверніть увагу: ' + result[i].name + ':+' + know + ' ' + ' На картках:' + result[i].cardsCash);
          bot.sendMessage(854071253, 'Зверніть увагу: ' + result[i].name + ':+' + know + ' ' + ' На картках:' + result[i].cardsCash);
        }

        if ((know < z) && (last > 2)) {
          db.collection('quotes')
            .findOneAndUpdate({ name: result[i].name }, {
              $set: {
                lt: 0,

              }

            });
        }


      }

      if (result[i].quote.indexOf("-") !== -1) {
        var know = parseInt(result[i].quote.substr(1));
        var last = parseInt(result[i].quote.lt);
        var z = 30000;
        var t = 10000;
        if ((result[i].name == 'Живова 7') || (result[i].name == 'Обнова')) {
          z = 45000;
        }

        if ((know > z) && (last < 2)) {
          db.collection('quotes')
            .findOneAndUpdate({ name: result[i].name }, {
              $set: {
                lt: know,

              }

            });
          bot.sendMessage(626376656, 'Зверніть увагу: ' + result[i].name + ':-' + know + ' ' - ' На картках:' + result[i].cardsCash);
          bot.sendMessage(464115643, 'Зверніть увагу: ' + result[i].name + ':-' + know + ' ' - ' На картках:' + result[i].cardsCash);
          bot.sendMessage(481503296, 'Зверніть увагу: ' + result[i].name + ':-' + know + ' ' - ' На картках:' + result[i].cardsCash);
          bot.sendMessage(690655842, 'Зверніть увагу: ' + result[i].name + ':-' + know + ' ' - ' На картках:' + result[i].cardsCash);
          bot.sendMessage(854071253, 'Зверніть увагу: ' + result[i].name + ':+' + know + ' ' + ' На картках:' + result[i].cardsCash);
        }


        else if ((know > z) && ((know - last) >= t)) {
          db.collection('quotes')
            .findOneAndUpdate({ name: result[i].name }, {
              $set: {
                lt: know,

              }

            });
          bot.sendMessage(626376656, 'Зверніть увагу: ' + result[i].name + ':-' + know + ' ' - ' На картках:' + result[i].cardsCash);
          bot.sendMessage(464115643, 'Зверніть увагу: ' + result[i].name + ':-' + know + ' ' - ' На картках:' + result[i].cardsCash);
          bot.sendMessage(481503296, 'Зверніть увагу: ' + result[i].name + ':-' + know + ' ' - ' На картках:' + result[i].cardsCash);
          bot.sendMessage(690655842, 'Зверніть увагу: ' + result[i].name + ':-' + know + ' ' - ' На картках:' + result[i].cardsCash);
          bot.sendMessage(854071253, 'Зверніть увагу: ' + result[i].name + ':+' + know + ' ' + ' На картках:' + result[i].cardsCash);
        }

        if ((know < z) && (last > z)) {
          db.collection('quotes')
            .findOneAndUpdate({ name: result[i].name }, {
              $set: {
                lt: 0,

              }

            });
        }



      }




    }

  })

}, 60000);











app.get('/',
  function (req, res) {
    res.redirect('/login');
  });

app.get('/login',
  function (req, res) {

    res.render('login');
  });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/dashboard');
  });

app.get('/logout',
  function (req, res) {
    req.logout();
    res.redirect('/login');
  });


app.get('/dashboard', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {

  db.collection('quotes').find().toArray((err, result) => {
    if (err) return console.log(err)
    for (var i = 0; i < result.length; i++) {
      db.collection('quotes')
        .findOneAndUpdate({ name: req.body.name }, {
          $set: {

            lt: 2,




          }
        })
    }
    res.render('index.ejs', { quotes: result })
  })
})
app.get('/chort', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
  db.collection('sport').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('chort.ejs', { quotes: result })
  })
})

app.post('/quotes', (req, res) => {
  db.collection('quotes').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})
app.post('/sport-quotes', (req, res) => {
  db.collection('sport').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

app.put('/quotes', (req, res) => {
  db.collection('quotes')
    .findOneAndUpdate({ name: req.body.name }, {
      $set: {

        quote: req.body.quote,
        time: req.body.time,
        cardsCash: req.body.cardsCash,


      }
    }, {
        sort: { _id: -1 },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
})
app.delete('/sport-quotes', (req, res) => {
  db.collection('sport').findOneAndDelete({ name: req.body.name }, (err, result) => {
    if (err) return res.send(500, err)
    res.send('A darth vadar quote got deleted')
  })
})
app.put('/sport-quotes', (req, res) => {
  db.collection('sport')
    .findOneAndUpdate({ name: req.body.name }, {
      $set: {

        quote: req.body.quote,
        credit: req.body.credit,



      }
    }, {
        sort: { _id: -1 },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
})
app.put('/quotes/zmina', (req, res) => {
  db.collection('quotes')
    .findOneAndUpdate({ name: req.body.name }, {
      $set: {


        zmina: req.body.zmina

      }
    }, {
        sort: { _id: -1 },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
})

app.delete('/quotes', (req, res) => {
  db.collection('quotes').findOneAndDelete({ name: req.body.name }, (err, result) => {
    if (err) return res.send(500, err)
    res.send('A darth vadar quote got deleted')
  })
})
