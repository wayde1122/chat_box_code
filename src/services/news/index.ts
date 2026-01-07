/**
 * 新闻服务导出
 */

export { newsCoordinator, NewsCoordinator } from "./newsCoordinator";
export type { 
  NewsEvent, 
  NewsEventType, 
  NewsEventCallback,
} from "./newsCoordinator";

// Google News 服务
export { googleNewsService, GoogleNewsService } from "./googleNewsService";
export type { GoogleNewsArticle, NewsTopic } from "./googleNewsService";
