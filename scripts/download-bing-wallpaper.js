import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dayjs from "dayjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, "../public/assets");
const BING_API = "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN";

async function downloadBingWallpaper() {
  try {
    // Ensure assets directory exists
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    // Fetch Bing wallpaper info
    const { data } = await axios.get(BING_API);
    const { images } = data;
    if (!images || images.length === 0) {
      console.log("No Bing wallpaper data received");
      return;
    }

    const imageInfo = images[0];
    const imageUrl = `https://www.bing.com${imageInfo.url}`;
    const dateStr = dayjs().format("YYYY-MM-DD");
    const fileName = `${dateStr}.jpg`;
    const filePath = path.join(ASSETS_DIR, fileName);

    // Skip if already downloaded today
    if (fs.existsSync(filePath)) {
      console.log(`Bing wallpaper already exists: ${fileName}`);
      return;
    }

    // Download image
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(imageResponse.data));

    console.log(`Downloaded Bing wallpaper: ${fileName}`);
  } catch (error) {
    console.error("Failed to download Bing wallpaper:", error.message);
  }
}

downloadBingWallpaper();