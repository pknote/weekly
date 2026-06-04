import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dayjs from "dayjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  // Dynamically import config
  const configPath = path.join(__dirname, "../src/config.ts");
  const configContent = await fs.readFile(configPath, "utf8");
  const repoMatch = configContent.match(/repo:\s*["']([^"']+)["']/);
  const titleMatch = configContent.match(/title:\s*["']([^"']+)["']/);
  const homePageMatch = configContent.match(/homePage:\s*["']([^"']+)["']/);

  const repo = repoMatch ? repoMatch[1] : "tw93/weekly";
  const siteTitle = titleMatch ? titleMatch[1] : "Weekly";
  const homePage = homePageMatch ? homePageMatch[1].replace(/\/$/, "") : "https://weekly.tw93.fun";

  const postsDir = path.join(__dirname, "../src/pages/posts");
  const files = await fs.readdir(postsDir);
  const mdFiles = files
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)/)?.[0] || "0");
      const numB = parseInt(b.match(/(\d+)/)?.[0] || "0");
      return numB - numA;
    });

  const posts = [];

  for (const name of mdFiles) {
    const [issueNumberPart, ...restTitleParts] = name.replace(".md", "").split("-");
    const num = parseInt(issueNumberPart);
    const shortTitle = restTitleParts.join("-") || issueNumberPart;
    const url = `${homePage}/posts/${num}`;
    const title = `第 ${num} 期 - ${shortTitle}`;

    // Read markdown file to extract cover image and description
    const mdContent = await fs.readFile(path.join(postsDir, name), "utf8");
    const imgMatch = mdContent.match(/<img\s+src="([^"]+)"/);
    const pic = imgMatch ? imgMatch[1] : "";

    const descMatch = mdContent.match(/<small>(.*?)<\/small>/s);
    const description = descMatch ? descMatch[1].trim() : "";

    // Use local file mtime as modified date
    const fileStat = await fs.stat(path.join(postsDir, name));
    const modified = dayjs(fileStat.mtime).format("YYYY-MM-DD");

    posts.push({ num, title: shortTitle, url, pic, description, modified });
  }

  await fs.writeFile(
    path.join(__dirname, "../public/posts.json"),
    JSON.stringify(posts, null, 2)
  );

  console.log(`Generated posts.json with ${posts.length} posts`);
}

main().catch(console.error);