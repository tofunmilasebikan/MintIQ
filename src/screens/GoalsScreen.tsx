import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addMonths } from 'date-fns';
import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { GoalCard } from '../components/GoalCard';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { CategoryPicker } from '../components/CategoryPicker';
import { EmptyState } from '../components/EmptyState';
import { Card } from '../components/Card';
import { Category, Goal, GoalType, GoalRecurrence } from '../types';
import { getMonthKey } from '../utils/format';
import { getDefaultCategoryForGoalType, isGoalCompleted, computeGoalProgress } from '../utils/goalProgress';
import { confirmAction, showAlert } from '../utils/confirm';
import { colors, fonts, spacing, typography, radius } from '../constants/theme';

export function GoalsScreen() {
  const { goals, expenses, addGoal, editGoal, removeGoal, removeGoals } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('savings');
  const [category, setCategory] = useState<Category>('Savings');
  const [recurrence, setRecurrence] = useState<GoalRecurrence>('monthly');
  const [linkSavings, setLinkSavings] = useState(false);

  const currentMonth = getMonthKey();
  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === 'active' && g.month === currentMonth),
    [goals, currentMonth]
  );
  const carriedGoals = useMemo(
    () => goals.filter((g) => g.status === 'carried_over'),
    [goals]
  );
  const editableGoals = useMemo(
    () => [...activeGoals, ...carriedGoals],
    [activeGoals, carriedGoals]
  );

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setGoalType('savings');
    setCategory('Savings');
    setRecurrence('monthly');
    setLinkSavings(false);
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedIds(new Set());
  };

  const toggleEditMode = () => {
    if (isEditMode) exitEditMode();
    else setIsEditMode(true);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    if (isEditMode) exitEditMode();
    resetForm();
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleSave = async () => {
    const target = parseFloat(targetAmount);
    if (!name.trim() || isNaN(target) || target <= 0) {
      showAlert('Invalid Goal', 'Please enter a name and valid target amount.');
      return;
    }
    await addGoal({
      name: name.trim(),
      targetAmount: target,
      currentAmount: parseFloat(currentAmount) || 0,
      goalType,
      category: goalType === 'reduce_spending' ? category : getDefaultCategoryForGoalType(goalType),
      month: currentMonth,
      status: 'active',
      recurrence,
      linkSavingsTransactions: goalType === 'savings' && linkSavings,
    });
    closeModal();
  };

  const handleDeleteSelected = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const label = ids.length === 1 ? 'this goal' : `${ids.length} goals`;
    confirmAction('Delete Goals', `Remove ${label}?`, async () => {
      await removeGoals(ids);
      exitEditMode();
    });
  };

  const handleCarryOver = async (goalId: number, action: 'continue' | 'modify' | 'replace') => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const nextMonth = format(addMonths(new Date(goal.month + '-01'), 1), 'yyyy-MM');

    if (action === 'continue') {
      await editGoal(goalId, { status: 'carried_over' });
      const progress = computeGoalProgress(goal, expenses);
      await addGoal({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount:
          goal.goalType === 'savings' || goal.goalType === 'debt' ? progress : 0,
        goalType: goal.goalType,
        category: goal.category,
        month: nextMonth,
        status: 'active',
        recurrence: goal.recurrence,
        linkSavingsTransactions: goal.linkSavingsTransactions,
      });
    } else if (action === 'replace') {
      await editGoal(goalId, { status: 'completed' });
      openCreate();
    }
  };

  const showCarryOverPrompt = (goal: Goal) => {
    Alert.alert(
      'Goal Not Completed',
      `"${goal.name}" wasn't completed for ${goal.month}. What would you like to do?`,
      [
        { text: 'Continue Next Month', onPress: () => handleCarryOver(goal.id, 'continue') },
        { text: 'Replace with New', onPress: () => handleCarryOver(goal.id, 'replace') },
        {
          text: 'Delete Goal',
          style: 'destructive',
          onPress: () =>
            confirmAction('Delete Goal', `Remove "${goal.name}"?`, () => removeGoal(goal.id)),
        },
        { text: 'Dismiss', style: 'cancel' },
      ]
    );
  };

  const renderGoal = (g: Goal, showCarryLink?: boolean) => (
    <View key={g.id}>
      <GoalCard
        goal={g}
        expenses={expenses}
        selectionMode={isEditMode}
        selected={selectedIds.has(g.id)}
        onToggleSelect={() => toggleSelect(g.id)}
      />
      {!isEditMode && showCarryLink && g.recurrence === 'monthly' && !isGoalCompleted(g, expenses) ? (
        <TouchableOpacity onPress={() => showCarryOverPrompt(g)}>
          <Text style={styles.carryLink}>Manage at month end →</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Goals"
        subtitle={isEditMode ? 'Select goals to delete' : 'Track savings & spending targets'}
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerBtn, isEditMode && styles.headerBtnActive]}
              onPress={toggleEditMode}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isEditMode ? 'close' : 'create-outline'}
                size={18}
                color={isEditMode ? colors.ink : colors.signal}
              />
              {!isEditMode ? <Text style={styles.headerBtnLabel}>Edit</Text> : null}
            </TouchableOpacity>
            {!isEditMode ? (
              <TouchableOpacity style={styles.addBtn} onPress={openCreate} activeOpacity={0.85}>
                <Ionicons name="add" size={22} color={colors.ink} />
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isEditMode && editableGoals.length === 0 ? (
          <EmptyState
            icon="flag-outline"
            title="No goals to delete"
            message="Add a goal first, or tap the close icon to exit edit mode."
          />
        ) : null}

        {!isEditMode && carriedGoals.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Needs Attention</Text>
            {carriedGoals.map((g) => (
              <Card key={g.id} variant="ghost" style={styles.carryCard}>
                <Text style={styles.carryText}>{g.name} was carried over from {g.month}</Text>
                <Button title="Review Options" variant="secondary" onPress={() => showCarryOverPrompt(g)} />
              </Card>
            ))}
          </View>
        ) : null}

        {isEditMode ? (
          <>
            {carriedGoals.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Carried Over</Text>
                {carriedGoals.map((g) => renderGoal(g))}
              </View>
            ) : null}
            {activeGoals.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Goals</Text>
                {activeGoals.map((g) => renderGoal(g))}
              </View>
            ) : null}
          </>
        ) : activeGoals.length === 0 ? (
          <EmptyState
            icon="flag-outline"
            title="No active goals"
            message="Set a savings target or spending limit to track your progress."
          />
        ) : (
          activeGoals.map((g) => renderGoal(g, true))
        )}

        <View style={{ height: isEditMode ? 120 : 100 }} />
      </ScrollView>

      {isEditMode ? (
        <View style={styles.editBar}>
          <Text style={styles.selectedCount}>
            {selectedIds.size} selected
          </Text>
          <Button
            title="Delete"
            variant="danger"
            onPress={handleDeleteSelected}
            disabled={selectedIds.size === 0}
            style={styles.deleteBtn}
          />
        </View>
      ) : null}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalKicker}>Create</Text>
              <Text style={styles.modalTitle}>New Goal</Text>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.modalClose}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <InputField label="Goal Name" value={name} onChangeText={setName} placeholder="Trip fund" />
            <InputField
              label="Target Amount"
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="500"
              keyboardType="decimal-pad"
            />
            {(goalType === 'savings' || goalType === 'debt') ? (
              <InputField
                label="Current Progress"
                value={currentAmount}
                onChangeText={setCurrentAmount}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            ) : null}

            <Text style={styles.fieldLabel}>Goal Type</Text>
            <View style={styles.typeRow}>
              {(['savings', 'reduce_spending', 'debt'] as GoalType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, goalType === t && styles.typeChipActive]}
                  onPress={() => {
                    setGoalType(t);
                    setCategory(getDefaultCategoryForGoalType(t) ?? 'Other');
                  }}
                >
                  <Text style={[styles.typeText, goalType === t && styles.typeTextActive]}>
                    {t === 'savings' ? 'Save' : t === 'reduce_spending' ? 'Reduce' : 'Debt'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {goalType === 'reduce_spending' ? (
              <>
                <Text style={styles.fieldLabel}>Category to Limit</Text>
                <CategoryPicker selected={category} onSelect={setCategory} />
              </>
            ) : null}

            {goalType === 'savings' ? (
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Link Savings transactions</Text>
                <Switch
                  value={linkSavings}
                  onValueChange={setLinkSavings}
                  trackColor={{ true: colors.signal, false: colors.border }}
                  thumbColor={colors.bone}
                />
              </View>
            ) : null}

            <Text style={styles.fieldLabel}>Recurrence</Text>
            <View style={styles.typeRow}>
              {(['fixed', 'monthly'] as GoalRecurrence[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.typeChip, recurrence === r && styles.typeChipActive]}
                  onPress={() => setRecurrence(r)}
                >
                  <Text style={[styles.typeText, recurrence === r && styles.typeTextActive]}>
                    {r === 'fixed' ? 'Fixed' : 'Monthly'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button title="Save Goal" onPress={handleSave} style={{ marginTop: spacing.lg }} />
            <View style={{ height: spacing.xxl }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceInk },
  scroll: { paddingHorizontal: spacing.md },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.signalSoft,
    borderWidth: 1,
    borderColor: 'rgba(46, 230, 166, 0.28)',
  },
  headerBtnActive: {
    backgroundColor: colors.signal,
    borderColor: colors.signal,
  },
  headerBtnLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.signal,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.signal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginBottom: spacing.md },
  sectionTitle: { ...typography.subheading, marginBottom: spacing.sm },
  carryCard: { marginBottom: spacing.sm },
  carryText: { ...typography.body, marginBottom: spacing.sm, color: colors.textSecondary },
  carryLink: {
    ...typography.caption,
    color: colors.signal,
    marginBottom: spacing.md,
    marginTop: -8,
  },
  editBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceMist,
  },
  selectedCount: { ...typography.body, color: colors.textSecondary },
  deleteBtn: { minWidth: 120 },
  modal: { flex: 1, backgroundColor: colors.surfaceInk },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalKicker: {
    ...typography.label,
    color: colors.signal,
    marginBottom: 2,
  },
  modalTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: { padding: spacing.md },
  fieldLabel: { ...typography.label, marginBottom: spacing.sm },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMist,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.signalSoft,
    borderColor: colors.signal,
  },
  typeText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  typeTextActive: { color: colors.signal },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  switchLabel: { ...typography.body },
});