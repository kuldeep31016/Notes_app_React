import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SortOption } from '../types';
import { colors, spacing, typography, shadows } from '../theme';

interface SortPickerProps {
  selectedOption: SortOption;
  onSelect: (option: SortOption) => void;
}

const sortOptions: { label: string; value: SortOption; icon: string }[] = [
  { label: 'Last Updated (Newest First)', value: 'newest', icon: 'sort-clock-descending' },
  { label: 'Last Updated (Oldest First)', value: 'oldest', icon: 'sort-clock-ascending' },
  { label: 'Title (A to Z)', value: 'titleAsc', icon: 'sort-alphabetical-ascending' },
  { label: 'Title (Z to A)', value: 'titleDesc', icon: 'sort-alphabetical-descending' },
];

const SortPicker: React.FC<SortPickerProps> = ({ selectedOption, onSelect }) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const selectedLabel = sortOptions.find(opt => opt.value === selectedOption)?.label || '';

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Icon name="sort" size={20} color={colors.primary} style={styles.icon} />
        <Text style={styles.label}>Sort: </Text>
        <Text style={styles.value} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <Icon name="chevron-down" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Notes</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={sortOptions}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedOption === item.value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={item.icon}
                    size={24}
                    color={selectedOption === item.value ? colors.primary : colors.textSecondary}
                    style={styles.optionIcon}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === item.value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedOption === item.value && (
                    <Icon name="check-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.white,
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    borderRadius: 16,
    ...shadows.small,
  },
  icon: {
    marginRight: spacing.s,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  value: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.l,
    paddingBottom: spacing.xl,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    marginHorizontal: spacing.m,
    marginVertical: spacing.xs,
  },
  optionSelected: {
    backgroundColor: colors.backgroundAccent,
  },
  optionIcon: {
    marginRight: spacing.m,
  },
  optionText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default SortPicker;
