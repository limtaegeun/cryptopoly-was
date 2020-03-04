let express = require("express");
let router = express.Router();

const controller = require("./controller");

router.get("/", controller.retrieveCurrency);
router.get("/:id", controller.getCurrency);
router.post("/new", controller.createCurrency);
router.patch("/edit", controller.editCurrency);
router.delete("/delete", controller.deleteCurrency);
router.get('/batch', controller.batchReadFromApi)
module.exports = router;
