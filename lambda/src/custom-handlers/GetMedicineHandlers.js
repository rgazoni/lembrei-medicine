const Alexa = require('ask-sdk-core');

const CreateMedicineIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CreateMedicineIntent';
    },
    async handle(handlerInput) {
        const speechOutput = "Remédio cadastrado com sucesso!";

        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getPersistentAttributes() || {};

        const data = {
                "nome": handlerInput.requestEnvelope.request.intent.slots.name.value,
                "dosagem": handlerInput.requestEnvelope.request.intent.slots.dosage.value,
                "frequencia": handlerInput.requestEnvelope.request.intent.slots.frequency.value,
                "dias": handlerInput.requestEnvelope.request.intent.slots.total_time.value,
                "tomou_remedio": 0,
                "tomou_remedio_timestamp": null
        };
        
        if(Object.keys(attributes).length === 0) {
            attributesManager.setPersistentAttributes({
                "medicines": [ data ]  
            });
        } else {
            attributes.medicines.push(data);
            attributesManager.setPersistentAttributes(attributes);
        }

        await attributesManager.savePersistentAttributes();

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    }
};



module.exports = {
    CreateMedicineIntentHandler,
}
