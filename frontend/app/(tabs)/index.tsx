import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconPlus,
  IconMicrophone,
  IconRefresh,
  IconWifiOff,
  IconCheck,
  IconAlertTriangle,
  IconPackage,
} from '@tabler/icons-react';
import type { RootState, AppDispatch } from '../../src/redux/store';
import { loadInventory, addItem, removeItem, syncItems, setOnline } from '../../src/redux/slices/inventory';
import { useThemeColors } from '../../src/theme/colors';
import type { InventoryItem } from '../../src/database/sqlite';

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, pendingSync, isOnline, loading } = useSelector((state: RootState) => state.inventory);
  const colors = useThemeColors();
  const isDark = useColorScheme() === 'dark';

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', sku: '', quantity: '', unit: 'kg', price: '', reorderLevel: '' });

  useEffect(() => {
    dispatch(loadInventory());
  }, [dispatch]);

  const handleAdd = useCallback(() => {
    if (!newItem.name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }

    dispatch(addItem({
      name: newItem.name.trim(),
      sku: newItem.sku.trim() || `SKU-${Date.now()}`,
      quantity: parseFloat(newItem.quantity) || 0,
      unit: newItem.unit,
      price: parseFloat(newItem.price) || 0,
      reorderLevel: parseFloat(newItem.reorderLevel) || 0,
    }));

    setNewItem({ name: '', sku: '', quantity: '', unit: 'kg', price: '', reorderLevel: '' });
    setShowAddModal(false);
  }, [newItem, dispatch]);

  const handleDelete = useCallback((item: InventoryItem) => {
    Alert.alert(
      'Delete Item',
      `Remove "${item.name}" from inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => dispatch(removeItem(item.id)) },
      ]
    );
  }, [dispatch]);

  const handleSync = useCallback(() => {
    dispatch(syncItems());
  }, [dispatch]);

  const getSyncIcon = (status: string) => {
    switch (status) {
      case 'synced': return <IconCheck size={14} color={colors.success} />;
      case 'conflict': return <IconAlertTriangle size={14} color={colors.error} />;
      default: return <View style={[styles.pendingDot, { backgroundColor: colors.warning }]} />;
    }
  };

  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const lowStockCount = items.filter(i => i.quantity <= i.reorder_level && i.reorder_level > 0).length;

  const renderItem = useCallback(({ item }: { item: InventoryItem }) => {
    const isLow = item.reorder_level > 0 && item.quantity <= item.reorder_level;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
        onLongPress={() => handleDelete(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.statusBar, { backgroundColor: isLow ? colors.error : colors.success }]} />
            <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          {getSyncIcon(item.sync_status)}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardStat}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Qty</Text>
            <Text style={[styles.statValue, { color: isLow ? colors.error : colors.text }]}>
              {item.quantity} {item.unit}
            </Text>
          </View>
          <View style={styles.cardStat}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Price</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>₹{item.price}</Text>
          </View>
          <View style={styles.cardStat}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Reorder</Text>
            <Text style={[styles.statValue, { color: colors.textSecondary }]}>{item.reorder_level}</Text>
          </View>
        </View>

        <Text style={[styles.sku, { color: colors.textMuted }]}>{item.sku}</Text>
      </TouchableOpacity>
    );
  }, [colors, handleDelete]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>My Inventory</Text>
          <TouchableOpacity
            style={[
              styles.syncBtn,
              { backgroundColor: !isOnline ? colors.warning + '20' : pendingSync > 0 ? colors.accent + '20' : colors.success + '20' },
            ]}
            onPress={handleSync}
            disabled={!isOnline || pendingSync === 0}
          >
            {!isOnline ? (
              <IconWifiOff size={16} color={colors.warning} />
            ) : (
              <IconRefresh size={16} color={pendingSync > 0 ? colors.accent : colors.success} />
            )}
            <Text
              style={[
                styles.syncBtnText,
                { color: !isOnline ? colors.warning : pendingSync > 0 ? colors.accent : colors.success },
              ]}
            >
              {!isOnline ? 'Offline' : pendingSync > 0 ? `${pendingSync} pending` : 'Synced'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Total Value</Text>
            <Text style={[styles.statCardValue, { color: colors.primary }]}>₹{totalValue.toLocaleString()}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Low Stock</Text>
            <Text style={[styles.statCardValue, { color: lowStockCount > 0 ? colors.error : colors.success }]}>
              {lowStockCount}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Items</Text>
            <Text style={[styles.statCardValue, { color: colors.text }]}>{items.length}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading inventory...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '15' }]}>
            <IconPackage size={48} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No inventory yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Tap the + button to add your first item
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <IconPlus size={28} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Inventory Item</Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Item name (e.g., Clay - Red)"
              placeholderTextColor={colors.textMuted}
              value={newItem.name}
              onChangeText={(t) => setNewItem({ ...newItem, name: t })}
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="SKU (optional)"
              placeholderTextColor={colors.textMuted}
              value={newItem.sku}
              onChangeText={(t) => setNewItem({ ...newItem, sku: t })}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Quantity"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={newItem.quantity}
                onChangeText={(t) => setNewItem({ ...newItem, quantity: t })}
              />
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Price (₹)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={newItem.price}
                onChangeText={(t) => setNewItem({ ...newItem, price: t })}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Reorder level"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={newItem.reorderLevel}
                onChangeText={(t) => setNewItem({ ...newItem, reorderLevel: t })}
              />
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Unit (kg)"
                placeholderTextColor={colors.textMuted}
                value={newItem.unit}
                onChangeText={(t) => setNewItem({ ...newItem, unit: t })}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.background }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleAdd}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  syncBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  syncBtnText: { fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, padding: 12, borderRadius: 12 },
  statCardLabel: { fontSize: 11, marginBottom: 4 },
  statCardValue: { fontSize: 18, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 100 },
  card: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  statusBar: { width: 4, height: 24, borderRadius: 2 },
  cardName: { fontSize: 16, fontWeight: '600', flex: 1 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardStat: { alignItems: 'center' },
  statLabel: { fontSize: 11, marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '600' },
  sku: { fontSize: 11, marginTop: 4 },
  pendingDot: { width: 8, height: 8, borderRadius: 4 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 100, alignSelf: 'center', width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { fontSize: 16, fontWeight: '600' },
});
