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
import { Category, GoalType, GoalRecurrence } from '../types';
import { getMonthKey } from '../utils/format';
import { getDefaultCategoryForGoalType, isGoalCompleted, computeGoalProgress } from '../utils/goalProgress';
import { colors, spacing, typography, radius } from '../constants/theme';

export function GoalsScreen() {
  const { goals, expenses, addGoal, editGoal, removeGoal } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [carryOverGoal, setCarryOverGoal] = useState<number | null>(null);

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

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setGoalType('savings');
    setCategory('Savings');
    setRecurrence('monthly');
    setLinkSavings(false);
  };

  const openCreate = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleSave = async () => {
    const target = parseFloat(targetAmount);
    if (!name.trim() || isNaN(target) || target <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a name and valid target amount.');
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
    setModalVisible(false);
    resetForm();
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
          goal.goalType === 'savings' || goal.goalType === 'debt'
            ? progress
            : 0,
        goalType: goal.goalType,
        category: goal.category,
        month: nextMonth,
        status: 'active',
        recurrence: goal.recurrence,
        linkSavingsTransactions: goal.linkSavingsTransactions,
      });
    } else if (action === 'modify') {
      setCarryOverGoal(goalId);
      setName(goal.name);
      setTargetAmount(String(goal.targetAmount));
      setCurrentAmount(String(goal.currentAmount));
      setGoalType(goal.goalType);
      setCategory(goal.category ?? 'Savings');
      setRecurrence(goal.recurrence);
      setLinkSavings(goal.linkSavingsTransactions);
      setModalVisible(true);
    } else {
      await editGoal(goalId, { status: 'completed' });
      openCreate();
    }
    setCarryOverGoal(null);
  };

  const showCarryOverPrompt = (goal: typeof goals[0]) => {
    Alert.alert(
      'Goal Not Completed',
      `"${goal.name}" wasn't completed for ${goal.month}. What would you like to do?`,
      [
        { text: 'Continue Next Month', onPress: () => handleCarryOver(goal.id, 'continue') },
        { text: 'Modify Goal', onPress: () => handleCarryOver(goal.id, 'modify') },
        { text: 'Replace with New', onPress: () => handleCarryOver(goal.id, 'replace') },
        { text: 'Dismiss', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Goals"
        subtitle="Track savings & spending targets"
        right={
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {carriedGoals.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Needs Attention</Text>
            {carriedGoals.map((g) => (
              <Card key={g.id} style={styles.carryCard}>
                <Text style={styles.carryText}>{g.name} was carried over from {g.month}</Text>
                <Button title="Review Options" variant="secondary" onPress={() => showCarryOverPrompt(g)} />
              </Card>
            ))}
          </View>
        ) : null}

        {activeGoals.length === 0 ? (
          <EmptyState
            icon="flag-outline"
            title="No active goals"
            message="Set a savings target or spending limit to track your progress."
          />
        ) : (
          activeGoals.map((g) => (
            <View key={g.id}>
              <GoalCard goal={g} expenses={expenses} />
              {g.recurrence === 'monthly' && !isGoalCompleted(g, expenses) ? (
                <TouchableOpacity onPress={() => showCarryOverPrompt(g)}>
                  <Text style={styles.carryLink}>Manage at month end →</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{carryOverGoal ? 'Modify Goal' : 'New Goal'}</Text>
            <TouchableOpacity onPress={() => { setModalVisible(false); setCarryOverGoal(null); }}>
              <Ionicons name="close" size={24} color={colors.charcoal} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
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
                  trackColor={{ true: colors.mint, false: colors.border }}
                  thumbColor={colors.white}
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
            {carryOverGoal ? (
              <Button
                title="Delete Goal"
                variant="danger"
                onPress={async () => {
                  await removeGoal(carryOverGoal);
                  setModalVisible(false);
                  setCarryOverGoal(null);
                }}
                style={{ marginTop: spacing.sm }}
              />
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingHorizontal: spacing.md },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.mintDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginBottom: spacing.md },
  sectionTitle: { ...typography.subheading, marginBottom: spacing.sm },
  carryCard: { marginBottom: spacing.sm },
  carryText: { ...typography.body, marginBottom: spacing.sm },
  carryLink: { ...typography.caption, color: colors.mintDark, marginBottom: spacing.md, marginTop: -8 },
  modal: { flex: 1, backgroundColor: colors.cream },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { ...typography.heading },
  modalBody: { padding: spacing.md },
  fieldLabel: { ...typography.label, marginBottom: spacing.sm, textTransform: 'uppercase' },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: { backgroundColor: colors.mintDark, borderColor: colors.mintDark },
  typeText: { ...typography.caption, fontWeight: '600' },
  typeTextActive: { color: colors.white },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  switchLabel: { ...typography.body },
});
