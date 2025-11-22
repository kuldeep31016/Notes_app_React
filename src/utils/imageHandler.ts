import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, ImageLibraryOptions, CameraOptions } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

const defaultOptions: ImageLibraryOptions | CameraOptions = {
  mediaType: 'photo',
  quality: 0.8,
  includeBase64: false,
};

// Get persistent directory for storing images
export const getImageDirectory = (): string => {
  const path = Platform.OS === 'ios' 
    ? RNFS.DocumentDirectoryPath 
    : RNFS.DocumentDirectoryPath;
  return `${path}/notes_images`;
};

// Ensure image directory exists
export const ensureImageDirectory = async (): Promise<string> => {
  const dir = getImageDirectory();
  const exists = await RNFS.exists(dir);
  if (!exists) {
    await RNFS.mkdir(dir);
  }
  return dir;
};

// Copy image to persistent storage
export const saveImageToStorage = async (imageUri: string): Promise<string | null> => {
  try {
    const dir = await ensureImageDirectory();
    const fileName = `note_${Date.now()}.jpg`;
    const destPath = `${dir}/${fileName}`;
    
    await RNFS.copyFile(imageUri, destPath);
    return destPath;
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
};

// Delete image from storage
export const deleteImageFromStorage = async (imageUri: string): Promise<void> => {
  try {
    if (imageUri && (await RNFS.exists(imageUri))) {
      await RNFS.unlink(imageUri);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Pick image from gallery
export const pickImageFromGallery = (): Promise<string | null> => {
  return new Promise((resolve) => {
    launchImageLibrary(defaultOptions, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorCode) {
        resolve(null);
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        const savedPath = await saveImageToStorage(uri);
        resolve(savedPath);
      } else {
        resolve(null);
      }
    });
  });
};

// Take photo with camera
export const takePhoto = (): Promise<string | null> => {
  return new Promise((resolve) => {
    launchCamera(defaultOptions, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorCode) {
        resolve(null);
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        const savedPath = await saveImageToStorage(uri);
        resolve(savedPath);
      } else {
        resolve(null);
      }
    });
  });
};

// Check if image file exists
export const imageExists = async (imageUri: string | null): Promise<boolean> => {
  if (!imageUri) return false;
  try {
    return await RNFS.exists(imageUri);
  } catch {
    return false;
  }
};

