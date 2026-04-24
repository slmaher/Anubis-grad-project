import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuthToken } from '../api/authStorage';
import { API_URL } from '../api/baseUrl';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/reviews/admin/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await response.json();
      if (res.success) {
        setReviews(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getAuthToken();
            const response = await fetch(`${API_URL}/reviews/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
              setReviews(reviews.filter(r => r._id !== id));
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    ]);
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(s => (
          <MaterialCommunityIcons
            key={s}
            name={s <= rating ? "star" : "star-outline"}
            size={16}
            color="#D9A441"
          />
        ))}
      </View>
    );
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.userName}>{item.user?.name || 'Anonymous'}</Text>
          <Text style={styles.museumName}>on {item.museum?.name || 'Unknown'}</Text>
        </View>
        <TouchableOpacity onPress={() => deleteReview(item._id)}>
          <MaterialCommunityIcons name="delete-sweep-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
      {renderStars(item.rating)}
      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#D9A441" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Management</Text>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#2C2010', marginBottom: 24 },
  list: { gap: 16 },
  reviewCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  userName: { fontSize: 16, fontWeight: '600', color: '#2C2010' },
  museumName: { fontSize: 13, color: '#8B7B6C' },
  stars: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  comment: { fontSize: 14, color: '#2C2010', lineHeight: 20, marginBottom: 8 },
  date: { fontSize: 12, color: '#8B7B6C', textAlign: 'right' },
});
