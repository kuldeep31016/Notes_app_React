import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Note } from '../types';
import { getNotes, saveNote } from '../utils/storage';
import { getLoggedInUser } from '../utils/auth';
import { pickImageFromGallery, takePhoto, deleteImageFromStorage } from '../utils/imageHandler';
import { colors, spacing, typography, shadows } from '../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CreateEditNoteScreenProps {
  navigation: any;
  route: any;
}

const CreateEditNoteScreen: React.FC<CreateEditNoteScreenProps> = ({ navigation, route }) => {
  const { noteId } = route.params || {};
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [originalImageUri, setOriginalImageUri] = useState<string | null>(null);
  const [titleFocused, setTitleFocused] = useState(false);
  const [bodyFocused, setBodyFocused] = useState(false);

  const saveButtonScale = useSharedValue(1);
  const cancelButtonScale = useSharedValue(1);

  const loadUser = async () => {
    const user = await getLoggedInUser();
    if (!user) {
      navigation.replace('Login');
      return;
    }
    setUsername(user);
  };

  const loadNote = useCallback(async () => {
    if (!username || !noteId) return;
    const notes = await getNotes(username);
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setTitle(note.title);
      setBody(note.body);
      setImageUri(note.imageUri);
      setOriginalImageUri(note.imageUri);
    }
  }, [username, noteId]);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (noteId && username) {
      loadNote();
    }
  }, [noteId, username, loadNote]);

  const handlePickImage = async () => {
    try {
      const uri = await pickImageFromGallery();
      if (uri) {
        if (originalImageUri && originalImageUri !== uri) {
          await deleteImageFromStorage(originalImageUri);
        }
        setImageUri(uri);
        setOriginalImageUri(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please check permissions.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const uri = await takePhoto();
      if (uri) {
        if (originalImageUri && originalImageUri !== uri) {
          await deleteImageFromStorage(originalImageUri);
        }
        setImageUri(uri);
        setOriginalImageUri(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please check camera permissions.');
    }
  };

  const handleRemoveImage = async () => {
    if (imageUri) {
      await deleteImageFromStorage(imageUri);
    }
    setImageUri(null);
    setOriginalImageUri(null);
  };

  const handleSave = async () => {
    if (!username) return;

    if (!title.trim() && !body.trim()) {
      Alert.alert('Error', 'Note cannot be empty');
      return;
    }

    setLoading(true);
    saveButtonScale.value = withSpring(0.96, {}, () => {
      saveButtonScale.value = withSpring(1);
    });

    try {
      const note: Note = {
        id: noteId || `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        body: body.trim(),
        imageUri: imageUri,
        createdAt: noteId ? (await getNotes(username)).find(n => n.id === noteId)?.createdAt || Date.now() : Date.now(),
        updatedAt: Date.now(),
      };

      const success = await saveNote(username, note);
      if (success) {
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to save note');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || body.trim() || imageUri) {
      Alert.alert('Discard Changes?', 'You have unsaved changes. Are you sure you want to go back?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            if (!noteId && imageUri) {
              deleteImageFromStorage(imageUri);
            }
            navigation.goBack();
          },
        },
      ]);
    } else {
      navigation.goBack();
    }
  };

  const saveButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  const cancelButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cancelButtonScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} disabled={loading} activeOpacity={0.7}>
            <Icon name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {noteId ? 'Edit Note' : 'New Note'}
          </Text>
          <AnimatedTouchable
            onPress={handleSave}
            disabled={loading}
            style={[styles.saveButton, saveButtonStyle]}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon name="check" size={24} color={colors.primary} />
            )}
          </AnimatedTouchable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <TextInput
            style={[
              styles.titleInput,
              titleFocused && styles.titleInputFocused,
            ]}
            placeholder="Note title"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            editable={!loading}
          />

          {/* Body Input */}
          <TextInput
            style={[
              styles.bodyInput,
              bodyFocused && styles.bodyInputFocused,
            ]}
            placeholder="Start writing..."
            placeholderTextColor={colors.textTertiary}
            value={body}
            onChangeText={setBody}
            onFocus={() => setBodyFocused(true)}
            onBlur={() => setBodyFocused(false)}
            multiline
            textAlignVertical="top"
            editable={!loading}
          />

          {/* Character and Word Count */}
          {(title.trim() || body.trim()) && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="text" size={16} color={colors.textTertiary} />
                <Text style={styles.statText}>
                  {body.split(/\s+/).filter(word => word.length > 0).length} words
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="counter" size={16} color={colors.textTertiary} />
                <Text style={styles.statText}>
                  {body.length} characters
                </Text>
              </View>
            </View>
          )}

          {/* Image Section */}
          <View style={styles.imageSection}>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: Platform.OS === 'ios' ? imageUri : `file://${imageUri}` }}
                  style={styles.image}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon name="close-circle" size={32} color={colors.error} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={handlePickImage}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon name="image-edit" size={20} color={colors.white} />
                  <Text style={styles.changeImageText}>Change Image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="image-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.imagePlaceholderText}>Add Image</Text>
                <View style={styles.imageButtonsContainer}>
                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={handlePickImage}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Icon name="image-multiple" size={24} color={colors.primary} />
                    <Text style={styles.imageButtonText}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={handleTakePhoto}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Icon name="camera" size={24} color={colors.primary} />
                    <Text style={styles.imageButtonText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <AnimatedTouchable
            style={[styles.actionButton, styles.cancelButton, cancelButtonStyle]}
            onPress={handleCancel}
            disabled={loading}
            activeOpacity={0.7}
            onPressIn={() => {
              cancelButtonScale.value = withSpring(0.96);
            }}
            onPressOut={() => {
              cancelButtonScale.value = withSpring(1);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </AnimatedTouchable>
          <AnimatedTouchable
            style={[styles.actionButton, styles.saveButtonBottom, saveButtonStyle]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.7}
            onPressIn={() => {
              saveButtonScale.value = withSpring(0.96);
            }}
            onPressOut={() => {
              saveButtonScale.value = withSpring(1);
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </LinearGradient>
          </AnimatedTouchable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  saveButton: {
    padding: spacing.s,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.l,
    paddingBottom: 100,
  },
  titleInput: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.l,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleInputFocused: {
    borderBottomColor: colors.primary,
  },
  bodyInput: {
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 200,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  bodyInputFocused: {
    // Add focus styling if needed
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    backgroundColor: colors.backgroundAccent,
    borderRadius: 12,
    marginTop: spacing.l,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
    marginHorizontal: spacing.m,
  },
  statText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  imageSection: {
    marginTop: spacing.m,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.m,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xs,
    ...shadows.small,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: spacing.m,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    ...shadows.medium,
  },
  changeImageText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  imagePlaceholder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  imagePlaceholderText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.m,
    width: '100%',
  },
  imageButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.m,
    alignItems: 'center',
    gap: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  imageButtonText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.m,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  saveButtonBottom: {
    overflow: 'hidden',
    ...shadows.medium,
  },
  saveButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default CreateEditNoteScreen;
