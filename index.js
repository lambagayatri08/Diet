const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const Account = require("./mongodb");
const app = express();
const mongoose=require('mongoose')

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
app.get("/Diets", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "input.html"));
});
app.get("/Nearby-Hospital-Finder", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "NearHosp.html"));
});
app.get("/BMI-Calculator", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "BMI.html"));
});

const dietSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  breakfast: { type: String },
  lunch: { type: String },
  snacks: { type: String },
  dinner: { type: String },
  Disease: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Disease', default: [] }] // Reference to Disease
});

// Define Disease Schema
const diseaseSchema = new mongoose.Schema({
  Symptoms: [{ type: String, default: [] }],
  Disease: { type: String, required: true },
  DietId: { type: mongoose.Schema.Types.ObjectId, ref: 'Diet' } // Reference to Diet
});

// Create Diet and Disease Models
const Diet = mongoose.model('Diet', dietSchema);
const Disease = mongoose.model('Disease', diseaseSchema);

// Fetch Diet Recommendation Based on Disease
const getDietByDisease = async (diseaseName) => {
  // Find the disease by its name and populate the related diets
  const disease = await Disease.findOne({ Disease: diseaseName }).populate('DietId');
  
  // If the disease exists, return the associated diet
  if (disease && disease.DietId) {
      return disease.DietId;
  }

  return null;
};

// POST: Receive User Data and Recommend Diet Based on Disease
app.post('/api/receiveData', async (req, res) => {
  const { disease } = req.body;

  // Validate
  if (!disease) {
      return res.status(400).json({ success: false, error: 'Please provide a valid disease name' });
  }

  // Get a diet based on the disease from MongoDB
  try {
      const diet = await getDietByDisease(disease);

      if (!diet) {
          return res.status(404).json({ success: false, error: 'No suitable diet found for the given disease' });
      }

      res.status(200).json({ success: true, msg: 'Diet recommendation found', diet });
  } catch (error) {
      console.error('Error fetching diet recommendation:', error);
      res.status(500).json({ success: false, error: 'Error fetching diet recommendation' });
  }
});

// POST: Add a new Disease
app.post('/api/diseases', async (req, res) => {
  try {
      const disease = new Disease(req.body);
      await disease.save();
      res.status(201).json(disease);
  } catch (error) {
      console.error('Error adding disease:', error);
      res.status(400).json({ error: 'Error adding disease' });
  }
});

// GET: Fetch All Diseases
app.get('/api/diseases', async (req, res) => {
  try {
      const diseases = await Disease.find().populate('DietId');
      res.status(200).json(diseases);
  } catch (error) {
      console.error('Error fetching diseases:', error);
      res.status(500).json({ success: false, error: 'Error fetching diseases' });
  }
});


// GET: Fetch a Single Disease by ID
app.get('/api/diseases/:id', async (req, res) => {
  const id = req.params.id;

  try {
      const disease = await Disease.findById(id).populate('DietId');

      if (!disease) {
          return res.status(404).json({ msg: `A disease with the id of ${id} was not found` });
      }

      res.status(200).json(disease);
  } catch (error) {
      console.error('Error fetching disease:', error);
      res.status(500).json({ success: false, error: 'Error fetching disease' });
  }
});

// GET: Fetch All Diets (with optional limit)
app.get('/api/diets', async (req, res) => {
  const limit = parseInt(req.query.limit);

  try {
      const diets = limit && limit > 0 ? await Diet.find().limit(limit).populate('Disease') : await Diet.find().populate('Disease');
      res.status(200).json(diets);
  } catch (error) {
      console.error('Error fetching diets:', error);
      res.status(500).json({ success: false, error: 'Error fetching diets' });
  }
});

// GET: Fetch a Single Diet by ID
app.get('/api/diets/:id', async (req, res) => {
  const id = req.params.id;

  try {
      const diet = await Diet.findById(id).populate('Disease');

      if (!diet) {
          return res.status(404).json({ msg: `A diet with the id of ${id} was not found` });
      }

      res.status(200).json(diet);
  } catch (error) {
      console.error('Error fetching diet:', error);
      res.status(500).json({ success: false, error: 'Error fetching diet' });
  }
});

 
// Start the server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
