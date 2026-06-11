import { atom } from "recoil";

export interface NewsItem {
  id: string;
  title: string;
  image: string;
  date: string;
  desc?: string;
}

export const newsListState = atom<NewsItem[]>({
  key: "newsListState",
  default: [],
});

export const newsLoadingState = atom<boolean>({
  key: "newsLoadingState",
  default: false,
});

export const newsDetailState = atom<NewsItem | null>({
  key: "newsDetailState",
  default: null,
});

export const eventDetailVisibleState = atom<boolean>({
  key: "eventDetailVisibleState",
  default: false,
});
