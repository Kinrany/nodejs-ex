//  OpenShift sample Node application
const express = require('express'),
  app = express(),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  gitLastCommit = require('git-last-commit');

Object.assign = require('object-assign');

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
  mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
  mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
    mongoPassword = process.env[mongoServiceName + '_PASSWORD']
  mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;

  }
}

mongoURL = mongoURL || "mongodb://localhost:27017/local";

var db = null,
  dbDetails = new Object();

var initDb = function (callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function (err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (request, response) {
  response.render('index2.html');
});

app.get('/pagecount', function (req, res) {
  withDB(function err() {
    res.send('{ pageCount: -1 }');
  }, function callback(db) {
    db.collection('counts').count(function (err, count) {
      res.send('{ pageCount: ' + count + '}');
    });
  })
});

app.get('/lab1', function (request, response) {
  response.render('lab1.html');
});

app.get('/lab2', function (request, response) {
  response.render('lab2.html');
});

app.post('/lab2/submitForm', function (request, response) {
  console.log("JSON: " + JSON.stringify(request.body));

  try {
    status = saveFormSubmission(request.body, (status) => {
      console.log("Responding with status " + status);
      response.sendStatus(status);
    });
  }
  catch (e) {
    console.log("Failed to parse submission: " + e);
    response.sendStatus(500);
  }
});

app.get('/lab2/getResults', function (request, response) {
  withDB(function err() {
    response.sendStatus(500);
  }, function success(db) {
    getFormSubmissionStats(function (error) {
      response.status(500).send(error);
    },
      function (stats) {
        let data = { answers: {} };

        stats.forEach(value => {
          switch (value._id) {
            case 'count':
              data.count = value.value;
              return;
            case 'date':
              data.firstDate = new Date(value.value.first);
              data.lastDate = new Date(value.value.last);
              return;
            default:
              let answerId = value._id.replace("answer_", "");
              data.answers[answerId] = value.value;
          }
        });

        response.status(200).json(data);
      });
  });
});

app.get('/index2', function (request, response) {
  response.render('index2.html');
});

app.get('/help', serveDefaultHelpPage);

app.get('/version', function (request, response) {
  gitLastCommit.getLastCommit(function (err, commit) {
    response.status(200).json({ version: commit.shortHash });
  })
})

// error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function (err) {
  console.log('Error connecting to Mongo. Message:\n' + err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;

function serveDefaultHelpPage(request, response) {
  withDB(function err() {
    response.render('help.html', { pageCountMessage: null });
  }, function callback(db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ ip: request.ip, date: Date.now() });
    col.count(function (err, count) {
      response.render('help.html', { pageCountMessage: count, dbInfo: dbDetails });
    });
  });
}

function saveFormSubmission(submission, resultCallback) {
  const data = {};

  try {
    let { name: sName, answers: sAnswers } = submission;

    if (typeof (sName) !== "string" || sName.trim() === "") {
      console.log("Name: " + sName);
      throw "invalid name";
    }

    const { questions } = require('./public/lab2/questions.json');

    data.name = sName.trim();
    data.answers = [];
    data.date = Date.now();

    for (let i = 0; i < questions.length; ++i) {
      let question = questions[i];
      let sAnswer = +sAnswers[i];

      if (!(0 <= sAnswer && sAnswer < question.answers.length)) {
        throw "invalid answer";
      }

      data.answers[i] = sAnswer;
    }
  }
  catch (e) {
    console.log("Invalid submission: " + e);
    return 400;
  }

  withDB(function err() {
    console.log("No database");
    resultCallback(500);
  }, function callback(db) {
    let collection = db.collection('form_submissions');
    try {
      collection.insertOne(data);
      resultCallback(200);
    }
    catch (e) {
      console.log("Error: " + e);
      resultCallback(500);
    }
  });
}

function withDB(err, callback) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function (err) { });
  }
  if (db) {
    return callback(db);
  }
  else {
    console.log("No database.");
    return err();
  }
}

function getFormSubmissionStats(error, callback) {
  let collection = db.collection('form_submissions');

  let map = function () {
    emit("count", 1);

    let date = this.date;
    emit("date", { first: date, last: date });

    for (let i = 0; i < this.answers.length; ++i) {
      let answer = {};
      answer[this.answers[i]] = 1;
      emit("answer_" + i, answer);
    }

  };

  let reduce = function (key, values) {

    switch (key) {
      case "count":
        let count = 0;
        for (let i = 0; i < values.length; ++i) {
          count += values[i];
        }
        return count;

      case "date":
        let date = {
          first: Date.now(),
          last: new Date(-8640000000000000)
        };
        values.forEach(value => {
          if (value.first < date.first) {
            date.first = value.first;
          }
          if (date.last < value.last) {
            date.last = value.last;
          }
        });
        return date;

      default:
        let reduced = {};
        values.forEach(value => {
          for (let option_id in value) {
            if (!(option_id in reduced)) {
              reduced[option_id] = 0;
            }
            reduced[option_id] += value[option_id];
          }
        });
        return reduced;
    }

  }

  map = () => emit("hello", 0);
  reduce = (key, values) => 0;

  let requestResult = collection.mapReduce(map, reduce, { out: { inline: 1 } });
  requestResult.then(callback).catch(error);
}
