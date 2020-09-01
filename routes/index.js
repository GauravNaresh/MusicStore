var express = require("express");
var router = express.Router();

var passport = require("passport");
var Account = require("../models/account");

var monk = require("monk");
var db = monk("localhost:27017/vidzy");

///////////////////////////////////////////
// user signup, login and logout
router.get("/", function(req, res) {
  console.log("no error here");
  // res.render("index", { user: req.user });
  // req,user is the current user info

  let search_title = req.query.title;
  let search_genre = req.query.genre;
  var mongo_query = [];
  var genre_list = [];
  var search = false;
  if (search_title) {
    search = true;
    mongo_query.push({ title: { $regex: search_title, $options: "i" } });
  }
  genre_query = [];
  if (search_genre) {
    search = true;
    if (!Array.isArray(search_genre)) {
      genre_list.push(search_genre);
    } else {
      genre_list = search_genre;
    }
    var genre_item;
    for (genre_item of genre_list) {
      console.log(genre_item);
      genre_query.push({ genre: genre_item });
    }
    mongo_query.push({ $or: genre_query });
  }
  console.log(genre_list);
  console.log(mongo_query);
  var collection = db.get("videos");

  collection.find(search ? { $and: mongo_query } : {}, function(err, videos) {
    if (err) throw err;
    res.render("index", { user: req.user, videos: videos });
  });
});

router.get("/register", function(req, res) {
  res.render("register", {});
});

router.post("/register", function(req, res) {
  Account.register(
    new Account({ username: req.body.username }),
    req.body.password,
    function(err, account) {
      if (err) {
        return res.render("register", { account: account });
      }

      passport.authenticate("local")(req, res, function() {
        res.redirect("/");
      });
    }
  );
});

router.get("/login", function(req, res) {
  res.render("login", { user: req.user });
});

router.post("/login", passport.authenticate("local"), function(req, res) {
  res.redirect("/");
});

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});
///////////////////////////////////////////

// router.get("/", function(req, res, next) {
//   res.redirect("/videos");
// });

router.get("/videos", function(req, res, next) {
  var collection = db.get("videos");
  collection.find({}, function(err, videos) {
    if (err) throw err;
    console.log(videos);
    res.render("index", { videos: videos });
  });
});

router.post("/videos", function(req, res, next) {
  var collection = db.get("videos");
  collection.insert(
    {
      title: req.body.title,
      genre: req.body.genre,
      image: req.body.image,
      description: req.body.description
    },
    function(err, videos) {
      if (err) throw err;
      res.redirect("/videos");
    }
  );
});

router.get("/videos/new", function(req, res, next) {
  res.render("new");
});

router.get("/videos/:id", function(req, res, next) {
  var collection = db.get("videos");
  collection.findOne({ _id: req.params.id }, function(err, video) {
    if (err) throw err;
    // res.json(video);
    res.render("show", { video: video });
  });
});

router.get("/videos/:id/edit", function(req, res, next) {
  var collection = db.get("videos");
  collection.findOne({ _id: req.params.id }, function(err, video) {
    if (err) throw err;
    res.render("edit", { video: video });
  });
});

router.put("/videos/:id", function(req, res, next) {
  var collection = db.get("videos");
  collection.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        title: req.body.title,
        genre: req.body.genre,
        image: req.body.image,
        description: req.body.description
      }
    },
    function(err, video) {
      if (err) throw err;
      res.redirect("/videos");
    }
  );
});

router.delete("/videos/:id", function(req, res, next) {
  var collection = db.get("videos");
  collection.remove({ _id: req.params.id }, function(err, video) {
    if (err) throw err;
    res.redirect("/");
  });
});

router.delete("/videos/:id", function(req, res, next) {
  console.log("enter delete here");
  res.redirect("/");
});
module.exports = router;
