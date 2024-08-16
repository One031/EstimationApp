import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import countryList from "country-list";

const app = express();
const port = 3000;

const API_URLA = "https://api.agify.io";
const API_URLG = "https://api.genderize.io";
const API_URLN = "https://api.nationalize.io";


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", { content: "Waiting for data.." });
});

app.post("/submit-name", async (req, res) => {
  try {
    const name1 = req.body.name;
    const resultA = await axios.get(API_URLA + "?name=" + name1);
    const resultG = await axios.get(API_URLG + "?name=" + name1);
    const resultN = await axios.get(API_URLN + "?name=" + name1);
    const {name: personName, age: personage } = resultA.data;
    const {gender: personGender} = resultG.data;
    const data = resultN.data;
    const personCountryID = data.country[0].country_id;
    const personCountryName = countryList.getName(personCountryID);

    res.render("index.ejs", { content: {name: personName, age: personage, gender: personGender, country: personCountryName}});
    console.log("Retrieved data", {name: personName, age: personage, gender: personGender, country: personCountryName } );
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

app.listen(port, () => {
  console.log(`Server running on: ${port}`);
});
