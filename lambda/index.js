/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

// Default Handlers by Alexa template
const CancelAndStopIntentHandler = require('./src/default-handlers/CancelAndStopIntentHandler')
const ErrorHandler = require('./src/default-handlers/ErrorHandler')
const FallbackIntentHandler = require('./src/default-handlers/FallbackIntentHandler')
const HelpIntentHandler = require('./src/default-handlers/HelpIntentHandler')
const IntentReflectorHandler = require('./src/default-handlers/IntentReflectorHandler')
const SessionEndedRequestHandler = require('./src/default-handlers/SessionEndedRequestHandler')


//Custom Handlers
const  { CreateMedicineIntentHandler } = require('./src/custom-handlers/GetMedicineHandlers');


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        console.debug("~~~ DEBUG: LaunchRequestHandler function started");
        const speakOutput = 'Bem vindo ao Lembrei, uma skill Alexa que vai te ajudar a tomar seus remédios na hora certa. Para cadastrar um ' + 
                        'remédio fale Cadastrar Remédio, para tomar remédio fale Tomar Remédio, para listar remédios tomados fale Listar remédios';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const TakeMedicineIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TakeMedicineIntent';
    },

    async handle(handlerInput) {

        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getPersistentAttributes() || {};
        const medicineInputed = handlerInput.requestEnvelope.request.intent.slots.medicineName.value;
        let speechOutput = "";
        
        if(Object.keys(attributes).length !== 0) {
            const medicines = attributes.medicines;
            const medicine = medicines.find(item => item.nome === medicineInputed);
            // ----------     ----------- //
            speechOutput = `A dosagem do remédio a ser tomado é de ${medicine.dosagem}. Iremos te lembrar de tomar da próxima vez, até o fim do período estipulado.`;
            medicine.tomou_remedio = 1;
            medicine.tomou_remedio_timestamp = Date.now() 
        } else {
            // Remedio não cadastrado
        }
        
        await attributesManager.savePersistentAttributes();
        
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    }
}

const TookMedicineIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TookMedicineIntent';
    },

    async handle(handlerInput) {

        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getPersistentAttributes() || {};
        let speechOutput = "";
        
        if(Object.keys(attributes).length !== 0) {
            speechOutput = "Seus remédios são: ";
            const medicines = attributes.medicines;
            const medicine = medicines.forEach(element => {
                if(element.tomou_remedio === 1){
                    speechOutput = speechOutput + " " + element.nome;
                }
            });
        } else {
            speechOutput = "Você não tem nenhum remédio cadastrado ainda!";
        }
        
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    }
}

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CreateMedicineIntentHandler,
        TakeMedicineIntentHandler,
        TookMedicineIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withPersistenceAdapter(
        new ddbAdapter.DynamoDbPersistenceAdapter({
            tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
            createTable: false,
            dynamoDBClient: new AWS.DynamoDB({apiVersion: 'latest', region: process.env.DYNAMODB_PERSISTENCE_REGION})
        })
    )
    .lambda();
    