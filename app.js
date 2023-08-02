//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require("lodash");

let posts = [];

const homeStartingContent =
  "Plan your acadmemics and track your expenses here.";
const aboutContent =
  "Ryhan Khan, 112122052";

const app = express();

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

  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
