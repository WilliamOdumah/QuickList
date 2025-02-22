require("dotenv").config();
const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // API Key from .env
});

// Step 1: Extract Item Details
const extractItemDetails = async (imageBuffer) => {
  try {
    // Convert image to Base64
    const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `
              Identify the item in the image and return its details in **strict JSON format** only.
              DO NOT add explanations, formatting, or extra text—just return the JSON.

              {
                "item_name": "Exact product name",
                "category": "One of: Electronics, Fashion, Home Appliances, Collectibles, Toys, Tools, Vehicles, Miscellaneous",
                "condition": "One of: New, Like New, Used, Refurbished"
              }
            `},
            { type: "image_url", image_url: { url: imageBase64 } }
          ],
        },
      ],
      temperature: 0.2, // Ensures accurate and structured responses
    });

    let rawContent = response.choices[0].message.content;

    // ✅ Fix: Remove Markdown formatting if present
    rawContent = rawContent.replace(/```json|```/g, "").trim(); 

    console.log("✅ Extracted Item Details:", rawContent);
    
    return JSON.parse(rawContent); // Convert to JSON
  } catch (error) {
    console.error("❌ Error extracting item details:", error.response ? error.response.data : error.message);
    return null;
  }
};

// Step 2: Determine Suggested Selling Price
const getSuggestedPrice = async (itemDetails) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `
            Based on the following product details, research and suggest a single best-selling price using real online prices (eBay, Amazon, Walmart, etc.).
            Provide the response **ONLY in JSON format**, with **NO additional text**.

            Product Details:
            ${JSON.stringify(itemDetails, null, 2)}

            Strict JSON format:
            {
              "suggested_price": 123.45
            }
          `
        }
      ],
      temperature: 0.2, // Keeps pricing consistent
    });

    let rawContent = response.choices[0].message.content;

    // ✅ Fix: Remove Markdown formatting if present
    rawContent = rawContent.replace(/```json|```/g, "").trim(); 

    console.log("✅ Suggested Price:", rawContent);

    return JSON.parse(rawContent); // Convert to JSON
  } catch (error) {
    console.error("❌ Error determining suggested price:", error.response ? error.response.data : error.message);
    return { suggested_price: null };
  }
};


// API endpoint to process image and get full details
app.post("/api/list", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageBuffer = req.file.buffer;

    // Step 1: Extract Item Details
    const itemDetails = await extractItemDetails(imageBuffer);
    if (!itemDetails) {
      return res.status(400).json({ error: "Failed to extract item details" });
    }

    // Step 2: Get Suggested Price
    const priceDetails = await getSuggestedPrice(itemDetails);

    // Combine results into final JSON response
    const finalResponse = {
      ...itemDetails,
      ...priceDetails
    };

    res.json(finalResponse);
  } catch (error) {
    console.error("❌ Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));









// require("dotenv").config();
// const express = require("express");
// const multer = require("multer");
// const axios = require("axios");
// const puppeteer = require("puppeteer");
// const cors = require("cors");

// const app = express();
// const upload = multer({ storage: multer.memoryStorage() });

// app.use(cors());
// app.use(express.json());

// // Function to recognize the item using OpenAI Vision
// const recognizeItem = async (imageBase64) => {
//   try {
//     const response = await axios.post(
//     "https://api.openai.com/v1/images/generate",
//     { prompt: "Identify this item and return its details", image: imageBase64 },
//     { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
//     );
//     return response.data.item_name;
//   } catch (error) {
//     console.error("Error recognizing image:", error);
//     return null;
//   }
// };

// // Function to fetch item price from eBay API
// const fetchEbayPrice = async (itemName) => {
//   try {
//     const response = await axios.get(
//       `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(itemName)}&limit=5`,
//       {
//         headers: { Authorization: `Bearer ${process.env.EBAY_ACCESS_TOKEN}` },
//       }
//     );

//     const prices = response.data.itemSummaries.map((item) => parseFloat(item.price.value));
//     const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

//     return { source: "eBay", average_price: avgPrice };
//   } catch (error) {
//     console.error("Error fetching eBay prices:", error);
//     return { source: "eBay", average_price: null };
//   }
// };

// // Function to scrape Amazon for item price
// const scrapeAmazonPrice = async (itemName) => {
//   try {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.goto(`https://www.amazon.com/s?k=${encodeURIComponent(itemName)}`);

//     const price = await page.evaluate(() => {
//       let priceElement = document.querySelector(".a-price-whole");
//       return priceElement ? parseFloat(priceElement.innerText.replace(",", "")) : null;
//     });

//     await browser.close();
//     return { source: "Amazon", price };
//   } catch (error) {
//     console.error("Error scraping Amazon prices:", error);
//     return { source: "Amazon", price: null };
//   }
// };

// // Function to fetch price from Google Shopping API
// const fetchGoogleShoppingPrice = async (itemName) => {
//   try {
//     const response = await axios.get(
//       `https://www.googleapis.com/customsearch/v1`,
//       {
//         params: {
//           key: process.env.GOOGLE_API_KEY,
//           cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
//           q: `${itemName} price`,
//         },
//       }
//     );

//     return response.data.items
//       .map((item) => ({
//         source: "Google Shopping",
//         price: parseFloat(item.pagemap?.offer?.[0]?.price) || null,
//         link: item.link,
//       }))
//       .filter((p) => p.price !== null);
//   } catch (error) {
//     console.error("Error fetching Google Shopping prices:", error);
//     return [];
//   }
// };

// // Function to calculate the best selling price
// const getBestSellingPrice = async (itemName) => {
//   const ebayPrice = await fetchEbayPrice(itemName);
//   const amazonPrice = await scrapeAmazonPrice(itemName);
//   const googlePrices = await fetchGoogleShoppingPrice(itemName);

//   const allPrices = [ebayPrice, amazonPrice, ...googlePrices].filter((p) => p.price);
//   if (allPrices.length === 0) return { recommended_price: null, sources: [] };

//   const avgPrice = allPrices.reduce((sum, item) => sum + item.price, 0) / allPrices.length;

//   return { recommended_price: avgPrice, sources: allPrices };
// };

// // Function to list item on eBay
// const listOnEbay = async (itemName, price) => {
//   try {
//     const response = await axios.post(
//       "https://api.ebay.com/sell/inventory/v1/inventory_item",
//       {
//         title: itemName,
//         price,
//         category_id: "1234",
//       },
//       {
//         headers: { Authorization: `Bearer ${process.env.EBAY_ACCESS_TOKEN}` },
//       }
//     );
//     return { platform: "eBay", status: "Success", link: response.data.itemWebUrl };
//   } catch (error) {
//     return { platform: "eBay", status: "Failed", error: error.message };
//   }
// };

// // Function to list item on Craigslist (manual)
// const listOnCraigslist = async (itemName, price) => {
//   return {
//     platform: "Craigslist",
//     status: "Manual",
//     message: "Craigslist doesn't allow automation. Post manually.",
//     link: "https://craigslist.org/post",
//   };
// };

// // Function to list item on Facebook Marketplace (manual)
// const listOnFacebook = (itemName, price) => {
//   return {
//     platform: "Facebook Marketplace",
//     status: "Manual",
//     message: "Facebook API is restricted. Open link and list manually.",
//     link: `https://www.facebook.com/marketplace/create`,
//   };
// };

// // Main API endpoint to process image and list item
// app.post("/api/list", upload.single("image"), async (req, res) => {
//   try {
//     const imageBase64 = req.file.buffer.toString("base64");
//     const selectedPlatforms = JSON.parse(req.body.platforms || "[]");

//     const itemName = await recognizeItem(imageBase64);
//     if (!itemName) return res.status(400).json({ error: "Item not recognized" });

//     const pricing = await getBestSellingPrice(itemName);
//     if (!pricing.recommended_price) {
//       return res.status(400).json({ error: "Could not determine item price" });
//     }

//     let listingResults = [];
//     if (selectedPlatforms.includes("eBay")) {
//       listingResults.push(await listOnEbay(itemName, pricing.recommended_price));
//     }
//     if (selectedPlatforms.includes("Craigslist")) {
//       listingResults.push(await listOnCraigslist(itemName, pricing.recommended_price));
//     }
//     if (selectedPlatforms.includes("Facebook")) {
//       listingResults.push(listOnFacebook(itemName, pricing.recommended_price));
//     }

//     res.json({ item_details: { item_name: itemName, price: pricing.recommended_price }, listings: listingResults });
//   } catch (error) {
//     console.error("Error processing request:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.listen(5000, () => console.log("🚀 Server running on port 5000"));
