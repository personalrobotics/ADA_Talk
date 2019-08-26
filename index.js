
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
        const approach = Alexa.getSlotValue(handlerInput.requestEnvelope, 'BRING_FOOD');
        const feedAngle = Alexa.getSlotValue(handlerInput.requestEnvelope, 'FEED_ANGLE');
        // publish message to ROS
        if (foodItem) {
            console.log(foodItem);
            food_topic.advertise();
            var food_msg = new ROSLIB.Message({
                data : foodItem
            });
            food_topic.publish(food_msg);
        }
        if (action) {
            console.log(action);
            action_topic.advertise();
            var action_msg = new ROSLIB.Message({
                data : action
            });
            action_topic.publish(action_msg);
        }
        if (approach) {
            console.log("bring food");
            bring_food_topic.advertise();
            var bring_food_msg = new ROSLIB.Message({
                data : 'ok'
            });
            bring_food_topic.publish(bring_food_msg);
        }
        if (feedAngle) {
            console.log("feed angle");
            feed_angle_topic.advertise();
            var feed_angle_msg = new ROSLIB.Message({
                data : feedAngle
            });
            feed_angle_topic.publish(feed_angle_msg);
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
    name: '/alexa_food_msgs', 
    messageType: 'std_msgs/String'
});

var action_topic = new ROSLIB.Topic({
    ros: ros, 
    name: '/alexa_action_msgs', 
    messageType: 'std_msgs/String'
});

var bring_food_topic = new ROSLIB.Topic({
    ros: ros, 
    name: '/alexa_bring_food_msgs', 
    messageType: 'std_msgs/String'
});

var feed_angle_topic = new ROSLIB.Topic({
    ros: ros, 
    name: '/alexa_feed_angle_msgs', 
    messageType: 'std_msgs/String'
});