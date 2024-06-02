const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("morgan");
const authRoute = require("./routes/auth")
const movieRoute = require("./routes/movieList");


const app = express();
dotenv.config();

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("DB Connection Successful !!"))
.catch((err) => {
    console.log(err)
});


const corsOptions = {
    origin: 'https://movie-library-theta.vercel.app', 
    optionsSuccessStatus: 200
};

app.use(express.json());
app.use(logger("tiny"));
app.use(cors(corsOptions));


app.use("/api/auth", authRoute);
app.use("/api/movielists", movieRoute);


app.listen(process.env.PORT || 5000, () => {
    console.log("Backend Server is Running");
})
