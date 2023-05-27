const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const connection = require("./src/database/db");
const authRoute = require("./src/routes/user");
const oemRoute = require("./src/routes/oemSpec") ;
const inventryRoute = require("./src/routes/marketPlaceInve")
dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("uploads"));
app.use(cors());
app.use("/auth", authRoute);
app.use("/oem", oemRoute);
app.use("/inventry", inventryRoute)
app.get("/", (req, res) => {
  res.send({ message: "Welcome to our website" });
});

app.listen(process.env.PORT, async () => {
  await connection;
  console.log(`server start at ${process.env.PORT}`);
});
 
module.exports = app;
