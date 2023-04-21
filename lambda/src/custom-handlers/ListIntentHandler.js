const Alexa = require('ask-sdk-core');

const ListIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListIntent';
    },
    async handle(handlerInput){

        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getPersistentAttributes() || {};
        console.log(attributes);

        let speechOutput = `Seus atributos são, nome: ${attributes.nome}, dosagem: ${attributes.dosagem} horas, dias: ${attributes.dias} dias`;

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    }
};

module.export = ListIntentHandler;