const admin = require("firebase-admin");

module.exports = (req, res, next) => {
  const sessionCookie = req.cookies.__session || "";

  if (sessionCookie === "") {
    res.redirect("/sign-in");
  } else {
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then(userData => {
        req.user = userData;
        res.locals.email = userData.email;
        console.log(res.locals)
        next();
      })
      .catch(error => {
        res.redirect("/sign-in");
      });
  }
};
