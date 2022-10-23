'use strict';
var util = require('util');
var process = require("process");

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
// var util = require('util');
// var http = require('https');

//must install this module
var request = require('request');

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
	console.log("headers inspect: " + util.inspect(req.headers) );
	console.log("headers stringify: " + JSON.stringify( req.headers  ));
	
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    console.log( 'Edit module' );
    res.status(200).send('Edit');
};

/*
 * POST Handler for /stop/ route of Activity.
 */
exports.stop = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    console.log( 'stop module' );
    res.status(200).send('stop');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    console.log('save module');
	// JWT(req.body, 'Hello world', (err, decoded) => {
	// 	console.log( "decoded==>"+JSON.stringify(  decoded  ));
	// });
    res.status(200).send('Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {
	console.log('execute module');
    // example on how to decode JWT
    JWT(req.body, "Hello world", (err, decoded) => {

        // verification error -> unauthorized request
        if (err) {
            console.error("JWT<=+=>"+err);			
            return res.status(401).end();
        }


        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {

            // decoded in arguments
            var decodedArgs = decoded.inArguments[0];            

			//console.log("decodedArgs==>" +JSON.stringify(  decodedArgs  ));
			console.log( "decoded==>"+JSON.stringify(  decoded  ));
			console.log("inArguments==>"+JSON.stringify(  decoded.inArguments  ));
			
            var setting = 1000;
			for(var i in decoded.inArguments){
				if(decoded.inArguments[i].dateTimeSetting != "" || decoded.inArguments[i].dateTimeSetting !=null){
                     console.log("timeSetting=="+timeSetting);
                     var timeSetting = decoded.inArguments[i].dateTimeSetting;
                     var today = new Date();
                     setting = Math.floor((new Date(timeSetting).getTime() - today.getTime())/1000);
                     if(setting<=0){
                        setting = 1000;
                     }
                }
			}
            setTimeout(function() {
                console.log("waiting !!1");
                res.status(200).send('Excute');
            }, setting);
            //Then , it will update the status to success
        } else {
        	//Then, it will update the status to failed, and retry is 1;

            console.error('inArguments invalid.');
            return res.status(400).end();

        }
    });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    console.log('publish module');
    res.status(200).send('Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    console.log('validate module');
    res.status(200).send('Validate');
};


exports.resolveToken = function (req, res) {
 
};



