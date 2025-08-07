import * as modulesDao from "./dao.js";

export default function ModuleRoutes(app) {
  const deleteModule = async (req, res) => {
    const { moduleId } = req.params;
    const status = await modulesDao.deleteModule(moduleId);
    res.send(status);
  };

  const updateModule = async (req, res) => {
    const { moduleId } = req.params;
    const moduleUpdates = req.body;
    const updated = modulesDao.updateModule(moduleId, moduleUpdates);
    if (!updated) {
      res.status(404).json({ message: "Module not found" });
      return;
    }
    res.send(updated);
  };

  app.delete("/api/modules/:moduleId", deleteModule);
  app.put("/api/modules/:moduleId", updateModule);
}