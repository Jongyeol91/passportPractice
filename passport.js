const express =       require("express");
const bodyParser =    require("body-parser");
const ejs =           require("ejs");
const session =       require("express-session");
const passport =      require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FileStore =     require("session-file-store")(session);
const flash = require("connect-flash");
const app = express();
//var indexRouter = require('./routes/index')(app);

//app.use("/", indexRouter);

var userdata = {
  email: "fitdata",
  pw: "1111"
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: "myseret",
  store: new FileStore()
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// 전략 성공시(로그인시) 실행
passport.serializeUser((userdata, done) => {
  // 파라미터로 넘어온 유저데이터에서 식별자를 세션(req.session.passport.user)에 저장
  done(null, userdata.email);
  console.log("세션에 유저정보 입력 성공");
});

// 페이지 리로드마다 실행
// 세션에 구워진 식별자와 실제 저장소(세션에 명시한 store: ~)식별자 비교
//  -> (serializeUser의 done에서의 식별자가 deserializeUser의 첫번째 파라미터로 온다.)
// 일치하면 done의 두번째 인자를 req.user로 만듬.
passport.deserializeUser((id, done) => {
  done(null, id);
});

passport.use(new LocalStrategy(
  
  // **option: username과 password 대신에 다른 이름을 사용가능
  { usernameField: 'email', passwordField: 'pw' },
  
  function (username, password, done) {
    if (username !== userdata.email) {
      return done(null, false, { message: "아이디가 틀렸습니다." });
    }
    if (password !== userdata.pw) {
      return done(null, false, { message: "비밀번호가 틀렸습니다." });
    }
    return done(null, userdata);
  }
  ));
  
app.post('/login',
  // local은 username과 password를 이용해서 로그인 하는 전략
    passport.authenticate('local', {
      successRedirect: "/",
      failureRedirect: "/",
      failureFlash: true,
      successFlash: true
  })
);
  
  app.get("/", (req, res) => {
    //console.log(req.user);
    let failflashMSG = req.flash();
    let successflashMSG = req.flash();
    if(!req.user){
      res.render("index.ejs", {failflashMSG: failflashMSG.error, successflashMSG: successflashMSG.success});
    } else {
      res.render("success.ejs", {successflashMSG: successflashMSG.success});
    }
  });

  app.get("/logout", (req, res) => {
    req.logOut();
    // passport의 로그아웃 메서드 이후에도, 직접 세션을 다 지워주고 리다이렉트 하면 더 안전
    // req.session.destroy((err) => {
    // });
    res.redirect("/");
  });

app.listen(3000, () => {
  console.log("server is running on port 3000")
});