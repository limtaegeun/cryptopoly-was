let express = require("express");
let router = express.Router();

const controller = require("./controller");

router.get("/", controller.retrievePredict);
router.get("/batch", controller.batchGetPredict);
router.get("/:id", controller.getPredict);
router.delete("/delete", controller.deletePredict);

module.exports = router;
