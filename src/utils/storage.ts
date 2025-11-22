import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Note, UserPreferences, SortOption } from '../types';

const STORAGE_KEYS = {
  USERS: 'users',
  CURRENT_USER: 'current_user',
  NOTES_PREFIX: 'user_',
  NOTES_SUFFIX: '_notes',
  PREFERENCES_PREFIX: 'user_preferences_',
};

// Simple hash function for passwords (in production, use bcrypt or similar)
const hashPassword = (password: string): string => {
  // Simple hash - in production use proper hashing
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

// User Management
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const saveUser = async (user: Omit<User, 'createdAt'>): Promise<boolean> => {
  try {
    const users = await getAllUsers();
    
    // Check if username already exists
    if (users.some(u => u.username === user.username)) {
      return false;
    }

    const newUser: User = {
      ...user,
      password: hashPassword(user.password),
      createdAt: Date.now(),
    };

    users.push(newUser);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

export const verifyUser = async (username: string, password: string): Promise<boolean> => {
  try {
    const users = await getAllUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) return false;
    
    const hashedPassword = hashPassword(password);
    return user.password === hashedPassword;
  } catch (error) {
    console.error('Error verifying user:', error);
    return false;
  }
};

export const setCurrentUser = async (username: string | null): Promise<void> => {
  try {
    if (username) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

export const getCurrentUser = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Notes Management
const getNotesKey = (username: string): string => {
  return `${STORAGE_KEYS.NOTES_PREFIX}${username}${STORAGE_KEYS.NOTES_SUFFIX}`;
};

export const getNotes = async (username: string): Promise<Note[]> => {
  try {
    const notesJson = await AsyncStorage.getItem(getNotesKey(username));
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
};

export const saveNote = async (username: string, note: Note): Promise<boolean> => {
  try {
    const notes = await getNotes(username);
    const existingIndex = notes.findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      notes[existingIndex] = note;
    } else {
      notes.push(note);
    }
    
    await AsyncStorage.setItem(getNotesKey(username), JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Error saving note:', error);
    return false;
  }
};

export const deleteNote = async (username: string, noteId: string): Promise<boolean> => {
  try {
    const notes = await getNotes(username);
    const filteredNotes = notes.filter(n => n.id !== noteId);
    await AsyncStorage.setItem(getNotesKey(username), JSON.stringify(filteredNotes));
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    return false;
  }
};

// User Preferences
const getPreferencesKey = (username: string): string => {
  return `${STORAGE_KEYS.PREFERENCES_PREFIX}${username}`;
};

export const getUserPreferences = async (username: string): Promise<UserPreferences> => {
  try {
    const prefsJson = await AsyncStorage.getItem(getPreferencesKey(username));
    if (prefsJson) {
      return JSON.parse(prefsJson);
    }
    return { sortOption: 'newest' };
  } catch (error) {
    console.error('Error getting preferences:', error);
    return { sortOption: 'newest' };
  }
};

export const saveUserPreferences = async (username: string, preferences: UserPreferences): Promise<void> => {
  try {
    await AsyncStorage.setItem(getPreferencesKey(username), JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

