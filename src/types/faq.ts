export interface FAQCategory {
  id: string;
  name: string;
  description: string;
}

export interface FAQItem {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  keywords: string[];
}

export interface FAQData {
  categories: FAQCategory[];
  items: FAQItem[];
}

