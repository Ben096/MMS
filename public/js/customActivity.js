define([
    'postmonger'
], function (
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var authTokens = {};
    var payload = {};

    var fieldArr = [];

    var steps = [
        {'key': 'step1', 'label': 'Step1'},
        {'key': 'step2', 'label': 'Step2'}
    ];
    var currentStep = steps[0].key;

    var globalVariable="";

    $(window).ready(onRender);

    connection.on('initActivity', initialize);

    //running modal
    connection.on('initActivityRunningModal', initRunningModal);
    //hover modal
    connection.on('initActivityRunningHover', initRunningModal);

    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    //click Next & Previous button
    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);


    function onClickedNext () {
        if (currentStep.key === 'summary') {
            save();
        } else {
            connection.trigger('nextStep');
        }
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
        showStep(step);
        connection.trigger('ready');
    }

    function showStep (step, stepIndex) {
        console.log("showStep function");
        console.log("step==>"+step);
        console.log("stepIndex==>"+stepIndex);
        if (stepIndex && !step) {
            step = steps[stepIndex - 1];
        }

        currentStep = step;

        $('.step').hide();

        switch (currentStep.key) {
        case 'step1':
            $('#step1').show();
            break;
        case 'step2':
            $('#step2').show();
            break;
        }
    }

   
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
            //init 
            initOperation(data);
        }

       console.log('initActivity function');
    }

    function initRunningModal(data){
        console.log("initRunningModal function==>"+JSON.stringify(data));
        if (data) {
            initOperation(data);
        }
    }

    function initRunningHover(data){
        console.log("initRunningHover function==>"+JSON.stringify(data));
        if (data) {
            initOperation(data);
        }
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
    connection.on('requestedTriggerEventDefinition',function(eventDefinitionModel) {
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
       for(var i = 0; i < entrySchema.length; i++) {
            var fld = entrySchema[i];
            var fieldval = JSON.stringify(fld.key).replaceAll('"','');
            var fieldname = fieldval.split('.')[2];
            var fieldType = JSON.stringify(fld.type).replaceAll('"','');
            console.log('Debug fieldname ', fieldname);
            console.log('Debug fieldType ', fieldType);
            fieldArr.push(fieldname);
        }
        $("input[name='optArr']").val(fieldArr);
        console.log("Fields=="+JSON.stringify($("input[name='optArr']").val()));
    });

    //trigger JB, and retrieve its information
    connection.trigger('requestInteraction');
    connection.on('requestedInteraction', function(interaction) {
        console.log("interaction==>"+JSON.stringify(interaction));
    });

    String.prototype.replaceAll = function (FindText, RepText) {
        var regExp = new RegExp(FindText, "g");
        return this.replace(regExp, RepText);
    }
 
    function save() {

        var isRemovedPath = $('#chekcboxId').is(':checked');
        console.log('customActivity Save function');
        //Create new path
        var pathCount = parseInt($("#pathCount").val());
        console.log("save pathCount=="+pathCount);
        if(isRemovedPath==true){
            //remove path
            payload['outcomes'].splice(pathCount,1);
            payload['arguments'].execute.inArguments[1].pathCount=pathCount;
        }
        else{
            console.log("CustomActivity pathCount=="+pathCount);
            payload['arguments'].execute.inArguments.push({"pathCount":$("#pathCount").val()});

            var externalArr =[]; 
            for(var i=0;i<pathCount;i++){
                var externalJSON = {};
                var index = pathCount-i;
                var inputFieldId = "#val"+index;
                var inputValue = $(inputFieldId).val();
                var operatorFieldId = "#operator"+index;
                var operatorValue = $(operatorFieldId).val();
                var fieldId = "#sel"+index;
                var fieldSelectValue = $(fieldId).val();
                var inputLabelId = "#vLabel"+index;
                var InputLabelValue = $(inputLabelId).val();
                //create path Information
                var brandResultValue = "<KEY FOR Test "+index+">";
                var brandResult = {"branchResult": brandResultValue };
                var labelValue = InputLabelValue;
                var label = {"label": labelValue };
                console.log("argument:"+JSON.stringify(brandResult));
                console.log("metaData:"+JSON.stringify(label));
                var pathInfo = {
                    "arguments":brandResult,
                    "metaData":label
                }
                payload['outcomes'].push(pathInfo);
                console.log("add path==>"+index);
                externalJSON.Field = fieldSelectValue;
                externalJSON.operator = operatorValue;
                externalJSON.Input = inputValue;
                externalJSON.pathName = InputLabelValue;
                externalJSON.pathIndex = index;
                externalJSON.BrandResult = brandResultValue;
                externalJSON.PathCount = pathCount;
                externalArr.push(externalJSON);
            }

            var entrySourceJSON = {};
            entrySourceJSON.External = externalArr;
            console.log("Before entrySourceJSON.External==>"+JSON.stringify(entrySourceJSON.External));
            for(var i = 0; i < entrySchema.length; i++) {
                var fld = entrySchema[i];
                console.log('cx debug fld', JSON.stringify(fld));
                var fieldval = JSON.stringify(fld.key).replaceAll('"','');
                var fieldname = fieldval.split('.')[2];
                console.log('cx debug fieldname ', fieldname);
                console.log('cx debug fieldval ', fieldval);
                entrySourceJSON[fieldname]="{{"+fieldval+"}}";
            }
            console.log("EntrySource JSON==>"+JSON.stringify(entrySourceJSON));
            //payload['arguments'].execute.inArguments.push({[fieldname]: "{{"+fieldval+"}}" });
            payload['arguments'].execute.inArguments.push(entrySourceJSON);
            console.log("Save InArgument==>"+JSON.stringify(payload['arguments'].execute.inArguments));

            //array reverse
            console.log("Before Reserve");
            console.log("outcomes==>"+JSON.stringify(payload['outcomes']));
            payload['outcomes'].reverse();
            console.log("After Reserve");
            console.log("outcomes==>"+JSON.stringify(payload['outcomes']));
        }
        payload['metaData'].isConfigured = true;
        connection.trigger('updateActivity', payload);
    }


    function initOperation(payLoadTemp){
        var hasInArguments = Boolean(
            payLoadTemp['arguments'] &&
            payLoadTemp['arguments'].execute &&
            payLoadTemp['arguments'].execute.inArguments &&
            payLoadTemp['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payLoadTemp['arguments'].execute.inArguments : {};
        //init UI data form
        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {
                console.log("init 1 key==>"+key);
                console.log("init 1 val==>"+val);
            });
        });
    }

    function createHTML(num){
    }

});