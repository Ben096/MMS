define([
    'postmonger'
], function (
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var authTokens = {};
    var payload = {};

    var versionNumber = '';
    var startDate = '';
    var endDate = '';
    var duration = '';
    var OfferID = '';

    var inArgumentsData='';

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', save);
   
    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
		console.log ('onRender function');
		
    }

    function initialize(data) {
        console.log("init==>"+JSON.stringify(data));
        if (data) {
            payload = data;
        }
        
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        console.log("inargument==>"+JSON.stringify(inArguments));

        var map = {};
        map.OfferID = '';
        map.duration='';
        map.endDate = '';
        map.startDate = '';
        //init UI data form
        // $.each(inArguments, function (index, inArgument) {
        //     $.each(inArgument, function (key, val) {
        //         console.log("customActivity key==>"+key);
        //         console.log("customActivity val==>"+val);
        //         if(key=='OfferStartDate'){
        //             map.startDate = val;
        //         }
        //         else if(key=='OfferExpiryDate'){
        //             map.endDate = val;
        //         }
        //         else if(key=='OfferID'){
        //             map.OfferID = val;
        //         }
        //         else if(key=='Duration'){
        //             map.duration = val;
        //         }
        //     });
        // });

        inArgumentsData = inArguments;

        //init 
        // $('#OfferID').val(map.OfferID);
        // $('#Duration').val(map.duration);
        // $('#OfferExpiryDate').val(map.endDate);
        // $('#OfferStartDate').val(map.startDate);

       console.log('initActivity function');
    }

    function onGetTokens(tokens) {
        console.log(tokens);
        authTokens = tokens;
    }

    function onGetEndpoints(endpoints) {
        console.log(endpoints);
    }
	
	var eventDefinitionKey;
	connection.trigger('requestTriggerEventDefinition');
	connection.on('requestedTriggerEventDefinition',
	function(eventDefinitionModel) {
		if(eventDefinitionModel){

			eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
			console.log(">>>Event Definition Key " + eventDefinitionKey);
			/*If you want to see all*/
			console.log('>>>Request Trigger',JSON.stringify(eventDefinitionModel));
		}

	});
	
	var entrySchema;
	connection.trigger('requestSchema');
	connection.on('requestedSchema', function (data) {
	   // save schema, retrieve field attributes
	   console.log('*** Schema ***', JSON.stringify(data['schema']));
	   entrySchema = data['schema'];
	});

    //trigger JB, and retrieve its information
    connection.trigger('requestInteraction');
    connection.on('requestedInteraction', function(interaction) {
        console.log("interaction==>"+JSON.stringify(interaction));
        $.each(interaction,function(key,val){
            if(key=="version"){
                $.each(inArgumentsData,function(index, inArgument){
                    $.each(inArgument, function (key, val){
                        console.log("inter key==>"+key);
                        console.log("inter val==>"+JSON.stringify(val));
                        if(key=="versionNumber"){
                            var mapObj = val;
                            //init 
                            $('#OfferID').val(mapObj.OfferID);
                            $('#Duration').val(mapObj.duration);
                            $('#OfferExpiryDate').val(mapObj.endDate);
                            $('#OfferStartDate').val(mapObj.startDate);

                        }
                    });
                });
                versionNumber = val;
            }
        });
    });

	String.prototype.replaceAll = function (FindText, RepText) {
		var regExp = new RegExp(FindText, "g");
		return this.replace(regExp, RepText);
	}
 
    function save() {

        var uiArgument = {};

        if(versionNumber != ''){
            uiArgument.version = versionNumber;
            payload['arguments'].execute.inArguments.push({"versionNumber": uiArgument });
        }

        console.log('customActivity Save function');
        var postcardURLValue = $('#postcard-url').val();
        var postcardTextValue = $('#postcard-text').val();

        //retrieve the input field value
        var OfferID = $('#OfferID').val();
        var OfferStartDate = $('#OfferStartDate').val();

        //check required field
        if(OfferID==""){
            $("#OfferIDInfo").addClass("show");
            $("#OfferIDInfo").removeClass("hide");
            $("#OfferID").addClass("inputStyle");
            return;
        }
         
        //CA UI Input value
        //payload['arguments'].execute.inArguments.push({"OfferID": OfferID });
        uiArgument.OfferID = OfferID;

        if(OfferStartDate==''){
            console.log('set startDate to today');
            var today = new Date();
            OfferStartDate = dateFormat(today);
        }
        //payload['arguments'].execute.inArguments.push({"OfferStartDate": OfferStartDate });
        uiArgument.startDate = startDate;

        var OfferExpiryDate = $('#OfferExpiryDate').val();
        var duration = $('#Duration').val();
        
        if(duration != ''){
            console.log("se enddate with duration");
            var startDate = new Date(OfferStartDate);
            var i = parseInt(duration);
            console.log("i==>"+i);
            var endDate = +startDate + 1000*60*60*24*i;
            console.log("duration enddate==>"+new Date(endDate));
            OfferExpiryDate = dateFormat(new Date(endDate));
            //payload['arguments'].execute.inArguments.push({"Duration": duration });
            uiArgument.duration = duration;
        }
        else if(OfferExpiryDate==''){
            console.log('set endDate to today');
            var today = new Date();
            OfferExpiryDate = dateFormat(today);

        }
		uiArgument.endDate = OfferExpiryDate;
		//
		//payload['arguments'].execute.inArguments.push({"DEName": "{{Event." + eventDefinitionKey+".name}}" });



		for(var i = 0; i < entrySchema.length; i++) {
			var fld = entrySchema[i];
			console.log('cx debug fld', JSON.stringify(fld));
			var fieldval = JSON.stringify(fld.key).replaceAll('"','');
			var fieldname = fieldval.split('.')[2];
			console.log('cx debug fieldname ', fieldname);
			console.log('cx debug fieldval ', fieldval);
            if("LoyaltyID"==fieldname){
                //payload['arguments'].execute.inArguments.push({"LoyaltyID": "{{Event." + eventDefinitionKey+".LoyaltyID}}" });
                uiArgument.LoyaltyID = fieldval;
            }
            //the key is still fieldname, can not change into field name
			//payload['arguments'].execute.inArguments.push({fieldname: fieldval });
 		}
        payload['metaData'].isConfigured = true;
        // console.log('payload=='+JSON.stringify(payload));
        // console.log('payload attribute=='+JSON.stringify(payload['arguments'].execute.inArguments));
        connection.trigger('updateActivity', payload);
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


});