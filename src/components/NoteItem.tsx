import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Note } from '../types';
import { colors, spacing, typography, shadows } from '../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface NoteItemProps {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onPress, onDelete }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const formatDate = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const getPreview = (body: string): string => {
    const lines = body.split('\n').filter(line => line.trim());
    if (lines.length === 0) return 'No content';
    return lines.slice(0, 2).join(' ').substring(0, 100) + (body.length > 100 ? '...' : '');
  };

  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        {note.imageUri && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: Platform.OS === 'ios' ? note.imageUri : `file://${note.imageUri}` }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>
        )}
        <View style={[styles.textContainer, !note.imageUri && styles.textContainerFull]}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title || 'Untitled Note'}
          </Text>
          <Text style={styles.preview} numberOfLines={2}>
            {getPreview(note.body)}
          </Text>
          <Text style={styles.date}>{formatDate(note.updatedAt)}</Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: spacing.m,
    marginVertical: spacing.s,
    padding: spacing.m,
    ...shadows.small,
  },
  content: {
    flexDirection: 'row',
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.m,
  },
  textContainerFull: {
    marginLeft: 0,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.s,
  },
  preview: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.s,
    lineHeight: 20,
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
});

export default NoteItem;
