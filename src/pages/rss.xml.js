import rss from "@astrojs/rss";
import { getIndex, parseTitle, toNumericUrl } from "@/util";
export async function GET() {
  let allPosts = import.meta.glob("./posts/*.md", { eager: true });
  let posts = Object.values(allPosts);

  posts = posts.sort((a, b) => getIndex(b.url) - getIndex(a.url));

  // Only 12 are kept
  posts = posts.slice(0, 12);

  // 处理 Markdown 内容，返回不过滤的标签的原始内容
  const processContent = async (item) => {
    const content = await item.compiledContent();
    return content;
  };

  return rss({
    title: "胖氪笔记",
    description: "专注分享免费、开源、高质量的软件工具！",
    site: "https://windowsplus.cn/",
    customData: `<image><url>https://windowsplus.cn/image/favicon.png</url></image><follow_challenge><feedId>41147805276726275</feedId><userId>42909600318350336</userId></follow_challenge>`,
    items: await Promise.all(
      posts.map(async (item) => {
        const numericLink = item.frontmatter.numericUrl ?? toNumericUrl(item.url);
        const title = parseTitle(
          numericLink,
          item.frontmatter.legacySlug,
          item.frontmatter.issueTitle,
        );
        return {
          link: numericLink,
          title,
          description: await processContent(item),
          pubDate: item.frontmatter.date,
        };
      }),
    ),
  });
}
