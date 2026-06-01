import { ImportReviewItem } from '../types';

export type RootStackParamList = {
  MainTabs: undefined;
  ImportReview: { items: ImportReviewItem[] };
};

export type TabParamList = {
  Dashboard: undefined;
  History: undefined;
  Goals: undefined;
  Insights: undefined;
};
