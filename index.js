const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'What can I help you with?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const InProgressFeedingDemoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FeedingDemoIntent'
            && Alexa.getDialogState(handlerInput.requestEnvelope) !== 'COMPLETED';
    },
    handle(handlerInput) {
        const currentIntent = Alexa.getIntentName(handlerInput.requestEnvelope);

        const speakOutput = 'Say it one more time.';
        const foodItem = Alexa.getSlotValue(handlerInput.requestEnvelope, 'FOOD_ITEMS');

        console.log('food: %s', foodItem);

        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .reprompt(speakOutput)
            .speak(speakOutput)
            .getResponse();
    }
};
const CompletedFeedingDemoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FeedingDemoIntent'
            && Alexa.getDialogState(handlerInput.requestEnvelope) === 'COMPLETED';
    },
    handle(handlerInput) {
        var speakOutput;
        const foodItem = Alexa.getSlotValue(handlerInput.requestEnvelope, 'FOOD_ITEMS');
        // publish message to ROS
        msg_topic.advertise();
        var str = new ROSLIB.Message({
            data : foodItem
        });
        msg_topic.publish(str);

        console.log('food: %s', foodItem);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        var speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    // .withSkillId("amzn1.ask.skill.de2d670d-76ee-4fe1-bd41-01bc896c0cb3")
    .addRequestHandlers(
        LaunchRequestHandler,
        InProgressFeedingDemoIntentHandler,
        CompletedFeedingDemoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
        )
    .addErrorHandlers(
        ErrorHandler,
        )
    .lambda();


// Connecting to ROS
var ROSLIB = require('roslib');

// rosbridge_websocket defaults to port 9090
var ros = new ROSLIB.Ros({
    url: 'ws://localhost:9090'
});

ros.on('connection', function() {
    console.log('publish-example: Connected to websocket server.');
});

ros.on('error', function(error) {
    console.log('publish-example: Error connecting to websocket server: ', error);
});

ros.on('close', function() {
    console.log('publish-example: Connection to websocket server closed.');
});

var msg_topic = new ROSLIB.Topic({
    ros: ros, 
    name: '/alexa_msgs', 
    messageType: 'std_msgs/String'
});
