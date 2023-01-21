require("dotenv").config();

const { Router } = require("express");

const UserModel = require("./user.model");

const app = Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_TOKEN = "asdsg35sr35g4hsadfad"

app.get("/", async (req, res) => {
  try {
    let data = await UserModel.find();
    return res.status(200).send(data);
  } catch (er) {
    return res.status(404).send(er.message);
  }
});



// Login Route
app.post("/login", async (req, res) => {

  const { email, password } = req.body;
 
  console.log(email,password)
 
   if (!email || !password) {
     return res.status(403).send("Enter Credianteials");
   }
 
   const User = await UserModel.findOne({ email });
   let username = User.username
   let date = new Date().toLocaleDateString("de-DE");
   let time =  new Date().toLocaleTimeString();
   
  // console.log(User)
  // if (!User) return res.status(404).send("User Not Found");
 
   try {
     const match = bcrypt.compareSync(password, User.password);
    console.log(match)
     if (match) {
       //login
       const token = jwt.sign(
         {
           _id: User.id,
           email:User.email,
           password: User.password,
         },
         SECRET_TOKEN,
         {
           expiresIn: "7 days",
         }
       );
       const refresh_token = jwt.sign(
         {
           _id: User.id,
           email:User.email,
           password: User.password,
         },
         SECRET_TOKEN,
         {
           expiresIn: "28 days",
         }
       );

       console.log(date
        ,time)
     
       return res
         .status(200)
         .send({ message: "Login success", token, refresh_token, email,username, time : `Date : ${date} , Time : ${time}` });
     } else {
       return res.status(401).send({ message: "Authentication Failed" });
     }
   } catch {
     return res.status(401).send({ message: "Authentication Failed" });
   }
 });
 

// Signup Route
app.post("/signup", async (req, res) => {
  const {
    email,
    password, 
    username,
  } = req.body;

  console.log(req.body)
  

  if (!email || !password || !username ) {
    return res.status(403).send("Enter Credentails");
  }

  try {
    const exsist = await UserModel.findOne({ email });
    if (exsist)
      return res
        .status(403)
        .send({ message: "User Already Created Try Logging in" });
    
    bcrypt.hash(password, 6, async function (err, hash) {
      if (err) {
        return res.status(403).send({ message: "Connection has failed" });
      }

      const user = await UserModel({
        email,
        password: hash,
        username
      });

      await user.save();
      return res
      .status(200)
      .send({ message: "Signup success"});

    });
  } catch (er) {

    return res.status(404).send(er.message);
  }
  
});

// Calculate 



app.post("/calculate", async (req, res) => {
  const {
    InvestmentAmount, 
    TimePeriod,
  } = req.body;

  console.log(req.body)
 
  try {

    let P = InvestmentAmount ;
    let i = 7.1 / 100 ;
    let n = TimePeriod ;

    let  MaturityValue = (P * (Math.pow(1 + i, n) - 1) / i).toFixed();

    // Total Investment Amount = Annual Instalment Amount * Total No. of Years
    let TOTALInvestmentAmount = (n*P).toFixed()

   // Total Interest Gained = Total Maturity Value - Total Investment Amount
   let InterestGained = (MaturityValue - TOTALInvestmentAmount).toFixed()
   
   //console.log(MaturityValue,  TOTALInvestmentAmount, InterestGained)
    
    
      return res
        .status(201)
        .send({ message: "Calculate success", MaturityValue, TOTALInvestmentAmount, InterestGained  });
    
    
  } catch (er) {

    return res.status(404).send(er.message);
  }
  
});


module.exports = app;
