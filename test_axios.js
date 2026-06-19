const axios = require("axios");
console.log(axios.getUri({url: "/api", params: { filters: { cat_id: { $eq: "1" } } }}));
