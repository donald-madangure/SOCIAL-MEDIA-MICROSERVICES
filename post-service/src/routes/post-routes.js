const express = require("express");

const { createPost, getAllPosts, getPost, deletePost } = require("../controllers/post-controller");
const { authenticateRequest } = require("../middleware/auth-middleware");

const router = express();

//middleware -> this will tell if the user is an auth user or not
router.use(authenticateRequest);

router.post("/create-post", createPost);
router.get("/get-all-posts", getAllPosts);
router.get("/get-post/:id", getPost);
router.delete("/delete-post/:id", deletePost);

module.exports = router;
