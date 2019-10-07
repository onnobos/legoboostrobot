/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');

const config = require('./config')

const ERRORMSG = "Oops. Something went wrong.";

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    var iotdata = new AWS.IotData({endpoint: config.endpoint});

    var params = {
      thingName: 'PiZeroRobotHub' /* required */
    };

    var speechText = 'Welcome to the Lego Boost Robot, Click the button on your robot and say "connect" to start connecting';


    return new Promise((resolve) => {
      iotdata.getThingShadow(params, function(err, data) {
        if (err) {
          console.log("getThingShadow error", err, err.stack); // an error occurred
          resolve(handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse());
        }
        else {
          console.log("getThingShadow succes", data.payload); // successful response
          var payload = JSON.parse(data.payload);
          console.log("payload", payload.state.desired.btconnected);
          if(payload.state.desired.btconnected) {
            speechText = "Say a command for the Robot.";
          };
          resolve(handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse());
        }
      });
    });

  },
};


const ConnectRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'Connect';
  },
  handle(handlerInput) {
    const speechText = 'If the color is green. I can give your robot commands.';

    var payload = { "robotcmd": "connect", "robotaction":""};

    var params = {
      topic: 'LegoBoostRobot', /* required */
      payload: JSON.stringify(payload) /* Strings will be Base-64 encoded on your behalf */,
      qos: 0
    };

    var iotdata = new AWS.IotData({endpoint: config.endpoint});

    return new Promise((resolve) => {
      iotdata.publish(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          resolve(handlerInput.responseBuilder.speak(ERRORMSG).getResponse()) ;
        } else {
          console.log("iotdata.publish succesfully", params)
          resolve(handlerInput.responseBuilder.speak(speechText).getResponse());
        }
      });

    });

  },
};

const MovingRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'Moving';
  },
  handle(handlerInput) {
    const speechText = 'Lets drive';

    var payload = { "robotcmd": "connect", "robotaction":"15"};

    var params = {
      topic: 'LegoBoostRobot', /* required */
      payload: JSON.stringify(payload) /* Strings will be Base-64 encoded on your behalf */,
      qos: 0
    };

    var iotdata = new AWS.IotData({endpoint: config.endpoint});

    return new Promise((resolve) => {
      iotdata.publish(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          resolve(handlerInput.responseBuilder.speak(ERRORMSG).getResponse()) ;
        } else {
          console.log("iotdata.publish succesfully", params)
          resolve(handlerInput.responseBuilder.speak(speechText).getResponse());
        }
      });

    });

  },
};

const ColorsRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'Colors';
  },
  handle(handlerInput) {

    const request = handlerInput.requestEnvelope.request;

    let color = "blue";
    if (request.intent.slots.color.value && request.intent.slots.color.value !== "?") {
        color = request.intent.slots.color.value;
    }

    const speechText = 'Check it out! I have set the color to ' + color +' on the robot.';

    var payload = { "robotcmd": "light", "robotaction":color};

    var params = {
      topic: 'LegoBoostRobot', /* required */
      payload: JSON.stringify(payload) /* Strings will be Base-64 encoded on your behalf */,
      qos: 0
    };

    var iotdata = new AWS.IotData({endpoint: 'a2rgeifpr1fb5x-ats.iot.eu-west-1.amazonaws.com'});

    return new Promise((resolve) => {
      iotdata.publish(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          resolve(handlerInput.responseBuilder.speak(ERRORMSG).getResponse()) ;
        } else {
          console.log("iotdata.publish succesfully", params)
          resolve(handlerInput.responseBuilder.speak(speechText).getResponse());
        }
      });

    });

  },
};

const RoutineIntentRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RoutineIntent';
  },
  handle(handlerInput) {

    const request = handlerInput.requestEnvelope.request;

    console.log("request", JSON.stringify(request));

    let routine = "shakinghead";
    if (request.intent.slots.routine.value && request.intent.slots.routine.value !== "?") {
        routine = request.intent.slots.routine.resolutions.resolutionsPerAuthority[0].values[0].value.id;
    }

    const speechText = 'The robot will start '+routine+' for you. Enjoy!';

    var payload = { "robotcmd": routine, "robotaction":""};

    var params = {
      topic: 'LegoBoostRobot', /* required */
      payload: JSON.stringify(payload) /* Strings will be Base-64 encoded on your behalf */,
      qos: 0
    };

    var iotdata = new AWS.IotData({endpoint: config.endpoint});

    return new Promise((resolve) => {
      iotdata.publish(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          resolve(handlerInput.responseBuilder.speak(ERRORMSG).getResponse()) ;
        } else {
          console.log("iotdata.publish succesfully", params)
          resolve(handlerInput.responseBuilder.speak(speechText).getResponse());
        }
      });

    });

  },
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say for example "please can you spin"!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'I am sad. However I will say goodbye to my friend the robot!';

    var payload = { "robotcmd": "disconnect", "robotaction":""};

    var params = {
      topic: 'LegoBoostRobot', /* required */
      payload: JSON.stringify(payload) /* Strings will be Base-64 encoded on your behalf */,
      qos: 0
    };

    var iotdata = new AWS.IotData({endpoint: 'a2rgeifpr1fb5x-ats.iot.eu-west-1.amazonaws.com'});
    return new Promise((resolve) => {

      iotdata.publish(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
        } else {
          console.log("iotdata.publish succesfully", params)
        }

        resolve(handlerInput.responseBuilder.speak(speechText).getResponse());
      });
    });

  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    MovingRequestHandler,
    ColorsRequestHandler,
    RoutineIntentRequestHandler,
    ConnectRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
