let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let fs = require('fs');
let cors = require('cors');

let index = require('./routes/index');
let users = require('./routes/users');

let app = express();
let TVs = [];

const logFileName = path.join(__dirname, "debug.log");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());
app.use(favicon(path.join(__dirname, 'public', 'images', 'MPAT_logo.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

//////////////////////////////////////////////////////

function TV(ip, logLevel) {
    this.ip = ip;
    this.logLevel = logLevel;
    this.time = new Date().getTime();
}

TV.prototype.isOutdated = function () {
    // outdated if record is older than 1h;
    return (new Date().getTime() - this.time) > 3600000;
};

// ///////////////////////////////////////////////////
// debug URLs
// ///////////////////////////////////////////////////

app.get('/dumpData/', dumpData);
app.get('/dumpData', dumpData);

function dumpData(req, res) {
    let str = "<html><body>Debug information: " + new Date().getTime() + "<br/>";
    str += "TVs:"+TVs.length+"<br/><br/>";
    for (i = 0; i < TVs.length; i++) {
        str += "TV:" + TVs[i].ip + " " + TVs[i].logLevel + " " +
            (agents[i].isOutdated() ? " outdated" : "") + "<br/>";
    }
    res.send(str + "</body></html>");
}

app.get('/cleanUp', cleanUp);
app.get('/cleanUp/', cleanUp);

function cleanUp(req, res) {
    removeOutdated(TVs);
    res.send("db cleaned");
}

function removeOutdated(things) {
    var i = 0;
    while (i < things.length) {
        if (things[i].isOutdated()) {
            things.splice(i, 1);
        } else {
            i++;
        }
    }
}

app.get('/reset', reset);
app.get('/reset/', reset);

function reset(req, res) {
    TVs = [];
    res.send("db reset");
}

// ///////////////////////////////////////////////////
//  search URLs
// ///////////////////////////////////////////////////


app.get('/log', function (req, res, next) {
    // log the access
    var date = new Date();
    var dat = date.getHours();
    var d = (dat.length < 2 ? " " : "")+dat+":";
    dat = date.getMinutes();
    d += (dat < 10 ? "0" : "")+dat+":";
    dat = date.getSeconds();
    d += (dat < 10 ? "0" : "")+dat+".";
    dat = date.getMilliseconds();
    d += (dat < 10 ? "00" : (dat < 100 ? "0" : ""))+dat;
    fs.appendFile(logFileName, d + " " + req.ip + " " + req.query.message+"\n", function (err) {});
    res.send(""); // send empty content
});

app.get('/getalllogs', function (req, res, next) {
    fs.readFile(logFileName, 'utf8', function (err, text) {
        if (text === undefined) {
            res.send("");
            return;
        }
        var lines = text.split("\n");
        lines.reverse();
        res.send(lines.join("\n"));
    });
});

app.get('/clearlogs', function (req, res, next) {
    fs.writeFileSync(logFileName, "-----------\n");
    res.send("logs cleared");
});

app.get('/getlogs', function (req, res) {
    fs.readFile(logFileName, 'utf8', function (err, text) {
        var lines = text.split("\n"), subset = "";
        for (var i = lines.length-1; i >= 0; i--) {
            if (lines[i].indexOf(req.query.ip) >= 0) subset += lines[i] + "\n";
        }
        res.send(subset);
    });
});

app.get('/setloglevel', function (req, res) {
    TVs.push(new TV(req.query.ip, req.query.logLevel));
    res.send("log level of TV " + req.query.ip + " set to " + req.query.logLevel);
});

app.get('/getloglevel', function (req, res, next) {
    var tv = getTVByIp(req.ip);
    if (tv) {
        res.send(tv.logLevel);
    } else {
        res.send("0");
    }
});

// ///////////////////////////////////////////////////
// pairing functions
// ///////////////////////////////////////////////////

function getTVByIp(ip) {
    for (var i = 0; i < TVs.length; i++) {
        if (!TVs[i].isOutdated() && TVs[i].ip == ip) {
            return TVs[i];
        }
    }
    return null;
}

// ///////////////////////////////////////////////////


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.set('port', process.env.PORT || 3000)

let server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port)
});

