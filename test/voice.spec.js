var Promise = require("bluebird");
var expect = require("chai").expect;
var supertest = require("supertest-promised");
var parseXML = require("xml-parser");
var find = require("lodash/find");
var app = require("../app");
var SurveyResponse = require("../models/SurveyResponse");
var agent = supertest(app);

describe("GET /voice", function() {
  beforeEach(function() {
    return SurveyResponse.remove({});
  });

  it("Should return a goodbye after the final step in the survey.", function() {
    var requestBody = {
      "Called":"+17072053552",
      "ToState":"CA",
      "CallerCountry":"US",
      "Direction":"inbound",
      "CallerState":"TX",
      "ToZip":"94595",
      "CallSid":"CAf20aef736dccc79518789334ba8f73f3",
      "To":"+17072053552",
      "CallerZip":"",
      "ToCountry":"US",
      "ApiVersion":"2010-04-01",
      "CalledZip":"94595",
      "CalledCity":"WALNUT CREEK",
      "CallStatus":"ringing", "From":"+17378742833", "AccountSid":"AC4ee8a4bf66c95837fc46316395718baa",
      "CalledCountry":"US",
      "CallerCity":"",
      "Caller":"+17378742833",
      "FromCountry":"US",
      "ToCity":"WALNUT CREEK",
      "FromCity":"",
      "CalledState":"CA",
      "FromZip":"",
      "FromState":"TX"
    };

    return agent.post("/voice")
      .send(requestBody)
      .expect("Content-Type", /text\/xml/)
      .expect(200)
      .expect(function(res) {
        expect(res.text).to.contain("Thank you for taking our survey. Please listen carefully to the following questions.")
      })
      .end()
  });
});
