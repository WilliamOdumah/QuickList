require("dotenv").config();
const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const cors = require("cors");
const platformCategories = require("./platformCategories");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const path = require("path");
const readline = require("readline");
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");


app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const fs = require("fs");

const saveCookies = async (page) => {
  const cookies = await page.cookies();
  fs.writeFileSync("fb-cookies.json", JSON.stringify(cookies));
};

const loadCookies = async (page) => {
  if (fs.existsSync("fb-cookies.json")) {
    const cookies = JSON.parse(fs.readFileSync("fb-cookies.json"));
    await page.setCookie(...cookies);
  }
};



const platformConditions = {
  facebook: ["New", "Used - Like New", "Used - Good", "Used - Fair"],
  kijiji: ["New", "Used - Like New", "Used - Good", "Used - Fair"],
  craigslist: ["new", "like new", "excellent", "good", "fair", "salvage"],
  ebay: ["Brand New", "Like New", "Very Good", "Good", "Acceptable"],
};

const extractItemDetailsForPlatform = async (imageBuffer, platform) => {
  try {
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
                "category": "Choose best option from: ${platformCategories[platform].join(", ")} based on the item you see",
                "condition": "Choose best option from: ${platformConditions[platform].join(", ")} based on the item you see",
              }
            `},
            { type: "image_url", image_url: { url: imageBase64 } }
          ],
        },
      ],
      temperature: 0.2,
    });

    let rawContent = response.choices[0].message.content.replace(/```json|```/g, "").trim();
    console.log(`✅ Extracted Item Details for ${platform}:`, rawContent);
    return JSON.parse(rawContent);
  } catch (error) {
    console.error(`❌ Error extracting item details for ${platform}:`, error.response ? error.response.data : error.message);
    return null;
  }
};

const getSuggestedPrice = async (itemDetails) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `
            Based on the following product details, research and suggest a single best-selling price using real online prices (eBay, Amazon, Walmart, etc.).
            Provide the response **ONLY in JSON format**, with **NO additional text**. And only whole numbers

            Product Details:
            ${JSON.stringify(itemDetails, null, 2)}

            Strict JSON format:
            {
              "suggested_price": 123
            }
          `,
        },
      ],
      temperature: 0.2,
    });

    let rawContent = response.choices[0].message.content.replace(/```json|```/g, "").trim();
    console.log("✅ Suggested Price:", rawContent);
    return JSON.parse(rawContent);
  } catch (error) {
    console.error("❌ Error determining suggested price:", error.response ? error.response.data : error.message);
    return { suggested_price: null };
  }
};


// Enable stealth mode to prevent bot detection
puppeteer.use(stealthPlugin());

// const postListingWithPuppeteer = async (platform, details, imagePath) => {
//     const browser = await puppeteer.launch({
//       headless: false,
//       userDataDir: "./fb-session", // Keep session active
//       args: ["--disable-blink-features=AutomationControlled"], // Helps avoid bot detection
//     });
  
//     const page = await browser.newPage();
//     try {
//       console.log("🟢 Opening Facebook Marketplace...");
//       await page.goto("https://www.facebook.com/marketplace/create/item", { waitUntil: "domcontentloaded" });
  
//       // 🛑 Check if Facebook requires login
//       if (await page.$('input[name="email"]')) {
//         console.log("🔴 Facebook requires login. Waiting for manual login...");
//         await waitForLogin(page); // Wait for login to be detected
//       }
  
//       console.log("🟢 Login detected. Proceeding with listing...");
      
//     //   // ✅ Wait for the image upload button
//     //   console.log("🟢 Uploading image...");
//     //   await page.waitForSelector('input[type="file"]', { timeout: 20000 });
//     //   const inputUploadHandle = await page.$('input[type="file"]');
//     //   await inputUploadHandle.uploadFile(imagePath);
  
//     //   // ✅ Ensure the image loads properly before continuing
//     //   await new Promise(resolve => setTimeout(resolve, 5000));
  

//      // ✅ Enter Title (Updated Selector)
//     console.log("🟢 Entering title...");
//     await page.waitForSelector('input[name="Title"]', { timeout: 10000 });
//     await page.type('input[name="Title"]', details.item_name);

//     // ✅ Enter Price (Updated Selector)
//     console.log("🟢 Entering price...");
//     await page.waitForSelector('input[aria-label="Price"]', { timeout: 10000 });
//     await page.type('input[aria-label="Price"]', details.suggested_price.toString());

//     // ✅ Select Category (Updated Click-Based Dropdown)
//     console.log("🟢 Selecting category...");
//     await page.waitForSelector('div[role="button"][aria-label="Category"]', { timeout: 10000 });
//     await page.click('div[role="button"][aria-label="Category"]');
//     await new Promise(resolve => setTimeout(resolve, 2000)); // Allow dropdown to open

//     // Select category by typing and pressing enter
//     await page.keyboard.type(details.category);
//     await page.keyboard.press("Enter");
//     await new Promise(resolve => setTimeout(resolve, 2000)); // Ensure selection registers

//     // ✅ Select Condition (Updated Click-Based Dropdown)
//     console.log("🟢 Selecting condition...");
//     await page.waitForSelector('div[role="button"][aria-label="Condition"]', { timeout: 10000 });
//     await page.click('div[role="button"][aria-label="Condition"]');
//     await new Promise(resolve => setTimeout(resolve, 2000)); // Allow dropdown to open

//     // Select condition by typing and pressing enter
//     await page.keyboard.type(details.condition);
//     await page.keyboard.press("Enter");
//     await new Promise(resolve => setTimeout(resolve, 2000)); // Ensure selection registers

//     // ✅ Enter Description (Updated Selector)
//     console.log("🟢 Entering description...");
//     await page.waitForSelector('textarea[aria-label="Description"]', { timeout: 10000 });
//     await page.type('textarea[aria-label="Description"]', "Listed using Quick List");

//     // ✅ Click Publish (Updated Selector)
//     console.log("🟢 Publishing listing...");
//     await page.waitForSelector('div[role="button"]:has-text("Publish")', { timeout: 10000 });
//     await page.click('div[role="button"]:has-text("Publish")');

//     console.log(`✅ Successfully listed ${details.item_name} on Facebook!`);
//     await new Promise(resolve => setTimeout(resolve, 5000)); // ✅ Fixed wait

//     await browser.close();

//       return true;
//     } catch (error) {
//       console.error(`❌ Error listing on Facebook:`, error);
//       await browser.close();
//       return false;
//     }
//   };


const postListingWithPuppeteer = async (platform, details) => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: "./kijiji-session", // Keep session active
        args: ["--disable-blink-features=AutomationControlled"], // Helps avoid bot detection
    });

    const page = await browser.newPage();
    try {
        console.log("🟢 Opening Kijiji...");
        await page.goto("https://www.kijiji.ca/p-select-category.html", { waitUntil: "domcontentloaded" });

        // Check if Kijiji requires login
        if (await page.$('input[name="emailOrNickname"]')) {
            console.log("🔴 Kijiji requires login. Waiting for manual login...");
            await waitForLogin(page);
        }

        console.log("🟢 Login detected. Proceeding with listing...");

        // Wait for the Title field to appear (Ensure form loads)
        console.log("🟢 Waiting for the listing form to load...");
        await page.waitForSelector("#AdTitleForm", { timeout: 15000 });

        // Enter Title
        console.log("🟢 Entering title...");
        await page.type("#AdTitleForm", details.item_name);

        console.log("🟢 Clicking Next...");
        await page.waitForSelector('button[class*="button__futurePrimary"]', { timeout: 10000 });
        await page.click('button[class*="button__futurePrimary"]');
        console.log("✅ Next button clicked!");

        console.log("🟢 Selecting 'Buy & Sell' category...");
        await page.waitForSelector('button:has(span[class*="categoryName"])', { timeout: 10000 });
        await page.click('button:has(span[class*="categoryName"])');
        console.log("✅ 'Buy & Sell' category selected!");

        // Scroll down to ensure category selection is visible
        console.log("🟢 Scrolling to the bottom...");
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log("🟢 Selecting last category...");
        const categoryButtons = await page.$$('button[class*="categoryButton-"]'); 
        await categoryButtons[categoryButtons.length - 1].click();
        console.log("✅ Last category selected!");

        // Enter Description
        console.log("🟢 Entering description...");
        await page.waitForSelector('#pstad-descrptn', { timeout: 10000 });
        await page.type('#pstad-descrptn', 'Listed by QuickList');
        console.log("✅ Description entered!");

        // Enter Price
        console.log("🟢 Entering price...");
        await page.waitForSelector('#PriceAmount', { timeout: 10000 });
        await page.type('#PriceAmount', details.suggested_price.toString());
        console.log("✅ Price entered!");

        // Click 'Post Ad' button
        console.log("🟢 Clicking 'Post Ad' button...");
        await page.waitForSelector('button[class*="button__primary-"]', { timeout: 10000 });
        await page.click('button[class*="button__primary-"]');
        console.log("✅ Ad posted successfully!");

        // Wait for Redirect to Listing Page
        console.log("🟢 Waiting for Kijiji to redirect to the listing...");
        await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 });

        // Extract Listing URL
        const listingUrl = page.url();
        console.log(`✅ Listing URL: ${listingUrl}`);

        await browser.close();
        return listingUrl;
    } catch (error) {
        console.error(`❌ Error listing on Kijiji:`, error);
        await browser.close();
        return null;
    }
};


// Function to Wait for User Login**
const waitForLogin = async (page) => {
    while (true) {
        console.log("🔵 Waiting for user to log in...");
        await new Promise(resolve => setTimeout(resolve, 5000));

        const isLoggedIn = await page.evaluate(() => {
            return document.body.innerText.includes("Post an Ad") || document.body.innerText.includes("My Kijiji");
        });

        if (isLoggedIn) {
            console.log("✅ User is logged in!");
            return;
        }
    }
};



app.post("/api/list", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }
  
      const imageBuffer = req.file.buffer;
      const selectedPlatforms = JSON.parse(req.body.platforms || "[]");
  
      if (selectedPlatforms.length === 0) {
        return res.status(400).json({ error: "No platforms selected" });
      }
  
      let platformResponses = {};
  
      for (const platform of selectedPlatforms) {
        if (!platformConditions[platform.toLowerCase()]) {
          console.warn(`⚠️ Skipping unknown platform: ${platform}`);
          continue;
        }
  
        const itemDetails = await extractItemDetailsForPlatform(imageBuffer, platform.toLowerCase());
  
        if (itemDetails) {
          const priceDetails = await getSuggestedPrice(itemDetails);
          
          // Merge the extracted details with the suggested price correctly
          platformResponses[platform] = { 
            ...itemDetails, 
            suggested_price: priceDetails.suggested_price 
          };
  
          console.log(`✅ Extracted Item Details for ${platform}:`, platformResponses[platform]);
        }
      }
  
      res.json(platformResponses);
    } catch (error) {
      console.error("❌ Error processing request:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


  
app.post("/api/post-listing", async (req, res) => {
    const { platform, details } = req.body;

    if (!platform || !details) {
        return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    try {
        console.log(`🟢 Attempting to post listing for ${platform}...`);
        const success = await postListingWithPuppeteer(platform, details);

        if (success) {
            // If platform is Kijiji, return the active listings page
            const listingUrl = platform.toLowerCase() === "kijiji"
                ? "https://www.kijiji.ca/m-my-ads/active/1"
                : null; // Other platforms can have their own logic later

            res.json({ success: true, listing_url: listingUrl });
        } else {
            res.status(500).json({ success: false, message: "Failed to post listing" });
        }
    } catch (error) {
        console.error(`❌ Error posting to ${platform}:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put("/api/update-listing", async (req, res) => {
    const { platform, updatedDetails } = req.body;

    if (!platform || !updatedDetails) {
        return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    try {
        console.log(`Updating ${platform} listing:`, updatedDetails);
        res.json({ success: true, message: "Listing updated successfully" });
    } catch (error) {
        console.error(`❌ Error updating listing for ${platform}:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});


app.delete("/api/delete-listing", async (req, res) => {
    const { platform } = req.body;

    if (!platform) {
        return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    try {
        console.log(`🗑️ Deleting ${platform} listing...`);
        res.json({ success: true, message: "Listing deleted successfully" });
    } catch (error) {
        console.error(`❌ Error deleting listing for ${platform}:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));