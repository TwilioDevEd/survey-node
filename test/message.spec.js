var Promise = require("bluebird");
var expect = require("chai").expect;
var supertest = require("supertest-promised");
var find = require("lodash/find");
var app = require("../app");
var SurveyResponse = require("../models/SurveyResponse");
var agent = supertest(app);
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

describe("POST /message", function() {
  beforeEach(function() {
    return SurveyResponse.remove({})
    .then(() => console.log("### delete all"))
  });

  it("returns a greeting and a question on first survey attempt", function() {
    return agent.post("/message")
      .type("form")
      .send({
        From: "+15555555555",
        Body: "Message body",
      })
      .expect("Content-Type", /text\/xml/)
      .expect(200)
      .expect(function(res) {
        var doc = new dom().parseFromString(res.text);
        var MessageTxt = xpath.select("/Response/Message/text()", doc)[0].data;

        expect(MessageTxt).to
          .contain("Thank you for taking our survey! Please tell us your age.");
      });
  });

  it("returns a goodbye after the final step in the survey.", function() {
    function step1() {
      return agent.post("/message")
        .type("form")
        .send({
          From: "+15555555555",
          Body: "Message body",
        })
        .expect("Content-Type", /text\/xml/)
        .expect(200)
        .end();
    }

    function step2() {
      return agent.post("/message")
        .type("form")
        .send({
          From: "+15555555555",
          Body: "33",
        })
        .expect("Content-Type", /text\/xml/)
        .expect(200)
        .expect(function(res) {
          var doc = new dom().parseFromString(res.text);
          var MessageTxt = xpath.select("/Response/Message/text()", doc)[0].data;

          expect(MessageTxt).to
          .contain("Have you ever jump-kicked a lemur? Type \"yes\" or \"no\".");

          return;
        })
        .end();
    };

    function step3() {
      return agent.post("/message")
        .type("form")
        .send({
          From: "+15555555555",
          Body: "yes",
        })
        .expect("Content-Type", /text\/xml/)
        .expect(200)
        .expect(function(res) {
          var doc = new dom().parseFromString(res.text);
          var MessageTxt = xpath.select("/Response/Message/text()", doc)[0].data;

          expect(MessageTxt).to
          .contain("Who is your favorite Teenage Mutant Ninja Turtle and why?");
          return;
        })
        .end();
    };

    function step4() {
      return agent.post("/message")
        .type("form")
        .send({
          From: "+15555555555",
          Body: "rafael",
        })
        .expect("Content-Type", /text\/xml/)
        .expect(200)
        .expect(function(res) {
          var doc = new dom().parseFromString(res.text);
          var MessageTxt = xpath.select("/Response/Message/text()", doc)[0].data;

          expect(MessageTxt).to
          .contain("Thank you for taking this survey. Goodbye!");
          return;
        })
        .end();
    };

    var steps = [step1, step2, step3, step4];

    return Promise.each(steps, function(step) {
      return step();
    });
  });
});
