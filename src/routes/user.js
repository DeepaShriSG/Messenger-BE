import express from "express";
import UsersController from "../controller/user.js";
import Auth from "../common/auth.js";

const router = express.Router();

router.get("/", Auth.validate,UsersController.getUsers);
router.get("/:id",Auth.validate,UsersController.getUserById);
router.post("/signup", UsersController.createUsers);
router.post("/login", UsersController.login);
router.post("/startconvo",UsersController.createConversation);
router.get("/getconvo/:id",UsersController.getConvo);
router.post("/sendMessage",UsersController.sendMessage);
router.get("/getMessage/:id",UsersController.getUserMessages);
router.post('/forgetpassword',UsersController.forgotPassword)
router.post('/resetpassword',Auth.validate,UsersController.resetPassword)

export default router;
