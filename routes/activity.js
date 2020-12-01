'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var schedule = require('node-schedule');

const ET_Client     = require('sfmc-fuelsdk-node');
const clientId      = "rnriw78wwxfrpdw9ss37wown";
const clientSecret  = "BDNX68eeMORjV1a6fZcVku6s";
const stack         = null;


const origin              = 'https://mcjhmstdw76qsk9kk6m1zpwm4xf4.rest.marketingcloudapis.com/';
const authOrigin          = 'https://mcjhmstdw76qsk9kk6m1zpwm4xf4.auth.marketingcloudapis.com/';
const soapOrigin          = 'https://mcjhmstdw76qsk9kk6m1zpwm4xf4.soap.marketingcloudapis.com/';

const client = new ET_Client(
  clientId, 
  clientSecret, 
  stack, 
  {
    origin, 
    authOrigin, 
    soapOrigin, 
    authOptions: { 
      authVersion: 2, 
      accountId: 7327915, 
      scope: 'data_extensions_read data_extensions_write',
      applicationType: 'server'
    }
  }
);

var offerID = "";
var journeyID = '';
var dataResult = {};
var scheduleJobRetry=0;

function retrieveDataFromDE(){

    return new Promise((resolve, reject)=>{
        console.log("retrieveDataFromDE function");
        //retrieve from DataExtension
        const deRow = client.dataExtensionRow({
                //dataExtension which you want to retrieve from
                Name: 'OfferDemo',
                //field name
                props: ['offerID', 'item1','item2'],
                filter: {
                    leftOperand: 'offerID',
                    //operator includes : equals, notEquals, greaterThan, lessThan
                    operator: 'equals',
                    rightOperand: offerID
                }
                // to return all rows, delete the filter property
        });

        deRow.get((err, res) => {
            if (err) {
                console.error(err.message);
            } 
            else {
                var temp = res.body.Results;
                if(!temp==""){
                    for (const result of res.body.Results) {
                        for (const property of result.Properties.Property) {
                            var nameStr= property.Name;
                            var valueStr = property.Value;
                            dataResult.nameStr = valueStr
                        }
                    }
                }
            }
        });
        console.log("return dataResult==>"+JSON.stringify(dataResult));
        resolve();
    });
}


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
    //console.log( req.body );
    logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {
	
    // example on how to decode JWT
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {

        // verification error -> unauthorized request
        if (err) {
            console.error(err);			
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            var map = {};
            journeyID = decoded.journeyId;
            // decoded in arguments
            var decodedArgs = decoded.inArguments[0];            
            logData(req);
			console.log( JSON.stringify(  decodedArgs  ));
			console.log( JSON.stringify(  decoded  ));
            for(var i in decoded.inArguments){
                var startDate = decoded.inArguments[i].OfferStartDate;
                var endDate = decoded.inArguments[i].OfferExpiryDate;
                var offerID = decoded.inArguments[i].OfferID;
                if(offerID!=null){
                    map.offerID = offerID;
                }
                else if(startDate!=null){
                    map.startDate = startDate;
                }
                else if(endDate!=null){
                    map.endDate = endDate;
                }
                else if(name != null){
                    map.name = name;
                }
                else if(Email!=null){
                    map.Email = Email;
                }
            }
            var isEmpty = JSON.stringify(map)=="{}";
            if(isEmpty!=true){
                // map.journeyid = journeyID;
                // map.status = 'pending';
                // var queryStr = 'INSERT INTO ben.offer(name,email,startdate,enddate,,journeyid,status,createdate,offerid,item1,item2) VALUES($1::varchar, $2::varchar,$3::varchar,$5::varchar,$6::varchar,$7::varchar,$8::varchar,$9::varchar,$10::varchar,$11::varchar)';
                // var parameters = [map.name,map.Email,map.startDate,map.endDate,map.journeyid,map.status,dateFormat(new Date()),map.offerID,];
                // insertDataIntoDB(queryStr,parameters);
            }
            res.send(200, 'Execute');
        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    console.log('publish module');
    //var rule = '0 '+mm+' '+h+' '+d+' '+m+' *';
    var rule = '0/1 * * * * *';
    console.log("rule==>"+rule);
    //reset 
    scheduleJobRetry = 0;
    setScheduleJob(rule,retrieveDataFromDB);
    
    res.send(200, 'Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Validate');
};


exports.resolveToken = function (req, res) {
 
};

function setScheduleJob(rule,retrieveDataFromDB){
    console.log("start scheduleJob");
    var j = schedule.scheduleJob(rule,function(){
        console.log("schedule Job Starting");
        console.log("retrySchedule==>"+scheduleJobRetry);
        if(scheduleJobRetry>=3){
            console.log("stop schedule");
            console.log("stop database server connection");
            j.cancel();
        }
        else{
            retrieveDataFromDE().then(function(){
                retrieveDataFromDB();
            });
        }
    });
}

function retrieveDataFromDB(){
    console.log("retrieveDataFromDB function");
}
