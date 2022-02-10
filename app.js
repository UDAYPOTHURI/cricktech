//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const cricData= require('cric-player-info');
const axios = require('axios').default;
const cheerio = require('cheerio');
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

let matchtitles = [];
// matchdatas.length = 0;
let matchdates = [];
let matchvenues = [];
let matchids = [];
let matchbatting1s = [];
let matchbatting2s = [];
let matchbowling1s = [];
let matchbowling2s = [];
let matchlast18ballss = [];

let matchtitle;
let matchvenue1;
let matchsubtitle;
let matchtoss;
let matchstartdate;
let matchenddate;
let matchawayname;
let matchhomename;
let matchstatus;
let matchawayscore;
let matchhomescore;
let matchrefereename;
let matchumpire1name;
let matchumpire2name;
let matchumpirereservename;
let matchumpiretvname;
let matchteamname1;
let matchteaminnings1;
let matchruns1;
let matchovers1;
let matchwickets1;
let matchcurrent1;
let matchfow1;
let matchextras1;
let matchextrasdetails1;
let matchteamname2;
let matchteaminnings2;
let matchruns2;
let matchovers2;
let matchwickets2;
let matchcurrent2;
let matchfow2;
let matchextras2;
let matchextrasdetails2;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session()); 

// mongoose.connect("mongodb://localhost:27017/cricktechuserDb", {useNewUrlParser: true});
mongoose.connect("mongodb+srv://admin-uday:cricktech@cluster0.dqts7.mongodb.net/cricktechuserDb", {useNewUrlParser: true});

const cricktechuserSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: {
        type: String,
        min: 6,
    },
    googleId: String,
    facebookId: String
});

cricktechuserSchema.plugin(passportLocalMongoose);
cricktechuserSchema.plugin(findOrCreate);

const CricktechUser = new mongoose.model("CricktechUser", cricktechuserSchema);

passport.use(CricktechUser.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    CricktechUser.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {

    CricktechUser.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    CricktechUser.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res){
    res.render("frontpage");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
});

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get("/auth/facebook/secrets",
  passport.authenticate('facebook', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
});

app.get("/signup", function(req, res){
    res.render("frontpagesignup");
});

app.get("/login", function(req, res){
    res.render("frontpagelogin");
});

app.get("/secrets", function(req, res){
    if (req.isAuthenticated()){
        res.render("secrets", {
            matchtitlesejs: matchtitles,
            matchdatesejs: matchdates,
            matchvenuesejs: matchvenues,
            matchidsejs: matchids,
            matchtitleejs: matchtitle,
            matchvenue1ejs: matchvenue1,
            matchsubtitleejs: matchsubtitle,
            matchtossejs: matchtoss,
            matchstartdateejs: matchstartdate,
            matchenddateejs: matchenddate,
            matchawaynameejs: matchawayname,
            matchhomenameejs: matchhomename,
            matchstatusejs: matchstatus,
            matchawayscoreejs: matchawayscore,
            matchhomescoreejs: matchhomescore,
            matchrefereenameejs: matchrefereename,
            matchumpire1nameejs: matchumpire1name,
            matchumpire2nameejs: matchumpire2name,
            matchumpirereservenameejs: matchumpirereservename,
            matchumpiretvnameejs: matchumpiretvname,
            matchteamname1ejs: matchteamname1,
            matchteaminnings1ejs: matchteaminnings1,
            matchruns1ejs: matchruns1,
            matchovers1ejs: matchovers1,
            matchwickets1ejs: matchwickets1,
            matchcurrent1ejs: matchcurrent1,
            matchfow1ejs: matchfow1,
            matchextras1ejs: matchextras1,
            matchextrasdetails1ejs: matchextrasdetails1,
            matchteamname2ejs: matchteamname2,
            matchteaminnings2ejs: matchteaminnings2,
            matchruns2ejs: matchruns2,
            matchovers2ejs: matchovers2,
            matchwickets2ejs: matchwickets2,
            matchcurrent2ejs: matchcurrent2,
            matchfow2ejs: matchfow2,
            matchextras2ejs: matchextras2,
            matchextrasdetails2ejs: matchextrasdetails2,
            matchbatting1sejs: matchbatting1s,
            matchbatting2sejs: matchbatting2s,
            matchbowling1sejs: matchbowling1s,
            matchbowling2sejs: matchbowling2s,
            matchlast18ballssejs: matchlast18ballss,
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/forgotpassword", function(req, res){
    res.render("forgotpassword");
});

app.get("/forgotpasswordotp", function(req, res){
    res.render("forgotpasswordotp");
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

app.post("/signup", function(req, res){

    CricktechUser.register({name: req.body.name, username: req.body.username}, req.body.password, function(err, cricktechuser){

            if (err) {
                console.log(err);
                res.redirect("/signup");
            } else {
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets");
                });
            }
    });

});

app.post("/login", function(req, res){
    
    const cricktechuser = new CricktechUser({
        username: req.body.username,
        password: req.body.password
    });

    req.login(cricktechuser, function(err){
        if(err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });

});
//  let matchdatas = [];
app.post("/secrets", function(req, res){
    const date = req.body.date;
    var options = {
        method: 'GET',
        url: 'https://cricket-live-data.p.rapidapi.com/fixtures-by-date/' + date,
        headers: {
            'x-rapidapi-host': process.env.RAPIDAPIHOST,
            'x-rapidapi-key': process.env.RAPIDAPIKEY,
        }
    };
    
    axios.request(options).then(function (response) {
        matchtitles.length = 0;
        matchdates.length = 0;
        matchvenues.length = 0;
        matchids.length = 0;
        length = 0;
        data = response.data;
        length = response.data.results.length;
        for(i=0; i<length; i++){
            matchtitles.push(response.data.results[i].match_title);
            matchdates.push(response.data.results[i].date);
            matchvenues.push(response.data.results[i].venue);
            matchids.push(response.data.results[i].id);
        }
        console.log(matchtitles);
        console.log(matchdates);
        console.log(matchvenues);
        console.log(matchids);
        // res.render("secrets", {
        //     matchdatasejs: matchdatas,
        // });
        // matchdatas.length = 0;

        res.redirect("/secrets");

        // matchdatas.length = 0;

    }).catch(function (error) {
        console.error(error);
    });
    

    const matchid=req.body.matchid;
    var options = {
        method: 'GET',
        url: 'https://cricket-live-data.p.rapidapi.com/match/' + matchid,
        headers: {
            'x-rapidapi-host': process.env.RAPIDAPIHOST,
            'x-rapidapi-key': process.env.RAPIDAPIKEY,
        }
    };
    
    axios.request(options).then(function (respons) {
        data1 = respons.data;
        console.log(respons.data);
        matchtitle = respons.data.results.fixture.match_title;
        matchvenue1 = respons.data.results.fixture.venue;
        matchsubtitle = respons.data.results.fixture.dates[0].match_subtitle;
        matchtoss = respons.data.results.live_details.match_summary.toss;
        matchstartdate = respons.data.results.fixture.start_date;
        matchenddate = respons.data.results.fixture.end_date;
        matchawayname = respons.data.results.fixture.away.name;
        matchhomename = respons.data.results.fixture.home.name;
        matchstatus = respons.data.results.live_details.match_summary.status;
        matchawayscore = respons.data.results.live_details.match_summary.away_scores;
        matchhomescore = respons.data.results.live_details.match_summary.home_scores;
        matchrefereename = respons.data.results.live_details.officials.referee;
        matchumpire1name = respons.data.results.live_details.officials.umpire_1;
        matchumpire2name = respons.data.results.live_details.officials.umpire_2;
        matchumpirereservename = respons.data.results.live_details.officials.umpire_reserve;
        matchumpiretvname = respons.data.results.live_details.officials.umpire_tv;
        matchteamname1 = respons.data.results.live_details.scorecard[0].title;
        matchteaminnings1 = respons.data.results.live_details.scorecard[0].innings_number;
        matchruns1 = respons.data.results.live_details.scorecard[0].runs;
        matchovers1 = respons.data.results.live_details.scorecard[0].overs;
        matchwickets1 = respons.data.results.live_details.scorecard[0].wickets;
        matchcurrent1 = respons.data.results.live_details.scorecard[0].current;
        matchfow1 = respons.data.results.live_details.scorecard[0].fow;
        matchextras1 = respons.data.results.live_details.scorecard[0].extras;
        matchextrasdetails1 = respons.data.results.live_details.scorecard[0].extras_detail;
        matchteamname2 =  respons.data.results.live_details.scorecard[1].title;
        matchteaminnings2 = respons.data.results.live_details.scorecard[1].innings_number;
        matchruns2 = respons.data.results.live_details.scorecard[1].runs;
        matchovers2 = respons.data.results.live_details.scorecard[1].overs;
        matchwickets2 = respons.data.results.live_details.scorecard[1].wickets;
        matchcurrent2 = respons.data.results.live_details.scorecard[1].current;
        matchfow2 = respons.data.results.live_details.scorecard[1].fow;
        matchextras2 = respons.data.results.live_details.scorecard[1].extras;
        matchextrasdetails2 = respons.data.results.live_details.scorecard[1].extras_detail;


        
        length1 = respons.data.results.live_details.scorecard[0].batting.length;

        for(i=0; i<length1; i++){
            matchbatting1s.push(respons.data.results.live_details.scorecard[0].batting[i]);
        }
        console.log(matchbatting1s);


        length2 = respons.data.results.live_details.scorecard[1].batting.length;

        for(i=0; i<length2; i++){
            matchbatting2s.push(respons.data.results.live_details.scorecard[1].batting[i]);
        }
        console.log(matchbatting2s);

        length3 = respons.data.results.live_details.scorecard[0].bowling.length;

        for(i=0;i<length3;i++){
            matchbowling1s.push(respons.data.results.live_details.scorecard[0].bowling[i]);
        }
        console.log(matchbowling1s);

        length4 = respons.data.results.live_details.scorecard[1].bowling.length;

        for(i=0;i<length4;i++){
            matchbowling2s.push(respons.data.results.live_details.scorecard[1].bowling[i]);
        }
        console.log(matchbowling2s);

        length5 = respons.data.results.live_details.stats.last_18_balls.length;

        for(i=0; i<length5; i++){
            matchlast18ballss.push(respons.data.results.live_details.stats.last_18_balls[i]);
        }
        console.log(matchlast18ballss);

        res.redirect("/secrets");
        
    }).catch(function (error) {
        console.error(error);
    });
    
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
    console.log("Server started successfully.");
});