var twilio = require('twilio');
var SurveyResponse = require('../models/SurveyResponse');
var survey = require('../survey_data');

// Handle SMS submissions
module.exports = function(request, response) {
    var phone = request.body.From;
    var input = request.body.Body;
    
    // respond with message TwiML content
    function respond(message) {
        var twiml = new twilio.TwimlResponse();
        twiml.message(message);
        response.type('text/xml');
        response.send(twiml.toString());
    }

    // Check if there are any responses for the current number in an incomplete
    // survey response
    SurveyResponse.findOne({
        phone: phone,
        complete: false
    }, function(err, doc) {
        if (!doc) {
            var newSurvey = new SurveyResponse({
                phone: phone
            });
            newSurvey.save(function(err, doc) {
                // Skip the input and just ask the first question
                handleNextQuestion(err, doc, 0);
            });
        } else {
            // After the first message, start processing input
            SurveyResponse.advanceSurvey({
                phone: phone,
                input: input,
                survey: survey
            }, handleNextQuestion);
        }
    });

    // Ask the next question based on the current index
    function handleNextQuestion(err, surveyResponse, questionIndex) {
        var question = survey[questionIndex];
        var responseMessage = '';

        if (err || !surveyResponse) {
            return respond('Terribly sorry, but an error has occurred. '
                + 'Please retry your message.');
        }

        // If question is null, we're done!
        if (!question) {
            return respond('Thank you for taking this survey. Goodbye!');
        }

        // Add a greeting if this is the first question
        if (questionIndex === 0) {
            responseMessage += 'Thank you for taking our survey! ';
        }

        // Add question text
        responseMessage += question.text;

        // Add question instructions for special types
        if (question.type === 'boolean') {
            responseMessage += ' Type "yes" or "no".';
        }

        // reply with message
        respond(responseMessage);
    }
};