let express = require("express");
let router = express.Router();

const controller = require("./controller");

router.get("/", controller.retrieveCurrency);
router.get("/batch/chart", controller.batchGetChartDataFromApi);
router.get("/batch/currency", controller.batchGetCurrencyFromApi);
router.get("/:id", controller.getCurrency);
router.post("/new", controller.createCurrency);
router.patch("/edit", controller.editCurrency);
router.delete("/delete", controller.deleteCurrency);

module.exports = router;
