const express = require("express");
const mongoose = require('mongoose');
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStratergy = require('passport-local');
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");
// const methodOverride = require('method-override')
// const request = require("request");
const expressSanitizer = require('express-sanitizer');


let User = require("./models/users");
let Post = require("./models/posts");
let Answer = require("./models/answers");
// mongoose.Promise = global.Promise;

// Connect MongoDB at default port 27017.
mongoose.connect('mongodb://localhost:27017/forum-final', {
    useNewUrlParser: true,
    useCreateIndex: true,
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});


// APP Config
let app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(require("express-session")({
    secret: "HV is one of the best SA MEANT STACK Developer",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.get('/', (req, res) => {
    res.redirect("/home");
});

// Auth Routes
// Register GET
app.get('/register', (req, res) => {
    res.render("register");
});

// Register POST
app.post('/register', (req, res, next) => {
    req.body.username;
    req.body.email;
    req.body.password;

    User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/home");
        });
    });
});

// Login GET
app.get('/login', (req, res) => {
    res.render("login");
});

// Login POST
app.post('/login', passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login"
}), (req, res) => { });

// Logout GET
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// Home
app.get('/home', (req, res) => {
    Post.find({}).populate("user").sort({ "_id": -1 }).exec({}, (err, questions) => {
        if (err) {
            console.log(`Error: ` + err)
        } else {
            if (questions.length === 0) {
                res.render("home", { questions: questions, loggedUser: req.user });
            } else {
                res.render("home", { questions: questions, loggedUser: req.user });
            }
        }
    });
    // res.render("home");
});

// Single Question
app.get('/home/question/:id', isLoggedIn, (req, res) => {
    // console.log(req.params.id);
    Post.findById(req.params.id, (err, question) => {
        if (err) {
            console.log(`Error: ` + err)
        } else {
            if (!question) {
                console.log("message")
            } else {
                res.render("single", { question: question, loggedUser: req.user })
            }
        }
    }).populate("user").populate({
        path: 'answers', model: 'Answer',
        populate: {
            path: 'user', model: 'User'
        }
    });
});

// Get the POST Question Form
app.get('/home/ask-question', isLoggedIn, (req, res) => {
    Post.find().sort({ "_id": -1 }).limit(5).exec((err, posts) => {
        res.render("ask-ques", { posts: posts, loggedUser: req.user });
    });
});

// POST the ask-ques form
app.post('/post/ask-ques', isLoggedIn, (req, res) => {

    req.body.ques.title = req.sanitize(req.body.ques.title);
    req.body.ques.description = req.sanitize(req.body.ques.description);
    req.body.ques.user = req.user._id;
    Post.create(req.body.ques, (err, post) => {
        if (err) {
            console.log(`Error: ` + err)
        } else {
            res.redirect("/home");
        }
    });
});

// POST the comment-form in Single Page
app.post('/post/ans-to-ques/:qid', (req, res) => {
    // console.log(req.params.qid);
    req.body.ans.user = req.user._id;
    Answer.create(req.body.ans, (err, ans) => {
        if (err) {
            console.log(`Error: ` + err)
        } else {
            Post.findById(req.params.qid, (err, post) => {
                if (err) {
                    console.log(`Error: ` + err)
                } else {
                    if (!post) {
                        console.log("message")
                    } else {
                        post.answers.push(ans);
                        post.save();
                        res.redirect("/home/question/" + req.params.qid);
                    }
                }
            });
            // Post.findOneAndUpdate({
            //     _id: req.params.qid,
            // }, {
            //         answers: ans._id,
            //     }, (err, post) => {
            //         if (err) {
            //             console.log(`Error: ` + err)
            //         } else {
            //             res.redirect("/home/question/" + req.params.qid);
            //         }
            //     });
        }
    });

});

// Server
app.listen(4000, () => {
    console.log('Server started on 4000');
});