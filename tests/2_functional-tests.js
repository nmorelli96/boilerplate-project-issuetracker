const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let idToBeDeleted = "";

suite("Functional Tests", function () {
  suite("POST", function () {
    test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/testingproject")
        .send({
          issue_title: "Test Issue",
          issue_text: "Test text",
          created_by: "FCC",
          assigned_to: "FCC",
          status_text: "Test",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(res.body.issue_title, "Test Issue");
          assert.equal(res.body.issue_text, "Test text");
          assert.equal(res.body.created_by, "FCC");
          assert.equal(res.body.assigned_to, "FCC");
          assert.equal(res.body.status_text, "Test");
          done();
        });
    });
    test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/testingproject")
        .send({
          issue_title: "Test Issue",
          issue_text: "Test text",
          created_by: "FCC",
          assigned_to: "",
          status_text: "",
        })
        .end(function (err, res) {
          idToBeDeleted = res.body._id;
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(res.body.issue_title, "Test Issue");
          assert.equal(res.body.issue_text, "Test text");
          assert.equal(res.body.created_by, "FCC");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          done();
        });
    });
    test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/testingproject")
        .send({
          issue_title: "Test Issue",
          issue_text: "",
          created_by: "",
          assigned_to: "",
          status_text: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });
  suite("GET", function () {
    test("View issues on a project: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/prueba")
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(res.body.length, 3);
          done();
        });
    });
    test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/prueba")
        .query({
          _id: "63fa6af58aa81389bb11952e",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.deepEqual(res.body[0], {
            issue_title: "titulo",
            issue_text: "hola",
            created_on: "2023-02-25T20:09:25.245Z",
            updated_on: "2023-02-25T20:09:25.245Z",
            created_by: "nmorelli96",
            assigned_to: "",
            open: true,
            status_text: "",
            _id: "63fa6af58aa81389bb11952e",
          });
          done();
        });
    });
    test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/prueba")
        .query({
          issue_title: "titulo",
          issue_text: "hola",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.deepEqual(res.body[0], {
            issue_title: "titulo",
            issue_text: "hola",
            created_on: "2023-02-25T20:09:25.245Z",
            updated_on: "2023-02-25T20:09:25.245Z",
            created_by: "nmorelli96",
            assigned_to: "",
            open: true,
            status_text: "",
            _id: "63fa6af58aa81389bb11952e",
          });
          done();
        });
    });
  });
  suite("PUT", function () {
    test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/testingproject2")
        .send({
          _id: "63fa6cad89cf612f0cbb6c29",
          issue_title: "titulo2",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, "63fa6cad89cf612f0cbb6c29");
          done();
        });
    });
    test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/testingproject2")
        .send({
          _id: "63fa6cad89cf612f0cbb6c29",
          issue_title: "titulo3",
          issue_text: "bye",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, "63fa6cad89cf612f0cbb6c29");
          done();
        });
    });
    test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/testingproject2")
        .send({
          issue_title: "titulo3",
          issue_text: "bye",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
    test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/testingproject2")
        .send({
          _id: "63fa6cad89cf612f0cbb6c29",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(res.body.error, "no update field(s) sent");
          done();
        });
    });
    test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/testingproject2")
        .send({
          _id: "65634643634",
          issue_text: "hello",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(res.body.error, "could not update");
          done();
        });
    });
  });
  suite("DELETE", function () {
    test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/testingproject")
        .send({
          _id: idToBeDeleted,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(res.body.result, "successfully deleted");
          done();
        });
    });
    test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/testingproject")
        .send({
          _id: "68adf654daf645",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(res.body.error, "could not delete");
          done();
        });
    });
    test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/testingproject")
        .send({
          _id: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
