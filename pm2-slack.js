
var pm2 = require('pm2');
var request = require('request');
var config = require('./config.json');


pm2.launchBus(function(err, bus) {

    console.log('connected', bus);

    bus.on('log:out', function(data) {
        console.log(arguments[0]);
    });

    bus.on('reconnect attempt', function() {
        console.log('Bus reconnecting');
    });

    bus.on('close', function() {
        console.log('Bus closed');
    });

    bus.on('process:event', function(e) {

        if((e.event == "restart" || e.event == "stop") && e.process.name == config.process.name) {

            var payload = JSON.stringify({"username": "server notification", "text": e.process.name + " : " + e.event});
            request.post({url: config.receiver.url, form: payload}, function optionalCallback(err, httpResponse, body) {
                if (err) {
                    return console.error('upload failed:', err);
                }
                console.log('Upload successful!  Server responded with:', body);
            });
        }

    });
});
