/**
 * Google News 服务
 * 直接调用 Google News RSS 端点获取新闻
 * 
 * 无需外部 MCP 服务器，纯 TypeScript 实现
 */

/** 新闻文章 */
export interface GoogleNewsArticle {
  /** 标题 */
  title: string;
  /** 链接 */
  link: string;
  /** 发布时间 */
  pubDate: string;
  /** 来源 */
  source: string;
  /** 描述/摘要 */
  description: string;
}

/** 支持的新闻主题 */
export type NewsTopic =
  | "WORLD"
  | "NATION"
  | "BUSINESS"
  | "TECHNOLOGY"
  | "ENTERTAINMENT"
  | "SPORTS"
  | "SCIENCE"
  | "HEALTH";

/** 主题名称映射 */
export const TOPIC_NAMES: Record<NewsTopic, string> = {
  WORLD: "国际",
  NATION: "国内",
  BUSINESS: "商业",
  TECHNOLOGY: "科技",
  ENTERTAINMENT: "娱乐",
  SPORTS: "体育",
  SCIENCE: "科学",
  HEALTH: "健康",
};

/** 话题到主题的映射 */
const TOPIC_MAPPING: Record<string, NewsTopic> = {
  // 科技相关
  科技: "TECHNOLOGY",
  技术: "TECHNOLOGY",
  互联网: "TECHNOLOGY",
  人工智能: "TECHNOLOGY",
  ai: "TECHNOLOGY",
  编程: "TECHNOLOGY",
  开发: "TECHNOLOGY",
  软件: "TECHNOLOGY",
  硬件: "TECHNOLOGY",
  数码: "TECHNOLOGY",
  手机: "TECHNOLOGY",
  电脑: "TECHNOLOGY",
  technology: "TECHNOLOGY",
  tech: "TECHNOLOGY",

  // 商业相关
  商业: "BUSINESS",
  经济: "BUSINESS",
  金融: "BUSINESS",
  股票: "BUSINESS",
  投资: "BUSINESS",
  创业: "BUSINESS",
  business: "BUSINESS",
  finance: "BUSINESS",

  // 娱乐相关
  娱乐: "ENTERTAINMENT",
  明星: "ENTERTAINMENT",
  电影: "ENTERTAINMENT",
  电视剧: "ENTERTAINMENT",
  综艺: "ENTERTAINMENT",
  音乐: "ENTERTAINMENT",
  动漫: "ENTERTAINMENT",
  游戏: "ENTERTAINMENT",
  entertainment: "ENTERTAINMENT",

  // 体育相关
  体育: "SPORTS",
  篮球: "SPORTS",
  足球: "SPORTS",
  nba: "SPORTS",
  运动: "SPORTS",
  sports: "SPORTS",

  // 科学相关
  科学: "SCIENCE",
  研究: "SCIENCE",
  学术: "SCIENCE",
  science: "SCIENCE",

  // 健康相关
  健康: "HEALTH",
  医疗: "HEALTH",
  养生: "HEALTH",
  health: "HEALTH",

  // 国际相关
  国际: "WORLD",
  世界: "WORLD",
  全球: "WORLD",
  world: "WORLD",
  global: "WORLD",

  // 国内相关
  国内: "NATION",
  中国: "NATION",
  nation: "NATION",
};

/** Google News RSS 基础 URL */
const GOOGLE_NEWS_BASE = "https://news.google.com/rss";

/**
 * 解析 RSS XML 并提取文章
 */
function parseRSSItems(xml: string): GoogleNewsArticle[] {
  const articles: GoogleNewsArticle[] = [];
  
  // 使用正则表达式提取 <item> 元素（服务端无 DOMParser）
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    // 提取各字段
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    const description = extractTag(itemXml, "description");
    const source = extractTag(itemXml, "source");
    
    if (title && link) {
      articles.push({
        title: decodeHTMLEntities(title),
        link,
        pubDate: pubDate ?? "",
        source: source ?? extractSourceFromTitle(title),
        description: decodeHTMLEntities(cleanDescription(description ?? "")),
      });
    }
  }
  
  return articles;
}

/**
 * 从 XML 中提取标签内容
 */
function extractTag(xml: string, tag: string): string | null {
  // 处理 CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i");
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }
  
  // 普通标签
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

/**
 * 从标题中提取来源（格式：标题 - 来源）
 */
function extractSourceFromTitle(title: string): string {
  const parts = title.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1] : "Google News";
}

/**
 * 清理描述内容（移除 HTML 标签）
 */
function cleanDescription(html: string): string {
  return html
    .replace(/<[^>]+>/g, "") // 移除 HTML 标签
    .replace(/&nbsp;/g, " ")
    .trim();
}

/**
 * 解码 HTML 实体
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&#x27;": "'",
    "&#x2F;": "/",
  };
  
  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.split(entity).join(char);
  }
  
  // 处理数字实体
  result = result.replace(/&#(\d+);/g, (_, code) => 
    String.fromCharCode(parseInt(code, 10))
  );
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => 
    String.fromCharCode(parseInt(code, 16))
  );
  
  return result;
}

/**
 * 格式化文章为 Markdown
 */
function formatArticlesToMarkdown(articles: GoogleNewsArticle[], title: string): string {
  if (articles.length === 0) {
    return `## ${title}\n\n暂无相关新闻\n`;
  }
  
  const lines = [`## ${title}\n`];
  
  for (const [index, article] of articles.entries()) {
    const num = index + 1;
    const source = article.source ? ` - ${article.source}` : "";
    const date = article.pubDate 
      ? ` (${new Date(article.pubDate).toLocaleDateString("zh-CN")})`
      : "";
    
    lines.push(`${num}. [${article.title}](${article.link})${source}${date}`);
    
    if (article.description) {
      lines.push(`   > ${article.description.slice(0, 150)}...`);
    }
    lines.push("");
  }
  
  return lines.join("\n");
}

/**
 * Google News 服务类
 */
class GoogleNewsService {
  private readonly maxArticles = 10;
  private readonly timeout = 15000;

  /**
   * 获取 RSS feed
   */
  private async fetchRSS(url: string): Promise<string> {
    console.log(`[GoogleNewsService] 获取 RSS: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
          "Accept": "application/rss+xml, application/xml, text/xml",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 根据关键词搜索新闻
   */
  async getNewsByKeyword(keyword: string): Promise<string> {
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `${GOOGLE_NEWS_BASE}/search?q=${encodedKeyword}&hl=en-US&gl=US&ceid=US:en`;
    
    try {
      const xml = await this.fetchRSS(url);
      const articles = parseRSSItems(xml).slice(0, this.maxArticles);
      
      console.log(`[GoogleNewsService] 关键词 "${keyword}" 找到 ${articles.length} 篇文章`);
      
      return formatArticlesToMarkdown(articles, `Search: ${keyword}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      console.error(`[GoogleNewsService] 搜索失败: ${message}`);
      throw new Error(`搜索新闻失败: ${message}`);
    }
  }

  /**
   * 根据主题获取新闻
   */
  async getNewsByTopic(topic: NewsTopic): Promise<string> {
    const url = `${GOOGLE_NEWS_BASE}/headlines/section/topic/${topic}?hl=en-US&gl=US&ceid=US:en`;
    
    try {
      const xml = await this.fetchRSS(url);
      const articles = parseRSSItems(xml).slice(0, this.maxArticles);
      
      console.log(`[GoogleNewsService] 主题 "${topic}" 找到 ${articles.length} 篇文章`);
      
      return formatArticlesToMarkdown(articles, `${TOPIC_NAMES[topic]} (${topic})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      console.error(`[GoogleNewsService] 获取主题新闻失败: ${message}`);
      throw new Error(`获取主题新闻失败: ${message}`);
    }
  }

  /**
   * 获取头条新闻
   */
  async getTopNews(): Promise<string> {
    const url = `${GOOGLE_NEWS_BASE}?hl=en-US&gl=US&ceid=US:en`;
    
    try {
      const xml = await this.fetchRSS(url);
      const articles = parseRSSItems(xml).slice(0, this.maxArticles);
      
      console.log(`[GoogleNewsService] 头条新闻找到 ${articles.length} 篇文章`);
      
      return formatArticlesToMarkdown(articles, "Top Headlines");
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      console.error(`[GoogleNewsService] 获取头条失败: ${message}`);
      throw new Error(`获取头条新闻失败: ${message}`);
    }
  }

  /**
   * 根据用户话题智能获取新闻
   * 自动匹配主题或使用关键词搜索
   */
  async getNewsByUserTopic(userTopic: string): Promise<string> {
    const lowerTopic = userTopic.toLowerCase().trim();
    
    // 1. 尝试匹配预定义主题
    for (const [keyword, topic] of Object.entries(TOPIC_MAPPING)) {
      if (lowerTopic.includes(keyword)) {
        console.log(
          `[GoogleNewsService] 话题 "${userTopic}" 匹配主题 "${TOPIC_NAMES[topic]}"`
        );
        return this.getNewsByTopic(topic);
      }
    }
    
    // 2. 如果没有匹配的主题，使用关键词搜索
    console.log(
      `[GoogleNewsService] 话题 "${userTopic}" 无主题匹配，使用关键词搜索`
    );
    return this.getNewsByKeyword(userTopic);
  }

  /**
   * 获取综合新闻（头条 + 科技）
   */
  async getComprehensiveNews(): Promise<string> {
    const results = await Promise.allSettled([
      this.getTopNews(),
      this.getNewsByTopic("TECHNOLOGY"),
    ]);
    
    const parts: string[] = ["# Google News\n"];
    
    if (results[0].status === "fulfilled") {
      parts.push(results[0].value);
    }
    
    if (results[1].status === "fulfilled") {
      parts.push(results[1].value);
    }
    
    return parts.join("\n---\n\n");
  }
}

// 导出单例
export const googleNewsService = new GoogleNewsService();
export { GoogleNewsService };
