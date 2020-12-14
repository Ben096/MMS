'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var schedule = require('node-schedule');
var request = require('request');

//connect postgreSql
var pgOpt = require('pg');
var pgConfig = {
    user: 'ldqtsrlnhklkwm',
    database: 'd3dvc63s4josrb',
    password: '3165f7e45987e7ec447054650fab84a15194a75b6283b1c5bdb5a3f809894d9e',
    host: 'ec2-75-101-212-64.compute-1.amazonaws.com',
    port: '5432',
    poolSize: 5,
    poolIdleTimeout: 30000,
    reapIntervalMillis: 10000
};
var pgPool = new pgOpt.Pool(pgConfig);

const ET_Client     = require('sfmc-fuelsdk-node');
const clientId      = "rnriw78wwxfrpdw9ss37wown";
const clientSecret  = "BDNX68eeMORjV1a6fZcVku6s";
const stack         = null;


const origin              = 'https://mcjhmstdw76qsk9kk6m1zpwm4xf4.rest.marketingcloudapis.com/';
const authOrigin          = 'https://mcjhmstdw76qsk9kk6m1zpwm4xf4.auth.marketingcloudapis.com/';
const soapOrigin          = 'https://mcjhmstdw76qsk9kk6m1zpwm4xf4.soap.marketingcloudapis.com/';


var retrieveTokenUrl = "https://mcjhmstdw76qsk9kk6m1zpwm4xf4.auth.marketingcloudapis.com/v2/token";
var insertDEUrl = "https://mcjhmstdw76qsk9kk6m1zpwm4xf4.rest.marketingcloudapis.com/data/v1/async/dataextensions/key:OfferMatrixDeliveryTable/rows";
var tokenRequestData={
"grant_type": "client_credentials",
"client_id": "rnriw78wwxfrpdw9ss37wown",
"client_secret": "BDNX68eeMORjV1a6fZcVku6s" 
};

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

var access_token = "";
var offerIDTarget = "";
var journeyID = '';
var dataResult = [];
var scheduleJobRetry=0;
var addDays = -1;

function retrieveDataFromDE(){
    console.log("offerIDTarget==>"+offerIDTarget);
    console.log("start retrieveDataFromDE");
    return new Promise((resolve, reject) => {
        //retrieve from DataExtension
        const deRow = client.dataExtensionRow({
                //dataExtension which you want to retrieve from
                Name: 'BaseOfferTable',
                //field name
                props: ['OfferId','ALPExternalReference','OfferType','StoreGroup','Brand','PointCost',
                'PromotionCategory','RankedValue','PromotionCategoryRank'],
                filter: {
                    leftOperand: 'offerID',
                    //operator includes : equals, notEquals, greaterThan, lessThan
                    operator: 'equals',
                    rightOperand: offerIDTarget
                }
                // to return all rows, delete the filter property
        });

        deRow.get((err, res) => {
            if (err) {
                console.error("retrieve error===>"+err.message);
                reject();
            } 
            else {
                var temp = res.body.Results;
                if(temp!=""){
                    console.log("enter deRow");
                    for (const result of res.body.Results) {
                        for (const property of result.Properties.Property) {
                            // var nameStr= property.Name;
                            // var valueStr = property.Value;
                            // dataResult.nameStr = valueStr
                            //dataResult.push(property);
                            dataResult.push(property);
                        }
                    }
                }
                else{
                    //stop the schedule Job and Journey
                    console.log("end schedule");
                    scheduleJobRetry = 3;
                }
                resolve();
            }
        });
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
    console.log("Edit");
    res.status(200).send('Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    console.log("Save");
    res.status(200).send('Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req,res) {
	
    // example on how to decode JWT
    JWT(req.body, 'Hello world', (err, decoded) => {

        // verification error -> unauthorized request
        if (err) {
            console.error("JWT error===>"+err);			
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            var map = {};
            var mapDate = {};
            journeyID = decoded.journeyId;
            // decoded in arguments
            var decodedArgs = decoded.inArguments[0];
            var versionNumber = '';
            for(var i in decoded.inArguments){
                var startDate = decoded.inArguments[i].OfferStartDate;
                var endDate = decoded.inArguments[i].OfferExpiryDate;
                var offerID = decoded.inArguments[i].OfferID;
                var duration = decoded.inArguments[i].Duration;
                var LoyaltyID = decoded.inArguments[i].LoyaltyID;
                //versionNumber = decoded.inArguments[i].version;
                versionNumber = decoded.inArguments[i].version;
                if(offerID!=null && offerID!=''){
                    map.offerID = offerID;
                    offerIDTarget=offerID;
                }
                else if(startDate!=null && startDate!=''){
                    map.startDate = startDate;
                    mapDate.startDate = startDate;
                }
                else if(endDate!=null && endDate!=''){
                    map.endDate = endDate;
                    mapDate.endDate = endDate;
                }
                else if(duration!=null && duration!=''){
                    map.duration = duration;
                }
                else if(LoyaltyID!=null && LoyaltyID!=''){
                    map.LoyaltyID = LoyaltyID;
                }
            }

            var isEmpty = JSON.stringify(map)=="{}";
            if(isEmpty!=true){
                map.journeyid = journeyID;
                map.status = 'pending';
                var queryStr = 'INSERT INTO offer.offer(startdate,enddate,journeyid,status,createddate,offerid,duration,loyaltyid) VALUES($1::varchar,$2::varchar,$3::varchar,$4::varchar,$5::varchar,$6::varchar,$7::varchar,$8::varchar)';
                var parameters = [map.startDate,map.endDate,map.journeyid,map.status,dateFormat(new Date()),map.offerID,map.duration,map.LoyaltyID];
                insertDataIntoDB(queryStr,parameters);
            }
            //res.send(200, 'Execute');
            res.status(200).send('Execute');
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
    var rule = '0 0/15 * * * *';
    console.log("rule==>"+rule);
    //reset 
    scheduleJobRetry = 0;
    offerIDTarget='';
    addDays++;
    console.log("addDays==>"+addDays);
    setScheduleJob(rule);
    //res.send(200, 'Publish');
    res.status(200).send('Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    console.log("Validate");
    //res.send(200, 'Validate');
    res.status(200).send('Validate');
};

/*
 * POST Handler for /stop/ route of Activity.
 */
exports.stop = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    console.log("stop");
    //res.send(200, 'Validate');
    addDays = -1;
    console.log("stop addDays==>"+addDays);
    res.status(200).send('stop');
};


exports.resolveToken = function (req, res) {
 
};

function setScheduleJob(rule){
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
            if(offerIDTarget!=null && offerIDTarget!=''){
                console.log("enter sfmc-fuelsdk-node");
                retrieveDataFromDE().then(function(){
                    retrieveDataFromDB(insertDataIntoDE);
                });
            }
        }
    });
}

function retrieveDataFromDB(insertDataIntoDE){
    if(scheduleJobRetry>=3){
        console.log("stop retrieveDataFromDB");
        return;
    }
    else{
        console.log("retrieveDataFromDB function");
        // var reuslt = '';
        var dateStr = dateFormat(new Date());
        pgPool.connect(function (isErr, client, done) {
            console.log("journeyID==?=>"+journeyID);
            if (isErr) {
                console.log('connect query:' + isErr.message);
                return;
            }
            client.query("select id,offerID,startdate,enddate,duration,loyaltyid from offer.offer where status !='success' and journeyid=$1 and createddate <=$2 order by id asc", [journeyID,dateStr], function (isErr, rst) {
                done();//释放连接，归还给连接池
                if (isErr) {
                    console.log('retrieve from db query error:' + isErr.message);
                } 
                else {
                    //console.log('query success, data is: ' + JSON.stringify(rst.rows));
                    // reuslt = rst.rows;
                    var data = rst.rows;
                    console.log("get data-->"+JSON.stringify(data));
                    var requestData={
                        "items": []
                    };
                    //insert related DB rows
                    var PointCost='';
                    var PromotionCategory='';
                    var StoreGroup = '';
                    var Brand = '';
                    var OfferType = '';
                    var ALPExternalReference='';
                    var PromotionCategoryRank='';
                    var RankedValue = '';
                    console.log('dataResult str==>'+JSON.stringify(dataResult));
                    for(var i in dataResult){
                        var nameT = dataResult[i].Name;
                        var valueT = dataResult[i].Value;
                        switch(nameT){
                            case "ALPExternalReference":
                            ALPExternalReference=valueT;
                            break;
                            case "OfferType":
                            OfferType=valueT;
                            break;
                            case "StoreGroup":
                            StoreGroup=valueT;
                            break;
                            case "Brand":
                            Brand=valueT;
                            break;
                            case "PointCost":
                            PointCost=valueT;
                            break;
                            case "PromotionCategory":
                            PromotionCategory=valueT;
                            break;
                            case "RankedValue":
                            RankedValue=valueT;
                            break;
                            case "PromotionCategoryRank":
                            PromotionCategoryRank=valueT;
                            break;
                        }

                    }

                    for(var key in data){
                        var resultMap = {};
                        resultMap.LoyaltyID =data[key].loyaltyid;
                        resultMap.OfferId =data[key].offerid;

                        resultMap.PointCost =PointCost;
                        resultMap.PromotionCategory =PromotionCategory;
                        resultMap.StoreGroup =StoreGroup;
                        resultMap.Brand =Brand;
                        resultMap.OfferType =OfferType;
                        resultMap.OfferStartDate =data[key].startdate;
                        resultMap.OfferExpiryDate =data[key].enddate;
                        resultMap.ALPExternalReference =ALPExternalReference;
                        resultMap.PromotionCategoryRank =PromotionCategoryRank;
                        resultMap.RankedValue =RankedValue;
                        resultMap.id = data[key].id;

                        requestData.items[key] = resultMap;
                    }
                    var temp = requestData.items;
                    var len = temp.length;
                    console.log("len==>"+len);
                    if(len ==0){
                        console.log("no data to retrieve");
                        scheduleJobRetry++;
                    }
                    else{
                        console.log("enter insertDE operation");
                        insertDataIntoDE(insertDEUrl,requestData,retrieveAccessToken);
                    }
                }
            });
        });
    }
}

function insertDataIntoDE(url,data,retrieveAccessToken){
    retrieveAccessToken(retrieveTokenUrl,tokenRequestData,data,url);
}

function retrieveAccessToken(url,data,deData,deUrl){
    request({
        url: url,
        method: "POST",
        json: true,
        headers : {
            "Content-type" : "application/JSON"
        },
        body: tokenRequestData
    }, function(error, response, body) {
        if (!error) {
            //console.log(body) // 请求成功的处理逻辑
            access_token = body.access_token;
            console.log("get token==>"+access_token);
            console.log('dedata==>'+JSON.stringify(deData));
            console.log("deURL==>"+deUrl);
            request({
                url: deUrl,
                method: "PUT",
                json: true,
                headers : {
                    "Content-type" : "application/JSON",
                    "Authorization" : "Bearer "+access_token
                },
                body: deData
                }, function(error, response, body) {
                    if(error){
                        console.log("has error");
                        console.log("response==>"+JSON.stringify(response));
                        console.log("body==>"+JSON.stringify(body));
                    }
                    else{
                        console.log('done');
                        var targetRecords = deData.items;
                        console.log("target data len==>"+targetRecords.length);
                        console.log("targetRecords==>"+JSON.stringify(targetRecords));
                        var len = targetRecords.length-1;
                        if(targetRecords.length > 0){
                            console.log("targetID in loop==>"+targetRecords[len].id);
                            updateRecordsStatus(targetRecords[len].id);
                        }
                    }
                }
            );
        }
        else{
            console.log("retrieve token error==>"+error);
        }
    });
}

function updateRecordsStatus(id){
    pgPool.connect(function (isErr, client, done) {
        if (isErr) {
            console.log('connect query:' + isErr.message);
            return;
        }
        else{
            console.log("last index==>"+id);
            console.log("produce journeyID==>"+journeyID);
            //call producure
            client.query("CALL offer.updatestatus($1,$2);",[parseInt(id),journeyID],function(isErr, rst){
                if(isErr){
                    console.log('call proc error:' + isErr.message);
                }   
                else{ 
                    console.log("call proc successfully");
                }
            });
            client.release();
        }
    });
}

function insertDataIntoDB(queryStr,parameters){
    console.log("insert str==>"+queryStr);
    console.log("insert str==>"+JSON.stringify(parameters));
    pgPool.connect(function (isErr, client){
        if (isErr) {
            console.log('connect query:' + isErr.message);
            return;
        }
        client.query(queryStr, parameters, function (isErr, rst) {
            //done();//释放连接，归还给连接池
            if (isErr) {
                console.log('execute query error:' + isErr.message);
            } else {
                //console.log('insert success!! ');
            }
        });
        client.release();
    });
}

function dateFormat(date){
    var y = date.getFullYear();
    var m = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
    var d = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
    var h = date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours();
    var f = date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes();
    var formatdate = y+'-'+m+'-'+d + "T" + h + ":" + f;
    console.log("formdate===>"+formatdate);
    return formatdate;
}

function addOneDate(dateStr,actionTimes){
    var addDays = parseInt(actionTimes);
    var targetDate = +(new Date(dateStr)) + 1000*60*60*24*addDays;
    var targetDateStr = dateFormat(new Date(targetDate));
    return targetDateStr;
}
