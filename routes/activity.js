'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
// var util = require('util');
// var http = require('https');
var schedule = require('node-schedule');

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

    // var mysql = require('mysql');
//connect mysql
// var mysql = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'cdb-5sm6xif4.cd.tencentcdb.com',
//   user     : 'ben',
//   password : 'ben_123@456!',
//   port:'10009',
//   database : 'big_data'
// });
// connection.connect();

//var sync = require('synchronize');

//must install this module
var request = require('request');

var tokenRequestData={
"grant_type": "client_credentials",
"client_id": "pes9dm03ov1ec39rpdeed71o",
"client_secret": "zmg1PH3zPiFi0C7j3SOjJGAc"
};

var access_token = "";
var journeyID = '';
var scheduleJobRetry=0;
// var requestData={
// 	"items": []
// };


var retrieveTokenUrl = "https://mcjhmstdw76qsk9kk6m1zpwm4xf4.auth.marketingcloudapis.com/v2/token";
var insertDEUrl = "https://mcjhmstdw76qsk9kk6m1zpwm4xf4.rest.marketingcloudapis.com/data/v1/async/dataextensions/key:CustomActivity_TargetedAd_DEV/rows";

var isStarScheduleJob = false;
// const { Client } = require('pg');
// const client = new Client({
// 	  connectionString: process.env.DATABASE_URL,
// 	  ssl: true,
// 	});
// client.connect();

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
    //isStarScheduleJob = false;
    //scheduleJobRetry = 3;
    //logData(req);
    //res.send(200, 'stop');
    res.status(200).send('stop');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    console.log('save module');

    //logData(req);
    //res.send(200, 'Save');
    res.status(200).send('Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {
	console.log('execute module');
    // example on how to decode JWT
    JWT(req.body, 'Hello world', (err, decoded) => {

        // verification error -> unauthorized request
        if (err) {
            console.error("JWT==>"+err);			
            return res.status(401).end();
        }


        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
        	isStarScheduleJob = true;
            var map = {};
            map.runningStartDate="";
            map.runningEndDate="";

            // decoded in arguments
            var decodedArgs = decoded.inArguments[0];            

			// console.log("decodedArgs==>" +JSON.stringify(  decodedArgs  ));
			// console.log( "decoded==>"+JSON.stringify(  decoded  ));
			console.log("inArguments==>"+JSON.stringify(  decoded.inArguments  ));
			// console.log("journeyId==>"+JSON.stringify(decoded.journeyId));
			journeyID = decoded.journeyId;
			
			for(var i in decoded.inArguments){
				var adCode = decoded.inArguments[i].ADCode;
				var startDate = decoded.inArguments[i].startDate;
				var endDate = decoded.inArguments[i].endDate;
				var LoyaltyID = decoded.inArguments[i].LoyaltyID;
				var LocationGroup = decoded.inArguments[i].LocationGroup;
				var AdPosition = decoded.inArguments[i].AdPosition;
				var RankedValue = decoded.inArguments[i].RankedValue;
				var duration = decoded.inArguments[i].Duration;

				if(adCode!=null){
					map.ADCode = adCode;
				}
				else if(startDate !=null){
					map.startDate = startDate!=""?startDate.replace('T',' '):"";
				}
				else if(endDate !=null){
					map.endDate = endDate!=""?endDate.replace('T',' '):"";
				}
				else if(LoyaltyID !=null){
					map.LoyaltyID = LoyaltyID;
				}
				else if(LocationGroup !=null){
					map.LocationGroup = LocationGroup;
				}
				else if(AdPosition !=null){
					map.AdPosition = AdPosition;
				}
				else if(RankedValue !=null){
					map.RankedValue = RankedValue;
				}
				else if(duration !=null){
					map.duration = duration;
				}
			}
			var isEmpty = JSON.stringify(map)=="{}";
			if(isEmpty!=true){
				map.journeyid = journeyID;
				map.status = 'pending';
				var queryStr = 'INSERT INTO ben.input(startdate,enddate,adcode,journeyid,status,createdate,loyaltyid,adposition,rankedvalue,locationgroup,runningstartdate,runningenddate) VALUES($1::varchar,$2::varchar,$3::varchar,$4::varchar,$5::varchar,$6::varchar,$7::varchar,$8::varchar,$9::varchar,$10::varchar,$11::varchar,$12::varchar)';
				//
				let durationTemp = map.duration == "" ? '0' : map.duration;
				map.runningStartDate = convertToLocalDateTime(new Date());
				map.runningEndDate = addDays(new Date(),durationTemp,map.startDate);

				var parameters = [map.startDate,map.endDate,map.ADCode,map.journeyid,map.status,dateFormat(new Date()),map.LoyaltyID,map.AdPosition,map.RankedValue,map.LocationGroup,map.runningStartDate,map.runningEndDate];
				insertDataIntoDB(queryStr,parameters);
			}
	
            res.status(200).send('Excute');
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
    var rule = '0 0/5 * * * *';
    console.log("rule==>"+rule);
    //reset 
    scheduleJobRetry = 0;
    setScheduleJob(rule,retrieveDataFromDB);

    res.status(200).send('Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    console.log('validate module');
    res.status(200).send('Validate');
};


exports.resolveToken = function (req, res) {

	// var bd = req.body;
	
	// //console.log ( util.inspect( req.headers) );
	// var un = req.headers['username'];
	// var pw = req.headers['password']; 
	// var auth = req.headers['authorization'];
	// var valid = false;
	// if (un == '123' && pw =='123'){
	// 	valid=true;
	// }else if (auth = 'Basic MTIzOnF3ZQ==') {
	// 	valid=true;
	// }
	
	// if (!valid ){
	// 	 res.status(401).send('Authentication not passed.');
	// 	return;
	// }
	// console.log ('REQUEST BODY'+ util.inspect (bd.tokens));

 //  //  logData(req);
		 
	// var jresp = {};
	// jresp.resolvedTokens=[];
	// jresp.unresolvedTokens=[];
	// var tokens  = bd['tokens'];
	// var tokenArray = [];
	// var resultArray = [];
	// var requestTokenMap = new Map();
	// var tokenValueMap = new Map();
	// for(var j = 0;j<tokens.length;j++){
	// 	var tokenRequestID = tokens[j].tokenRequestId;
	// 	tokenArray.push (tokens[j].token );
	// 	requestTokenMap.set (tokenRequestID, tokens[j].token);
	// }
	
	// for (var i =0;i<450;i++){
	// 	var ranInt =Math.floor((Math.random()*10000)+1); 
	// 	var t = 'tkn'+ (i+ranInt)+'@dtt.com.cn';
	// 	tokenArray.push (t);
	// 	requestTokenMap.set (t,t);
	//  }
	
	// var channel = 'Email';
	// var sendKey = bd['sendKey'];
	// if (sendKey.includes('mobile')){
	// 	channel = 'Mobile';
	// }
	// client.query( 'select * from public.resolve_token_batch($1 ,$2 ) ',[channel, tokenArray] ,(err, resp) => {
	//   if (err) throw err;
	//   for (let row of resp.rows) {
	// 	//console.log(JSON.stringify(row));
	// 	tokenValueMap.set (row.token, row.tokenvalue);

	//   }
	  
	 
	
	//  for (var pair of requestTokenMap){
	// 	var key = pair[0];
	// 	var val = pair[1];

	// 	var item = {};
	// 	item.tokenRequestId = key;
	// 	var tknVal = tokenValueMap.get(val);	

	// 	if (tknVal != null ){
	// 		item.tokenValue = tknVal;
	// 		item.attributes = [{"name":"First_Name","value":"static_firstName"},{"name":"myAttr1","value":"myVal1"}]; 		  
	// 		jresp.resolvedTokens.push (item);
	// 	}else{
	// 		item.message = 'Invalid token; token does not exist.';
	// 		jresp.unresolvedTokens.push(item);
	// 	}
	//  } 
	//   console.log( 'RESPONSE BODY: ' +JSON.stringify(jresp) );
	//  // res.setHeader('Content-Type', 'application/json;charset=utf-8');
	//   res.status(200).send(JSON.stringify(jresp));
	// }) 
 
};

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
            //console.log('dedata==>'+JSON.stringify(deData));
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
    					console.log('done deData==>'+JSON.stringify(deData));
    					
    					//console.log("updateList==>"+JSON.stringify(updateList));
    					//var sql = 'insert into ben.input(status, id) values ($1::varchar, $2::varchar) on duplicate key update status = $1::varchar';
    					var targetRecords = deData.items;
    					console.log("target data len==>"+targetRecords.length);
    					//console.log("targetRecords==>"+JSON.stringify(targetRecords));
    					var len = targetRecords.length-1;
    					if(targetRecords.length > 0){
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
			client.query("CALL ben.updatestatus($1,$2);",[parseInt(id),journeyID],function(isErr, rst){
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

function retrieveDataFromDB(insertDataIntoDE){
	var reuslt = '';
	var dateStr = dateFormat(new Date());
	console.log("dateStr==>"+dateStr);
	console.log('retrieveDataFromDB');
	pgPool.connect(function (isErr, client, done) {
    	console.log("start connection");
    	console.log("journeyID==?=>"+journeyID);
        if (isErr) {
            console.log('connect query:' + isErr.message);
            return;
        }
        client.query("select id,targetstartdate,targetenddate,adcode,journeyid,status,createdate,loyaltyid,adposition,rankedvalue,locationgroup from ben.input where status !='success' and journeyid=$1 and createdate <=$2 order by id asc", [journeyID,dateStr], function (isErr, rst) {
            done();//释放连接，归还给连接池
            if (isErr) {
                console.log('retrieve from db query error:' + isErr.message);
            } 
            else {
                //console.log('query success, data is: ' + JSON.stringify(rst.rows));
                reuslt = rst.rows;
                var data = rst.rows;
                //console.log("get data-->"+JSON.stringify(reuslt));
                var requestData={
					"items": []
				};
				for(var key in data){
					var resultMap = {};
				
					resultMap.id = data[key].id;
					
					resultMap.LoyaltyID = data[key].loyaltyid;
					resultMap.TargetedAdStartDate =data[key].targetstartdate;
					resultMap.TargetedAdEndDate =data[key].targetenddate;
					resultMap.ModifiedDate = new Date();
					resultMap.TargetedAdCode = data[key].adcode;
					resultMap.AdPosition =data[key].adposition;
					resultMap.RankedValue =data[key].rankedvalue;
					resultMap.StoresLocationGroup = data[key].locationgroup;

					requestData.items[key] = resultMap;
				}
				var temp = requestData.items;
				var len = temp.length;
				if(len ==0){
					console.log("no data to retrieve");
					isStarScheduleJob = false;
					console.log("isStarScheduleJob==>"+isStarScheduleJob);
				}
				else{
					console.log("requestData==>"+JSON.stringify(requestData));
					console.log("enter insertDE operation");
                	insertDataIntoDE(insertDEUrl,requestData,retrieveAccessToken);
				}
            }
        });
    });
}

function insertDataIntoDE(url,data,retrieveAccessToken){
	//retrieve access token
	retrieveAccessToken(retrieveTokenUrl,tokenRequestData,data,url);
	// console.log("access token Insert DE==>"+access_token);
	// console.log("data Insert DE==>"+JSON.stringify(data));
    
}

function insertDataIntoDB(queryStr,parameters){
	pgPool.connect(function (isErr, client){
		if (isErr) {
    		console.log('connect query:' + isErr.message);
    		return;
		}
		//['testn','testp']
		//'INSERT INTO ben.input(name,email) VALUES($1::varchar, $2::varchar)'
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

function setScheduleJob(rule,retrieveDataFromDB){
	console.log("start scheduleJob");
	var j = schedule.scheduleJob(rule,function(){
		console.log("schedule Job Starting");
		//console.log("retrySchedule==>"+scheduleJobRetry);
		console.log("schedule isStarScheduleJob==>"+isStarScheduleJob);
		
		if(scheduleJobRetry>=3){
			console.log("stop schedule");
			console.log("stop database server connection");
			j.cancel();
		}
		else{
			if(isStarScheduleJob==true){
				console.log("do something");
				retrieveDataFromDB(insertDataIntoDE);
			}
		}
	});
}

function dateFormat(date){
    var y = date.getFullYear();
    var m = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
    var d = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
    var h = date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours();
    var f = date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes();
    var sec = date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds();
    var formatdate = y+'-'+m+'-'+d + " " + h + ":" + f+":"+sec;
    //console.log("activity formdate===>"+formatdate);
    return formatdate;
}

function convertToLocalDateTime(usDate){
    var localDate = +usDate + 1000*60*60*8;
    console.log("localDate==>"+new Date(localDate));
    var date = new Date(localDate);

    var y = date.getFullYear();
    var m = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
    var d = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
    var h = date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours();
    var f = date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes();
    //var sec = date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds();
    var formatdate = y+'-'+m+'-'+d + " " + h + ":" + f;
    console.log("convertToLocalDateTime formdate===>"+formatdate);
    return formatdate;
}

function addDays(usDate,duration,startDate){
	var date;
	var i = parseInt(duration);
	if(startDate!=''){
		var currentDate = convertToLocalDateTime(usDate);
		if(currentDate <= startDate){
			currentDate = startDate;
		}
    	var targetDate = +(new Date(currentDate)) + 1000*60*60*24*i;
    	date = new Date(targetDate);
	}
	else{
		var localDate = +usDate + 1000*60*60*8;
    	var targetDate = +localDate + 1000*60*60*24*i;
    	date = new Date(targetDate);
	}

	var y = date.getFullYear();
	var m = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
	var d = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
	var h = date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours();
	var f = date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes();
	//var sec = date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds();
	var formatdate = y+'-'+m+'-'+d + " " + h + ":" + f;
	console.log("addDays formdate===>"+formatdate);
	return formatdate;

}

