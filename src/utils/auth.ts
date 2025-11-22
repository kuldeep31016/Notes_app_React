import { verifyUser, setCurrentUser, getCurrentUser } from './storage';

export const login = async (username: string, password: string): Promise<boolean> => {
  const isValid = await verifyUser(username, password);
  if (isValid) {
    await setCurrentUser(username);
  }
  return isValid;
};

export const logout = async (): Promise<void> => {
  await setCurrentUser(null);
};

export const isLoggedIn = async (): Promise<boolean> => {
  const currentUser = await getCurrentUser();
  return currentUser !== null;
};

export const getLoggedInUser = async (): Promise<string | null> => {
  return await getCurrentUser();
};

