import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dayjs from "dayjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length > 0) {
      frontmatter[key.trim()] = valueParts.join(":").trim().replace(/^["']|["']$/g, "");
    }
  });
  return frontmatter;
}

async function main() {
  // Dynamically import config
  const configPath = path.join(__dirname, "../src/config.ts");
  const configContent = await fs.readFile(configPath, "utf8");
  const homePageMatch = configContent.match(/homePage:\s*["']([^"']+)["']/);
  const homePage = homePageMatch ? homePageMatch[1].replace(/\/$/, "") : "https://weekly.tw93.fun";

  const postsDir = path.join(__dirname, "../src/pages/posts");
  const files = await fs.readdir(postsDir);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  const posts = await Promise.all(
    mdFiles.map(async (name) => {
      const [issueNumberPart, ...restTitleParts] = name.replace(".md", "").split("-");
      const num = parseInt(issueNumberPart);
      const shortTitle = restTitleParts.join("-") || issueNumberPart;

      const mdContent = await fs.readFile(path.join(postsDir, name), "utf8");
      const frontmatter = parseFrontmatter(mdContent);

      // Get first image from markdown if no image in frontmatter
      let pic = frontmatter.image || "";
      if (!pic) {
        const imgMatch = mdContent.match(/!\[.*?\]\((.*?)\)/);
        pic = imgMatch ? imgMatch[1] : "";
      }
      // Prepend homePage if pic is a relative path
      if (pic && pic.startsWith("/")) {
        pic = `${homePage}${pic}`;
      }

      return {
        num,
        title: shortTitle,
        url: `${homePage}/posts/${num}`,
        pic,
        description: frontmatter.description || "",
        modified: frontmatter.date || dayjs().format("YYYY-MM-DD"),
      };
    })
  );

  // Sort by num descending
  posts.sort((a, b) => b.num - a.num);

  await fs.writeFile(
    path.join(__dirname, "../public/posts.json"),
    JSON.stringify(posts, null, 2)
  );

  console.log(`Generated posts.json with ${posts.length} posts`);
}

main().catch(console.error);