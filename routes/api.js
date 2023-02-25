"use strict";

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

let issueSchema = new mongoose.Schema(
  {
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_on: Date,
    updated_on: Date,
    created_by: { type: String, required: true },
    assigned_to: String,
    open: Boolean,
    status_text: String,
  },
  { versionKey: false }
);

let projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issues: [issueSchema],
  },
  { versionKey: false }
);

const Issue = mongoose.model("Issue", issueSchema);
const Project = mongoose.model("Project", projectSchema, "projects");

module.exports = function (app) {
  app
    .route("/api/issues/:project")
    .get(function (req, res) {
      let project = req.params.project;
      let issueId = req.query["_id"]; //required
      let issueTitle = req.query["issue_title"];
      let issueText = req.query["issue_text"];
      let createdBy = req.query["created_by"];
      let assignedTo = req.query["assigned_to"];
      let statusText = req.query["status_text"];
      let openCheck = req.query["open"];

      Project.aggregate([
        { $match: { name: project } },
        { $unwind: "$issues" },
        issueId != undefined
          ? { $match: { "issues._id": ObjectId(issueId) } }
          : { $match: {} },
        openCheck != undefined
          ? { $match: { "issues.open": openCheck } }
          : { $match: {} },
        issueTitle != undefined
          ? { $match: { "issues.issue_title": issueTitle } }
          : { $match: {} },
        issueText != undefined
          ? { $match: { "issues.issue_text": issueText } }
          : { $match: {} },
        createdBy != undefined
          ? { $match: { "issues.created_by": createdBy } }
          : { $match: {} },
        assignedTo != undefined
          ? { $match: { "issues.assigned_to": assignedTo } }
          : { $match: {} },
        statusText != undefined
          ? { $match: { "issues.status_text": statusText } }
          : { $match: {} },
      ]).exec((err, data) => {
        if (!data) {
          res.json([]);
        } else {
          let mappedData = data.map((item) => item.issues);
          res.json(mappedData);
        }
      });
    })

    .post(function (req, res) {
      let project = req.params.project;
      let issueTitle = req.body["issue_title"]; //required
      let issueText = req.body["issue_text"]; //required
      let createdBy = req.body["created_by"]; //required
      let assignedTo = req.body["assigned_to"];
      let statusText = req.body["status_text"];

      if (!assignedTo) {
        assignedTo = "";
      }
      if (!statusText) {
        statusText = "";
      }
      if (!issueTitle || !issueText || !createdBy) {
        res.json({ error: "required field(s) missing" });
        return;
      }

      let actualTimeISO = new Date().toISOString();

      let newIssue = new Issue({
        issue_title: issueTitle,
        issue_text: issueText,
        created_on: actualTimeISO,
        updated_on: actualTimeISO,
        created_by: createdBy,
        assigned_to: assignedTo,
        open: true,
        status_text: statusText,
      });

      Project.findOne({ name: project }, function (err, findResult) {
        if (err) {
          console.log(err);
        } else if (!findResult) {
          console.log("no find result");
          let newProject = new Project({ name: project });
          console.log("Issue to be added:");
          console.log(newIssue);
          newProject.issues.push(newIssue);
          newProject.save((err, saveResult) => {
            if (err || !saveResult) {
              res.send("Post error 1");
            } else {
              console.log(newIssue);
              res.json(newIssue);
            }
          });
        } else {
          findResult.issues.push(newIssue);
          findResult.save((err, data) => {
            if (err || !data) {
              res.send("Post error 2");
            } else {
              console.log(newIssue);
              res.json(newIssue);
            }
          });
        }
      });
    })

    .put(function (req, res) {
      let project = req.params.project;
      let issueId = req.body["_id"]; //required
      let issueTitle = req.body["issue_title"];
      let issueText = req.body["issue_text"];
      let createdBy = req.body["created_by"];
      let assignedTo = req.body["assigned_to"];
      let statusText = req.body["status_text"];
      let openCheck = req.body["open"];
      let actualTimeISO = new Date().toISOString();

      if (!issueId) {
        res.json({ error: "missing _id" });
        return;
      } else if (
        !issueTitle &&
        !issueText &&
        !createdBy &&
        !assignedTo &&
        !statusText &&
        !openCheck
      ) {
        res.json({ error: "no update field(s) sent", _id: issueId });
        return;
      }

      Project.findOne({ name: project }, function (err, findResult) {
        if (err || !findResult) {
          res.json({ error: "could not update", _id: issueId });
        } else {
          let foundData = findResult.issues.id(issueId);
          if (!foundData) {
            res.json({ error: "could not update", _id: issueId });
            return;
          }
          foundData.issue_title = issueTitle || foundData.issue_title;
          foundData.issue_text = issueText || foundData.issue_text;
          foundData.created_by = createdBy || foundData.created_by;
          foundData.assigned_to = assignedTo || foundData.assigned_to;
          foundData.status_text = statusText || foundData.status_text;
          foundData.updated_on = actualTimeISO;
          console.log(openCheck);
          if (openCheck == false) {
            foundData.open = false;
          } else {
            foundData.open = true;
          }
          findResult.save((err, data) => {
            if (err || !data) {
              res.json({ error: "could not update", _id: issueId });
            } else {
              res.json({ result: "successfully updated", _id: issueId });
            }
          });
        }
      });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      let issueId = req.body["_id"];

      if (!issueId) {
        res.json({ error: "missing _id" });
        return;
      }

      Project.findOne({ name: project }, function (err, findResult) {
        if (err || !findResult) {
          res.json({ error: "could not delete", _id: issueId });
        } else {
          let foundData = findResult.issues.id(issueId);
          if (!foundData) {
            res.json({ error: "could not delete", _id: issueId });
            return;
          }
          foundData.remove();

          findResult.save((err, data) => {
            if (err || !data) {
              res.json({ error: "could not delete", _id: issueId });
            } else {
              res.json({ result: "successfully deleted", _id: issueId });
            }
          });
        }
      });
    });
};
