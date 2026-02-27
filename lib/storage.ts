"use client";

import { SavedSearch, VCList } from "./types";

const LISTS_KEY = "vc_lists_v1";
const SAVED_SEARCHES_KEY = "vc_saved_searches_v1";
const NOTES_KEY = "vc_notes_v1";

export const storage = {
  getLists(): VCList[] {
    return JSON.parse(localStorage.getItem(LISTS_KEY) ?? "[]");
  },
  setLists(lists: VCList[]) {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  },
  getSavedSearches(): SavedSearch[] {
    return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) ?? "[]");
  },
  setSavedSearches(searches: SavedSearch[]) {
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
  },
  getNotes(): Record<string, string> {
    return JSON.parse(localStorage.getItem(NOTES_KEY) ?? "{}");
  },
  setNotes(notes: Record<string, string>) {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }
};
