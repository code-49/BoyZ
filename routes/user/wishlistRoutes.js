const express = require("express");

const wishlistController = require("../../controller/user/wishlistController");

const router = express.Router();

router.get("/", wishlistController.load_wishlist);
router.get("/add/:productID?", wishlistController.add_to_wishlist);
router.get("/delete/:productID?", wishlistController.delete_from_wishlist);

module.exports = router;
