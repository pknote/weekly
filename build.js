import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dayjs from "dayjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple config - can be modified
const SITE = {
  title: "胖氪笔记",
  homePage: "https://windowsplus.cn/",
};

async function main() {
  const postsDir = path.join(__dirname, "src/pages/posts");

  const files = await fs.readdir(postsDir);
  const mdFiles = files
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)/)[0]);
      const numB = parseInt(b.match(/(\d+)/)[0]);
      return numB - numA;
    });

  const posts = [];

  for (const name of mdFiles) {
    const filePath = path.join(postsDir, name);
    const mdContent = await fs.readFile(filePath, "utf8");

    // Extract frontmatter
    const fmMatch = mdContent.match(/^---\n([\s\S]*?)\n---/);
    let frontmatter = {};
    if (fmMatch) {
      fmMatch[1].split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length > 0) {
          frontmatter[key.trim()] = valueParts.join(":").trim();
        }
      });
    }

    // Extract first image
    const imgMatch = mdContent.match(/<img\s+src="([^"]+)"/);
    const pic = imgMatch ? imgMatch[1] : "";

    // Extract title from frontmatter or filename
    const title = frontmatter.title || name.replace(/\.md$/, "");

    // Extract number from filename
    const numMatch = name.match(/(\d+)/);
    const num = numMatch ? parseInt(numMatch[1]) : 0;

    // Extract description from <small> tag
    const descMatch = mdContent.match(/<small>(.*?)<\/small>/s);
    const description = descMatch ? descMatch[1].trim() : "";

    // Get file date
    const stats = await fs.stat(filePath);
    const date = dayjs(stats.birthtime).format("YYYY/MM/DD");

    const url = `${SITE.homePage.replace(/\/$/, "")}/${num}.html`;

    posts.push({ num, title, url, pic, description, date });
  }

  await fs.writeFile("public/posts.json", JSON.stringify(posts, null, 2));
  console.log(`Generated posts.json with ${posts.length} posts`);
}

main().catch(console.error);