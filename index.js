
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
const FeedingDemoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FeedingDemoIntent';
    },
    handle(handlerInput) {
        const foodItem = Alexa.getSlotValue(handlerInput.requestEnvelope, 'FOOD_ITEMS');
        const action = Alexa.getSlotValue(handlerInput.requestEnvelope, 'ACTION');
        // publish message to ROS
        if (foodItem) {
            console.log(foodItem.split(' ').join('_'));
            var food_msg = new ROSLIB.Message({
                data : foodItem.split(' ').join('_')
            });
            food_topic.publish(food_msg);
        } else if (action) {
            console.log(action.split(' ').join('_'));
            var action_msg = new ROSLIB.Message({
                data : action.split(' ').join('_')
            });
            action_topic.publish(action_msg);
        } else {
            console.log(`Got Request!`);
            var action_msg = new ROSLIB.Message({
                data : `continue`
            });
            action_topic.publish(action_msg);
        }
        

        return handlerInput.responseBuilder
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
        const speakOutput = 'Goodbye!';
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
    .withSkillId("amzn1.ask.skill.de2d670d-76ee-4fe1-bd41-01bc896c0cb3")
    .addRequestHandlers(
        LaunchRequestHandler,
        FeedingDemoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler,
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
    console.log('Connected to websocket server.');
});

ros.on('error', function(error) {
    console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function() {
    console.log('Connection to websocket server closed.');
});

var food_topic = new ROSLIB.Topic({
    ros: ros, 
    name: '/study_food_msgs', 
    messageType: 'std_msgs/String'
});

var action_topic = new ROSLIB.Topic({
    ros: ros, 
    name: '/study_action_msgs', 
    messageType: 'std_msgs/String'
});

// Advertise topics
food_topic.advertise();
action_topic.advertise();
