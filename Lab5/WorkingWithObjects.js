const assignment = {
  id: 1,
  title: "NodeJS Assignment",
  description: "Create a NodeJS server with ExpressJS",
  due: "2021-10-10",
  completed: false,
  score: 0,
};

const module = {
  id: "mod101",
  name: "Web Development",
  description: "Covers HTML, CSS, JS basics",
  course: "CS5610",
};

export default function WorkingWithObjects(app) {
  const getAssignment = (req, res) => {
    res.json(assignment);
  };
  const getAssignmentTitle = (req, res) => {
    res.json(assignment.title);
  };
  app.get("/lab5/assignment/title", getAssignmentTitle);
  app.get("/lab5/assignment", getAssignment);
  //
  const setAssignmentTitle = (req, res) => {
    const { newTitle } = req.params;
    assignment.title = newTitle;
    res.json(assignment);
  };
  app.get("/lab5/assignment/title/:newTitle", setAssignmentTitle);
  //

  const setAssignmentScore = (req, res) => {
    const { newScore } = req.params;
    assignment.score = parseInt(newScore);
    res.json(assignment);
  };

  const setAssignmentCompleted = (req, res) => {
    const { status } = req.params;
    assignment.completed = status === "true";
    res.json(assignment);
  };

  app.get("/lab5/assignment/score/:newScore", setAssignmentScore);
  app.get("/lab5/assignment/completed/:status", setAssignmentCompleted);

  const getModule = (req, res) => {
    res.json(module);
  };

  const getModuleName = (req, res) => {
    res.json(module.name);
  };

  app.get("/lab5/module", getModule);
  app.get("/lab5/module/name", getModuleName);

  const setModuleName = (req, res) => {
    const { newName } = req.params;
    module.name = newName;
    res.json(module);
  };

  app.get("/lab5/module/name/:newName", setModuleName);

  const setModuleDescription = (req, res) => {
    const { newDescription } = req.params;
    module.description = newDescription;
    res.json(module);
  };

  app.get("/lab5/module/description/:newDescription", setModuleDescription);
}
