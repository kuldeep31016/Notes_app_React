import { verifyUser, setCurrentUser, getCurrentUser } from './storage';

type AuthListener = (isAuthenticated: boolean) => void;
const listeners: AuthListener[] = [];

const emitAuthChange = (isAuthenticated: boolean) => {
  listeners.forEach(listener => listener(isAuthenticated));
};

export const addAuthListener = (listener: AuthListener) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

export const login = async (username: string, password: string): Promise<boolean> => {
  const isValid = await verifyUser(username, password);
  if (isValid) {
    await setCurrentUser(username);
    emitAuthChange(true);
  }
  return isValid;
};

export const logout = async (): Promise<void> => {
  await setCurrentUser(null);
  emitAuthChange(false);
};

export const isLoggedIn = async (): Promise<boolean> => {
  const currentUser = await getCurrentUser();
  return currentUser !== null;
};

export const getLoggedInUser = async (): Promise<string | null> => {
  return await getCurrentUser();
};

