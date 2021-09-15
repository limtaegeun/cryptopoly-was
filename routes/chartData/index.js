let express = require("express");
let router = express.Router();

const controller = require("./controller");

router.get("/", controller.retrieveChartData);
router.get("/batch", controller.batchGetChartDataFromApi);
router.get("/:id", controller.getChartData);
router.patch("/edit", controller.editChartData);
router.delete("/delete", controller.deleteChartData);

module.exports = router;
