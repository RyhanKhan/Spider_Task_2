import dotenv from "dotenv";

dotenv.config({});

import express from "express";
import { google } from "googleapis";
import axios from "axios";
import dayjs from "dayjs";
import _ from "lodash";
import ejs from "ejs";
import bodyParser from "body-parser";

const app = express();

const port = process.env.PORT || 8000;
let posts = [];
let events = [];
const homeStartingContent =
  "Plan your acadmemics and track your expenses here.";

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
});

const scopes = ["https://www.googleapis.com/auth/calendar"];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs", {
    hsc: homeStartingContent,
    ourPosts: posts,
  });
});

app.get("/posts/:titleName", (req, res) => {
  const requestedTitleName = _.lowerCase(req.params.titleName);

  posts.forEach((post) => {
    const storedTitleName = _.lowerCase(post.ourTitle);
    if (requestedTitleName === storedTitleName) {
      res.render("post.ejs", {
        postTitle: post.ourTitle,
        postCourse: post.ourCourse,
        postDueDate: post.ourDueDate,
        postContent: post.ourBody,
      });
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about.ejs", {
    ac: aboutContent,
  });
});

app.get("/compose", (req, res) => {
  res.render("compose.ejs");
});

app.post("/compose", (req, res) => {
  const ourData = {
    ourTitle: req.body.assignmentName,
    ourCourse: req.body.courseName,
    ourDueDate: req.body.dueDate,
    ourBody: req.body.assignmentBody,
  };

  posts.push(ourData);
  console.log(ourData);

  res.redirect("/");
});

app.get("/login", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(url);
});

app.get("/google/redirect", async (req, res) => {
  const code = req.query.code;

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  res.redirect("/");
});

app.get("/schedule_event", (req, res) => {
  events.forEach((event) => {
    let variableSummary = event.ourSummary;
    let variableDescription = event.ourDescription;
    let variableEventDate = event.ourEventDate;
    let variableEventTime = event.ourTime;
    let variableTimeDuration = event.ourTimeDuration;

    let datetimeString = `${variableEventDate}T${variableEventTime}:00`;

    calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: variableSummary,
        description: variableDescription,
        start: {
          dateTime: datetimeString,
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: dayjs(datetimeString).add(variableTimeDuration, "hour")
            .toISOString(),
          timeZone: "Asia/Kolkata",
        },
        reminders: {
            useDefault: false,
            overrides: [
              {
                method: "popup",
                minutes: 30, // Set the reminder to be 30 minutes before the event
              }
            ],
          },
      },
    });

  });

  res.redirect("/");
  events = [];
});

app.get("/schedule", (req, res) => {
  res.render("schedule.ejs");
});

app.post("/schedule", (req, res) => {
  const scheduleData = {
    ourEventDate: req.body.whichDate,
    ourSummary: req.body.summary,
    ourDescription: req.body.description,
    ourTime: req.body.whatTime,
    ourTimeDuration: req.body.timeDuration,
  };

  events.push(scheduleData);
  console.log(events);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
