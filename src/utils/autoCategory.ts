import { CATEGORIES, Category } from '../types';

const MERCHANT_RULES: { keywords: string[]; category: Category }[] = [
  { keywords: ['starbucks', 'chick-fil-a', 'chick fil a', 'mcdonald', 'chipotle', 'subway', 'dunkin', 'panera', 'taco bell', 'wendy', 'pizza', 'cafe', 'coffee', 'restaurant', 'grubhub', 'doordash', 'uber eats', 'ubereats'], category: 'Food' },
  { keywords: ['uber', 'lyft', 'shell', 'bp ', 'chevron', 'exxon', 'gas', 'metro', 'transit', 'parking', 'taxi'], category: 'Transportation' },
  { keywords: ['netflix', 'spotify', 'hulu', 'disney+', 'disney plus', 'hbo', 'apple music', 'youtube premium'], category: 'Entertainment' },
  { keywords: ['amazon', 'target', 'walmart', 'costco', 'best buy', 'etsy', 'ebay', 'shop'], category: 'Shopping' },
  { keywords: ['tuition', 'bookstore', 'university', 'college', 'school', 'coursera', 'udemy'], category: 'Education' },
  { keywords: ['rent', 'apartment', 'housing', 'landlord', 'mortgage', 'zillow'], category: 'Rent/Housing' },
  { keywords: ['hospital', 'pharmacy', 'cvs', 'walgreens', 'doctor', 'dental', 'health', 'gym', 'fitness'], category: 'Health' },
  { keywords: ['airline', 'hotel', 'airbnb', 'expedia', 'booking.com', 'flight'], category: 'Travel' },
  { keywords: ['electric', 'water', 'internet', 'comcast', 'verizon', 'at&t', 'utility', 'insurance'], category: 'Bills' },
  { keywords: ['savings', 'transfer to savings'], category: 'Savings' },
  { keywords: ['loan', 'credit card payment', 'debt'], category: 'Debt' },
];

export function inferCategory(text: string | null | undefined): Category | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const rule of MERCHANT_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.category;
    }
  }
  return null;
}

export function normalizeCategory(value: string | null | undefined): Category | null {
  if (!value?.trim()) return null;
  const lower = value.trim().toLowerCase();
  const match = CATEGORIES.find((c) => c.toLowerCase() === lower);
  if (match) return match;
  return inferCategory(value);
}
