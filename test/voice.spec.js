var Promise = require("bluebird");
var expect = require("chai").expect;
var supertest = require("supertest-promised");
var find = require("lodash/find");
var app = require("../app");
var SurveyResponse = require("../models/SurveyResponse");
var agent = supertest(app);

describe("GET /voice", function() {
  beforeEach(function() {
    return SurveyResponse.remove({});
  });

  it("returns a TwiML response with correct message.", function() {
    var requestBody = {
      "Called":"+17070000000",
      "ToState":"CA",
      "CallerCountry":"US",
      "Direction":"inbound",
      "CallerState":"TX",
      "ToZip":"94595",
      "CallSid":"CAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "To":"+17070000000",
      "CallerZip":"",
      "ToCountry":"US",
      "ApiVersion":"2010-04-01",
      "CalledZip":"94595",
      "CalledCity":"WALNUT CREEK",
      "CallStatus":"ringing", "From":"+17370000000", "AccountSid":"AC4XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "CalledCountry":"US",
      "CallerCity":"",
      "Caller":"+17370000000",
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
