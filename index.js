const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const Account = require("./mongodb");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "455nb45jhjhjk24",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

function checkAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "landing-page.html"));
});

app.get("/signup", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.sendFile(path.join(__dirname, "views", "signup.html"));
  });
});

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await Account.findOne({ email });
    if (existingUser) {
      return res.redirect("/signup?error=Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Account({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    req.session.userId = newUser._id;
    console.log("User data saved:", newUser);

    res.redirect("/Dashboard");
  } catch (err) {
    console.error("Error during user registration:", err);
    res.redirect("/signup?error=Failed to register user");
  }
});

app.get("/login", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.sendFile(path.join(__dirname, "views", "login.html"));
  });
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Account.findOne({ username });
    if (!user) {
      return res.redirect("/login?error=Invalid username or password");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.redirect("/login?error=Invalid username or password");
    }
    req.session.userId = user._id;
    res.redirect("/Dashboard");
  } catch (err) {
    console.error("Error during user login:", err);
    res.redirect("/login?error=Failed to log in");
  }
});

app.get("/Dashboard", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "Dashboard.html"));
});

app.get("/Stress-Evalution", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "StressEval.html"));
});
app.get("/Nearby-Hospital-Finder", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "NearHosp.html"));
});
app.get("/BMI-Calculator", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "BMI.html"));
});
 
// Start the server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
