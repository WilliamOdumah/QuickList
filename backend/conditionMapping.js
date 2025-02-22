const conditionMappings = {
    facebook: {
      "New": "New",
      "Like New": "Used - Like New",
      "Very Good": "Used - Good",
      "Good": "Used - Good",
      "Fair": "Used - Fair",
      "Salvage": "Used - Fair", // No salvage option, default to "Fair"
    },
    kijiji: {
      "New": "New",
      "Like New": "Used - Like New",
      "Very Good": "Used - Good",
      "Good": "Used - Good",
      "Fair": "Used - Fair",
      "Salvage": "Used - Fair", // No salvage option, default to "Fair"
    },
    craigslist: {
      "New": "new",
      "Like New": "like new",
      "Very Good": "excellent",
      "Good": "good",
      "Fair": "fair",
      "Salvage": "salvage",
    },
    ebay: {
      "New": "Brand New",
      "Like New": "Like New",
      "Very Good": "Very Good",
      "Good": "Good",
      "Fair": "Acceptable",
      "Salvage": "Acceptable",
    },
  };
  
  module.exports = conditionMappings;
  