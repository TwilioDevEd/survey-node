var SurveyResponse = require('../models/SurveyResponse');
var survey = require('../survey_data');

// Grab all the latest survey data for display in a quick and dirty UI
module.exports = function(request, response) {
    SurveyResponse.find({
        complete: true
    }).limit(100).exec(function(err, docs) {
        if (err) {
            response.status(500).send(err);
        } else {
            response.send({
                survey: survey,
                results: docs
            });
        }
    });
};