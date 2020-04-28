let express = require("express");
let router = express.Router();

const controller = require("./controller");

router.get("/", controller.retrievePredict);
router.get("/batch", controller.batchGetPredict);
router.get("/:id", controller.getPredict);
router.post("/new", controller.createPredict);
router.patch("/update", controller.updatePredict);
router.delete("/delete", controller.deletePredict);

module.exports = router;
