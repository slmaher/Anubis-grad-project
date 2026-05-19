import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { getAuthToken } from '../api/authStorage';

const getInitial = (name) => {
  if (!name || typeof name !== 'string') return 'G';
  return name.trim().charAt(0).toUpperCase() || 'G';
};

export default function GroupsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState(new Set());

  const fetchGroups = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await api.getGroups(token);
      if (res?.success) setGroups(res.data || []);
    } catch (err) {
      console.error('Failed to fetch groups', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const openCreate = async () => {
    setShowCreate(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await api.getFriends(token);
      if (res?.success) setFriends(res.data || []);
    } catch (err) {
      console.error('Failed to fetch friends', err);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const body = { name: name.trim(), participants: Array.from(selected) };
      const res = await api.createGroup(body, token);
      if (res?.success) {
        setShowCreate(false);
        setName('');
        setSelected(new Set());
        // navigate to group chat
        router.push({ pathname: '/messagesList/chatScreen', params: { contactId: res.data._id, contactName: res.data.name, isGroup: 'true' } });
      }
    } catch (err) {
      console.error('Create group failed', err);
    } finally {
      setCreating(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity key={item._id} style={styles.item} onPress={() => router.push({ pathname: '/messagesList/chatScreen', params: { contactId: item._id, contactName: item.name, isGroup: 'true' } })}>
      {item.owner?.avatar ? (
        <Image source={{ uri: item.owner.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}><Text style={styles.avatarFallbackText}>{getInitial(item.name)}</Text></View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.participants?.length || 0} members</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('chat_pages.groups_title') || 'Groups'}</Text>
        <TouchableOpacity onPress={openCreate} style={styles.createButton}><Text style={styles.createText}>+ New</Text></TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <FlatList data={groups} keyExtractor={(g) => g._id} renderItem={renderItem} contentContainerStyle={{ padding: 12 }} />
      )}

      {showCreate && (
        <View style={styles.createModal}>
          <Text style={styles.modalTitle}>Create Group</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Group name" style={styles.input} />
          <Text style={styles.sectionTitle}>Add members</Text>
          <FlatList data={friends} keyExtractor={(f) => f._id} renderItem={({ item }) => (
            <TouchableOpacity key={item._id} style={styles.friendItem} onPress={() => toggleSelect(item._id)}>
              <Text style={styles.friendName}>{item.name}</Text>
              <Text>{selected.has(item._id) ? '✓' : ''}</Text>
            </TouchableOpacity>
          )} style={{ maxHeight: 220 }} />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => setShowCreate(false)} style={styles.cancelBtn}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={create} style={styles.saveBtn} disabled={creating}><Text style={{ color: '#fff' }}>{creating ? 'Creating...' : 'Create'}</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDE6DF' },
  header: { height: 100, paddingTop: 50, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#6B5B4F' },
  backButton: { position: 'absolute', left: 12, top: 52 },
  backIcon: { color: '#fff', fontSize: 22 },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: '700' },
  createButton: { position: 'absolute', right: 14, top: 52 },
  createText: { color: '#fff', fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E5DED5' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarFallback: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#C4B5A0', alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { color: '#fff', fontWeight: '700' },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, color: '#9A8C7A' },
  createModal: { position: 'absolute', left: 12, right: 12, top: 120, backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5DED5' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 8, marginBottom: 8 },
  sectionTitle: { fontWeight: '700', marginBottom: 6 },
  friendItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  friendName: { fontSize: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
  cancelBtn: { padding: 8 },
  saveBtn: { padding: 8, backgroundColor: '#6B5B4F', borderRadius: 6 },
});
