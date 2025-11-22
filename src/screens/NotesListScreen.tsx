import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Note, SortOption } from '../types';
import { getNotes, deleteNote, getUserPreferences, saveUserPreferences } from '../utils/storage';
import { getLoggedInUser, logout } from '../utils/auth';
import NoteItem from '../components/NoteItem';
import SearchBar from '../components/SearchBar';
import SortPicker from '../components/SortPicker';
import { colors, spacing, typography, shadows } from '../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface NotesListScreenProps {
  navigation: any;
}

const NotesListScreen: React.FC<NotesListScreenProps> = ({ navigation }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [username, setUsername] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fabScale = useSharedValue(1);
  const fabRotation = useSharedValue(0);

  const loadNotes = useCallback(async (user: string | null) => {
    if (!user) return;
    const userNotes = await getNotes(user);
    setNotes(userNotes);
  }, []);

  const loadPreferences = useCallback(async (user: string) => {
    const prefs = await getUserPreferences(user);
    setSortOption(prefs.sortOption);
  }, []);

  const loadUserAndNotes = useCallback(async () => {
    const currentUser = await getLoggedInUser();
    if (!currentUser) {
      navigation.replace('Login');
      return;
    }
    setUsername(currentUser);
    await loadPreferences(currentUser);
    await loadNotes(currentUser);
  }, [navigation, loadNotes, loadPreferences]);

  useEffect(() => {
    loadUserAndNotes();
    const unsubscribe = navigation.addListener('focus', () => {
      if (username) {
        loadNotes(username);
      }
    });
    return unsubscribe;
  }, [navigation, loadUserAndNotes, username, loadNotes]);

  useEffect(() => {
    filterAndSortNotes();
  }, [notes, searchQuery, sortOption]);

  const filterAndSortNotes = () => {
    let filtered = [...notes];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(query) ||
          note.body.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return b.updatedAt - a.updatedAt;
        case 'oldest':
          return a.updatedAt - b.updatedAt;
        case 'titleAsc':
          return (a.title || '').localeCompare(b.title || '');
        case 'titleDesc':
          return (b.title || '').localeCompare(a.title || '');
        default:
          return 0;
      }
    });

    setFilteredNotes(filtered);
  };

  const handleDeleteNote = (noteId: string, noteTitle: string) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${noteTitle || 'this note'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (username) {
              await deleteNote(username, noteId);
              await loadNotes(username);
            }
          },
        },
      ]
    );
  };

  const handleSortChange = async (option: SortOption) => {
    setSortOption(option);
    if (username) {
      await saveUserPreferences(username, { sortOption: option });
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (username) {
      await loadNotes(username);
    }
    setRefreshing(false);
  }, [username, loadNotes]);

  const handleFabPress = () => {
    fabScale.value = withSpring(0.9, {}, () => {
      fabScale.value = withSpring(1);
    });
    fabRotation.value = withSpring(fabRotation.value + 135);
    navigation.navigate('CreateEditNote', { noteId: null });
  };

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fabScale.value },
      { rotate: `${fabRotation.value}deg` },
    ],
  }));

  const renderNoteItem = ({ item }: { item: Note }) => (
    <NoteItem
      note={item}
      onPress={() => navigation.navigate('CreateEditNote', { noteId: item.id })}
      onDelete={() => handleDeleteNote(item.id, item.title)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="notebook-outline" size={80} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No notes yet</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'No notes match your search'
          : 'Tap the + button to create your first note'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Notes</Text>
            {notes.length > 0 && (
              <View style={styles.noteCountBadge}>
                <Icon name="note-text" size={14} color={colors.primary} />
                <Text style={styles.noteCountText}>{notes.length}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.7}>
            <Icon name="logout" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        {searchQuery.length > 0 && (
          <View style={styles.searchIndicator}>
            <Icon name="filter" size={16} color={colors.white} />
            <Text style={styles.searchIndicatorText}>
              {filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </LinearGradient>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <SortPicker selectedOption={sortOption} onSelect={handleSortChange} />

      <FlatList
        data={filteredNotes}
        renderItem={renderNoteItem}
        keyExtractor={item => item.id}
        contentContainerStyle={
          filteredNotes.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <AnimatedTouchable
        style={[styles.fab, fabAnimatedStyle]}
        onPress={handleFabPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Icon name="plus" size={32} color={colors.white} />
        </LinearGradient>
      </AnimatedTouchable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAccent,
  },
  header: {
    paddingTop: spacing.l,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.m,
    ...shadows.medium,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.white,
  },
  noteCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    ...shadows.small,
  },
  noteCountText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  searchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.m,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  searchIndicatorText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  logoutButton: {
    padding: spacing.s,
  },
  list: {
    paddingVertical: spacing.s,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.l,
    bottom: spacing.l,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    ...shadows.large,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotesListScreen;
