# Offline Notes App

A fully functional, offline-first React Native application that allows multiple users to manage their personal notes on a single device. All data is stored locally with complete offline functionality.

## Features

- ✅ **Multi-User Authentication**: Sign up and login with unique usernames
- ✅ **Offline-First**: All data stored locally using AsyncStorage
- ✅ **Notes Management**: Create, edit, delete, and view notes
- ✅ **Image Support**: Add images from gallery or camera
- ✅ **Search**: Real-time search through note titles and content
- ✅ **Sorting**: Sort notes by date or title (ascending/descending)
- ✅ **User Isolation**: Each user only sees their own notes
- ✅ **Modern UI**: Clean, professional interface with smooth animations

## Prerequisites

- Node.js >= 20
- React Native development environment set up
- iOS: Xcode and CocoaPods
- Android: Android Studio and Android SDK

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. iOS Setup

Navigate to the iOS directory and install CocoaPods:

```bash
cd ios
pod install
cd ..
```

### 3. Android Setup

The Android project is already configured. Make sure you have:
- Android SDK installed
- Android emulator or physical device connected

## Running the App

### Start Metro Bundler

```bash
npm start
```

### Run on iOS

```bash
npm run ios
```

### Run on Android

```bash
npm run android
```

## Project Structure

```
OfflineNotesApp/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx          # User login screen
│   │   ├── SignUpScreen.tsx         # User registration screen
│   │   ├── NotesListScreen.tsx      # Main notes list with search/sort
│   │   └── CreateEditNoteScreen.tsx # Create/edit note screen
│   ├── components/
│   │   ├── NoteItem.tsx             # Individual note card component
│   │   ├── SearchBar.tsx            # Search input component
│   │   └── SortPicker.tsx           # Sort options picker
│   ├── utils/
│   │   ├── storage.ts               # AsyncStorage helpers
│   │   ├── auth.ts                  # Authentication utilities
│   │   └── imageHandler.ts          # Image picker and storage
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Navigation configuration
│   └── types/
│       └── index.ts                 # TypeScript type definitions
├── App.tsx                          # Main app component
└── package.json
```

## Usage

### Creating an Account

1. Launch the app
2. Tap "Sign Up"
3. Enter a unique username (minimum 3 characters)
4. Enter a password (minimum 4 characters)
5. Confirm your password
6. Tap "Create Account"

### Logging In

1. Enter your username and password
2. Tap "Sign In"
3. You'll be taken to your notes list

### Creating a Note

1. Tap the "+" button (FAB) in the bottom right
2. Enter a title (optional)
3. Enter note content
4. Optionally add an image:
   - Tap "Choose from Gallery" to select an existing image
   - Tap "Take Photo" to capture a new photo
5. Tap "Save" to save the note

### Editing a Note

1. Tap on any note in the list
2. Make your changes
3. Tap "Save" to update

### Deleting a Note

1. Long press on a note (or use swipe gesture if implemented)
2. Confirm deletion in the dialog

### Searching Notes

1. Use the search bar at the top of the notes list
2. Type to filter notes by title or content
3. Tap the "✕" to clear the search

### Sorting Notes

1. Tap on the sort picker below the search bar
2. Select your preferred sort option:
   - Last Updated (Newest First)
   - Last Updated (Oldest First)
   - Title (A to Z)
   - Title (Z to A)

### Logging Out

1. Tap "Logout" in the top right corner
2. Confirm logout
3. You'll be returned to the login screen

## Data Storage

All data is stored locally using AsyncStorage:

- **Users**: Stored in `users` key
- **Current Session**: Stored in `current_user` key
- **User Notes**: Stored in `user_<username>_notes` key
- **User Preferences**: Stored in `user_preferences_<username>` key
- **Images**: Stored in app's document directory at `notes_images/`

## Permissions

### iOS
- Camera: Required for taking photos
- Photo Library: Required for selecting images

### Android
- Camera: Required for taking photos
- Read/Write External Storage: Required for image access

## Technologies Used

- **React Native**: Mobile app framework
- **TypeScript**: Type-safe JavaScript
- **@react-navigation/native**: Navigation library
- **@react-native-async-storage/async-storage**: Local data persistence
- **react-native-image-picker**: Image selection and camera
- **react-native-fs**: File system operations

## Security Notes

- Passwords are hashed before storage (simple hash implementation)
- For production use, consider implementing bcrypt or similar
- Each user's data is isolated by username prefix
- No network calls are made - completely offline

## Troubleshooting

### Images not showing
- Check that camera/photo library permissions are granted
- Verify images are being saved to the correct directory
- Check file paths are correct for your platform

### Notes not persisting
- Verify AsyncStorage is working correctly
- Check that user is logged in
- Ensure proper error handling in storage operations

### Navigation issues
- Clear app data and restart
- Verify navigation dependencies are installed
- Check that all screens are properly registered

## Future Enhancements

- [ ] Rich text editing
- [ ] Note categories/tags
- [ ] Note sharing between users
- [ ] Cloud backup option
- [ ] Dark mode support
- [ ] Biometric authentication
- [ ] Note templates
- [ ] Export notes as PDF

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check the code comments or create an issue in the repository.
