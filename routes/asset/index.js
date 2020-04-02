let express = require("express");
let router = express.Router();

const controller = require("./controller");

router.get("/", controller.retrieveAsset);
router.get("/batch/asset", controller.batchGetAssetFromApi);
router.get("/:id", controller.getAsset);
router.post("/new", controller.createAsset);
router.patch("/edit", controller.editAsset);
router.delete("/delete", controller.deleteAsset);

module.exports = router;
