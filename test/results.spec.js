var Promise = require("bluebird");
var expect = require("chai").expect;
var supertest = require("supertest-promised");
var find = require("lodash/find");
var app = require("../app");
var SurveyResponse = require("../models/SurveyResponse");
var agent = supertest(app);
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

describe("GET /message", function() {
  beforeEach(function() {
    function clearDb() {
      return SurveyResponse.remove({})
    }

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

    var steps = [clearDb, step1, step2, step3, step4];

    return Promise.each(steps, function(step) {
      return step();
    });
  });

  it("Returns a response with list of questions and answers.", function() {
    var response = {
      "survey":[
        {"text":"Please tell us your age.","type":"number"},
        {"text":"Have you ever jump-kicked a lemur?","type":"boolean"},
        {"text":"Who is your favorite Teenage Mutant Ninja Turtle and why?","type":"text"},
      ],
      "results":[
        {
          "phone":"+15555555555",
          "__v":3,
          "responses":[
            {"type":"number","answer":33},
            {"type":"boolean","answer":true},
            {"type":"text","answer":"rafael"},
          ],
          "complete":true,
        }
      ]
    };

    return agent.get("/results")
      .expect("Content-Type", /application\/json/)
      .expect(200)
      .expect(function(res) {
        var body = res.body;

        body.results.forEach(function(result) {
          delete result._id;
        });

        expect(body).to.deep.equal(response);
      })
      .end()
  });
});
