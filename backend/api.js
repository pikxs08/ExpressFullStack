const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Body Parser Middleware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Get Json data
app.get("/api", (req, res) => {
  fs.readFile("web-projects.json", (err, data) => {
    if (err) {
      console.log("Error getting data");
    } else {
      const jsonData = JSON.parse(data);
      res.send(jsonData);
    }
  });
});

// Get all projects

function getProjects() {
  try {
    const projects = fs.readFileSync("web-projects.json");
    return JSON.parse(projects);
  } catch (e) {
    // file non-existent
    fs.writeFileSync("web-projects.json", "[]");
    return [];
  }
}

function addProject(id, title, description, url) {
  const projects = getProjects();
  projects.push({
    id: id,
    title: title,
    description: description,
    URL: url,
  });
  fs.writeFileSync("web-projects.json", JSON.stringify(projects));
}

// Post New entry

app.post("/post", (req, res) => {
  const projects = getProjects();
  const newTitle = req.body.title;
  const newDescription = req.body.description;
  const newURL = req.body.projectUrl;

  // Check if the project already exists
  const projectExists = projects.some((project) => project.title === newTitle);

  if (projectExists) {
    res.status(400).json({ error: "Project already exists!" });
  } else {
    // If project doesn't exist, add it
    const newId = projects.length + 1;
    addProject(newId, newTitle, newDescription, newURL);
    const newProject = {
      id: newId,
      title: newTitle,
      description: newDescription,
      URL: newURL,
    };
    res.status(201).json(newProject);
  }
});

app.put("/put/:id", (req, res) => {
  const projects = getProjects();
  const projectId = parseInt(req.params.id);
  const updatedTitle = req.body.title;
  const updatedDescription = req.body.description;
  const updatedURL = req.body.URL;

  // Find index of project
  const projectIndex = projects.findIndex(
    (project) => project.id === projectId
  );

  // If project exists, update it
  if (projectIndex > -1) {
    projects[projectIndex].title = updatedTitle;
    projects[projectIndex].description = updatedDescription;
    projects[projectIndex].URL = updatedURL;
    fs.writeFileSync("web-projects.json", JSON.stringify(projects));
    res.json(projects[projectIndex]); // Send back the updated project
  } else {
    res.status(404).send("Project does not exist!");
  }
});

// Delete project

app.delete("/delete/:id", (req, res) => {
  const projects = getProjects();
  const projectId = parseInt(req.params.id);

  // Find index of project
  const projectIndex = projects.findIndex(
    (project) => project.id === projectId
  );

  // If project exists, delete it
  if (projectIndex > -1) {
    projects.splice(projectIndex, 1);
    fs.writeFileSync("web-projects.json", JSON.stringify(projects));
    res.json({ message: "Project deleted!" });
  } else {
    res.status(404).send("Project does not exist!");
  }
});
