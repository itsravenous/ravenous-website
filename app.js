var config = require('./config');
var express = require('express');
var url = require('url');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ua = require('universal-analytics');
var getIP = require('ipware')().get_ip;
var Storage = require('dom-storage');
var localStorage = new Storage('./storage.json');
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// RIP Terry
app.use(function (req, res, next) {
    res.set('X-Clacks-Overhead', 'GNU Terry Pratchett');
    next();
});
// Static files
app.use(express.static(path.join(__dirname, 'public')));
// Analytics
app.use(function (req, res, next) {
    var ipInfo = getIP(req);
    if (ipInfo.clientIpRoutable) {
        var urlParts = url.parse(req.url, true);
        var cidKey = 'ua_'+ipInfo.clientIp;
        var cid = localStorage.getItem(cidKey);
        if (cid) {
            var visitor = ua(config.analyticsCode, cid);
        } else {
            var visitor = ua(config.analyticsCode);
            localStorage.setItem(cidKey, visitor.cid);
        }
        visitor.pageview(urlParts.pathname).send();
    }
    next();
});
// App routes
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})


module.exports = app;
