export interface User {
  username: string;
  password: string; // hashed
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  imageUri: string | null;
  createdAt: number;
  updatedAt: number;
}

export type SortOption = 
  | 'newest'
  | 'oldest'
  | 'titleAsc'
  | 'titleDesc';

export interface UserPreferences {
  sortOption: SortOption;
}

