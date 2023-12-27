const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors');
const BrandName = require("./model");
const Registeruser = require("./regmodel");
const app = express();
app.use(express.json());
const jwt = require("jsonwebtoken");
app.use(cors());

// https://cloud.mongodb.com/v2/6442234d25ab8c1251dc5be9#/metrics/replicaSet/64422873e34e165e7bf7d911/explorer/test/brandnames/find

// mongoose
//   .connect(
//     "mongodb+srv://srinivasvangara96:Srinu1996@cluster0.qutnzhk.mongodb.net/?retryWrites=true&w=majority", {
//       useUnifiedTopology: true ,
//       useNewUrlParser: true,
//       useCreateIndex : true
//   })
//   .then(() => console.log("connected successfully"))
//   .catch((err) => console.log("Data Base Error", err));

mongoose.connect(
  "mongodb+srv://srinivasvangara96:Srinu1996@cluster0.qutnzhk.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('Connection error:', err);
});

db.once('open', () => {
  console.log('Connected to the database');
});

app.get("/", (req, res) => {
  res.send(`<h1>Server Started Successfully!</h1>`);
});

app.listen(3005, () => console.log("Server running......"));

//post method
app.post("/addbrands", async (req, res) => {
  const { vendor_name, vendor_phone, brandName, quantity } = req.body;
  console.log("itemitem", req.body);
  try {
    const newData = new BrandName({
      vendor_name,
      vendor_phone,
      brandName,
      quantity,
    });
    await newData.save();
    return res.json(await BrandName.find());
  } catch (err) {
    console.log(err.message);
  }
});

//get all Brands
app.get("/getallbrands", async (req, res) => {
  console.log("trigge");
  try {
    const allData = await BrandName.find();
    return res.json(allData);
  } catch (err) {
    console.log("error", err);
  }
});

//get onebrand by Id
app.get("/getbranditem/:id", async (req, res) => {
  try {
    const data = await BrandName.findById(req.params.id);
    return res.json(data);
  } catch (err) {
    console.log("error", err);
  }
});

//deletebrand
app.delete("/deletebrand/:id", async (req, res) => {
  try {
    await BrandName.findByIdAndDelete(req.params.id);
    return res.json(await BrandName.find());
  } catch (err) {
    console.log("err", err);
  }
});

//update
app.put("/updatebrand/:id", (request, response) => {
  const body = request.body;
  const blog = {
    vendor_name: body.vendor_name,
    vendor_phone: body.vendor_phone,
    brandName: body.brandName,
    quantity: body.quantity,
  };
  BrandName.findByIdAndUpdate(request.params.id, blog)
    .then((updatedBlog) => {
      console.log("updatedBlog", updatedBlog);
      response.json({
        status: "success",
        message: "Updated successfully",
      });
    })
    .catch((error) =>
      response.json({
        status: "error",
        message: "Update failed",
      })
    );
});

//jwt authentication
app.post("/register", async (req, res) => {
  try {
    const { username, email, phone, password, confirmpassword } = req.body;
    let exist = await Registeruser.findOne({ email });
    let existPhone = await Registeruser.findOne({ phone });
    if (exist) {
      return res.status(400).send({
        status: "warning",
        message: "User already exist with same email",
      });
    }
    if (existPhone) {
      return res.status(400).send({
        status: "warning",
        message: "User already exist with same number",
      });
    }
    if (password !== confirmpassword) {
      return res.status(400).send({
        status: "warning",
        message: "Passwords are not matching",
      });
    }

    let newUser = new Registeruser({
      username,
      email,
      phone,
      password,
      confirmpassword,
    });

    await newUser.save();
    return res.status(200).send({
      status: "suceess",
      message: "Registered Successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      message: "Internal server error",
    });
  }
});

//login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let exist = await Registeruser.findOne({ email });
    if (!exist) {
      return res.status(400).send({
        status: "error",
        message: "User Not Found",
      });
    }
    if (exist.password !== password) {
      return res.status(400).send({
        status: "error",
        message: "Invalid credentials",
      });
    }

    let payload = {
      user: {
        id: exist.id,
      },
    };

    jwt.sign(payload, "jwtSecret", { expiresIn: 3600000 }, (err, token) => {
      if (err) {
        return res.status(400).send({
          status: "error",
          message: "Something Wrong!",
        });
      } else {
        return res.status(200).send({
          status: "success",
          token: token,
          username: exist?.username,
          email: exist?.email,
          phone: exist?.phone,
        });
      }
    });
  } catch (err) {
    console.log("error");
    return res.status(500).send("Server Error");
  }
});
app.put("/forgotpassword", async (req, res) => {
  try {
    const { email, password, confirmpassword } = req.body;
    let exist = await Registeruser.findOne({ email });
    if (!exist) {
      return res.status(400).send({
        status: "error",
        message: "User Not Found",
      });
    }
    console.log({ exist });

    if (confirmpassword !== password) {
      return res.status(400).send({
        status: "error",
        message: "Passwords are not matching",
      });
    }

    if (exist && confirmpassword == password) {
      Registeruser.findByIdAndUpdate(exist._id, {
        email,
        password,
        confirmpassword,
        username: exist.username,
        phone: exist.phone,
      })
        .then((updatedPassword) => {
          console.log("updatedPassword", updatedPassword);
          res.json({
            status: "success",
            message: "Password Chnaged successfully",
          });
        })
        .catch((error) =>
          res.json({
            status: "error",
            message: "Update failed",
          })
        );
    }
  } catch (err) {
    console.log("error");
    return res.status(500).send("Server Error");
  }
});
