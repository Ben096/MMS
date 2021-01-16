Modification content£º

1. config.json(Path: ./public/config.json)

--"applicationExtensionKey": "Your Installed Package Unique key"
( Note: Setup-->Installed Package-->Your created Installed Package-->Components( If you don't create component,please create it([Name:Journey Builder Activity-->Categorys: Messages] And [Name:API Integration-->server to server-->grant access to data extension(Read & write)]) ) )

--Url Setting:
	execute : https://"Your domain name"/offer/execute
	save : https://"Your domain name"/offer/save
	publish : https://"Your domain name"/offer/publish
	validate : https://"Your domain name"/offer/validate
	stop : https://"Your domain name"/offer/stop

--"customerKey" : "your external key"
(Ps: In MC, Setup-->Key Management-->create-->select Salt key type-->input Words in hexadecimal in require field[e.g. Hello world becomes 0x48656c6c6f20776f726c64])


2. activity.js(Path: ./routes/activity.js)
-Modify variable values( Name:pgConfig,tokenRequestData,retrieveTokenUrl,insertDEUrl )

----var pgConfig = {
	user: 'Your Heroku DB user',
    	database: 'Your Heroku DB',
    	password: 'Your Heroku DB password',
    	host: 'Your Heroku DB host',
    	port: '5432',
    	poolSize: 5,
    	poolIdleTimeout: 30000,
    	reapIntervalMillis: 10000
    };

----var tokenRequestData={
	"grant_type": "client_credentials",
	"client_id": "the value from your created Installed package--->API Integration-->Client Id",
	"client_secret": "the value from your created Installed package--->API Integration-->Client Secret"
     };

----var retrieveTokenUrl = "Authentication Base URI/v2/token";
----var insertDEUrl = "REST Base URI/data/v1/async/dataextensions/key:Your data extension external key/rows";

-----on exports.execute = function (req, res), set JWT code. If you use 'Hello world' to create JWT, then you don't change this code. If not, please use your JWT code. Like£º
	JWT(req.body, 'your word using to create key in key Management', (err, decoded) => {})


3.Heroku Setting:
--on your heroku app-->Settings-->Config Vars-->input key & value(key=jwtSecret ; value = "from your created installed package JWT Signing Secret")

	