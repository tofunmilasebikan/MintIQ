import { Alert, Platform } from 'react-native';

/** Cross-platform alert (Alert.alert callbacks are unreliable on web). */
export function showAlert(
  title: string,
  message: string,
  onOk?: () => void
): void {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
    return;
  }

  Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
}

/** Cross-platform confirm dialog (Alert.alert is unreliable on web). */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>
): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      void Promise.resolve(onConfirm());
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => void Promise.resolve(onConfirm()) },
  ]);
}
