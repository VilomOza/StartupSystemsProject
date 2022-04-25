const functions = require("firebase-functions")
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;

const serviceAccount = require("./../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const UserService = require("./app/user-service.js")
const authMiddleware = require("./app/auth-middleware");

// use cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use("/static", express.static("static/"));

// use res.render to load up an ejs view file
//index page
app.get("/", function (req, res) {
  res.render("pages/index");
  debugger
});

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-up");
});

//Comment the next two blocks of code when sign in works
app.get("/dashboard", function(req,res){
  res.render("pages/dashboard")
})

app.get("/cellar", function(req,res){
  const sessionCookie = req.cookies.__session;

  admin.auth()
    .verifySessionCookie(sessionCookie, true)
    .then(userData => {
      const id = userData.sub;
      return UserService.getWines(id)
    }).then(wines => {
      console.log(wines)
    res.render("pages/cellar", {wines: wines})
  })

})

app.post("/sessionLogin", async (req, res) => {
  const idToken = req.body.idToken.toString();
  const signInType = req.body.signInType;

  const expiresIn = 60 * 60 * 1000;
  admin.auth().createSessionCookie(idToken,{expiresIn})
  .then(
    (sessionCookie) => {
      const options = {maxAge: expiresIn, httpOnly: true, secure:true};
      res.cookie('__session',sessionCookie, options);

      admin.auth()
        .verifySessionCookie(sessionCookie, true)
        .then(userData => {
          // create document from userData
          const id = userData.sub;
          const email = userData.email;
          if (signInType === 'register') {
            // save it to firestore
            UserService.createUser(id, email)
          }
          res.end(JSON.stringify({status: "success"}));
        })
    },
    (error) => {
      res.status(401).send(error.toString());
    }
  );
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("__session");
  res.redirect("/");
});

app.post("/addWine", async (req, res) => {
  const sessionCookie = req.cookies.__session;
  const wine_data = req.body

  admin.auth()
    .verifySessionCookie(sessionCookie, true)
    .then(userData => {
      const id = userData.sub;
      UserService.addWine(id, wine_data)
      res.end(JSON.stringify({ status: "success" }))
    })
})

//Uncomment the following to run on local server
exports.app = functions.https.onRequest(app);

//uncomment out the next two lines to stop running on local server
//app.listen(port);
//console.log("Server started at http://localhost:" + port);