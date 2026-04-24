import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuthToken } from '../api/authStorage';
import { api } from '../api/client';
import { API_URL } from '../api/baseUrl';

export default function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts`);
      const res = await response.json();
      if (res.success) {
        setPosts(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    if (!id) {
      Alert.alert('Delete failed', 'This post has an invalid id.');
      return;
    }
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Please login again and try deleting this post.');
        return;
      }

      setDeletingPostId(id);
      setPosts((currentPosts) => currentPosts.filter((p) => (p._id || p.id) !== id));

      const res = await api.admin.deletePost(id, token);
      if (!res?.success) {
        throw new Error(res?.message || 'Could not delete this post.');
      }

      await fetchPosts();
    } catch (error) {
      console.error(error);
      Alert.alert('Delete failed', error?.message || 'Could not delete this post.');
      fetchPosts();
    } finally {
      setDeletingPostId(null);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userRow}>
           <View style={styles.avatarPlaceholder} />
           <View>
              <Text style={styles.userName}>{item.user?.name || 'Unknown User'}</Text>
              <Text style={styles.postDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
           </View>
        </View>
        <TouchableOpacity onPress={() => deletePost(item._id || item.id)}>
          {deletingPostId === (item._id || item.id) ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <MaterialCommunityIcons name="delete-outline" size={24} color="#FF6B6B" />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.content}>{item.content}</Text>
      {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
      <View style={styles.footer}>
         <Text style={styles.footerText}>{item.likes || 0} Likes</Text>
         <Text style={styles.footerText}>{item.comments?.length || 0} Comments</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#D9A441" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post Management</Text>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item._id || item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#2C2010', marginBottom: 24 },
  list: { gap: 16 },
  postCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECE5DE' },
  userName: { fontSize: 16, fontWeight: '600', color: '#2C2010' },
  postDate: { fontSize: 12, color: '#8B7B6C' },
  content: { fontSize: 14, color: '#2C2010', lineHeight: 20, marginBottom: 12 },
  postImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12 },
  footer: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#F9F7F4', paddingTop: 12 },
  footerText: { fontSize: 12, color: '#8B7B6C', fontWeight: '500' },
});
