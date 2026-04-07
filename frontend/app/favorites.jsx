import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Favorites() {
  const router = useRouter();
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const existingFavorites = await AsyncStorage.getItem('favorites');
      if (existingFavorites) {
        setFavorites(JSON.parse(existingFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (id) => {
    try {
      const updatedFavorites = favorites.filter(fav => fav.id !== id);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleMuseumPress = (museum) => {
    router.push({
      pathname: "/museum-profile",
      params: { 
        id: museum.id,
        name: museum.name,
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>{t("common.back_arrow")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("favorites.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("common.loading")}</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={styles.emptyTitle}>{t("favorites.empty_title")}</Text>
            <Text style={styles.emptyText}>
              {t("favorites.empty_text")}
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push("/(tabs)/explore")}
            >
              <Text style={styles.exploreButtonText}>{t("favorites.explore_button")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.count}>{favorites.length} {favorites.length === 1 ? t("favorites.museum_single") : t("favorites.museum_plural")}</Text>
            
            {favorites.map((museum) => (
              <View key={museum.id} style={styles.favoriteCard}>
                <TouchableOpacity 
                  style={styles.cardContent}
                  onPress={() => handleMuseumPress(museum)}
                >
                  <View style={styles.museumImageContainer}>
                    <Image
                      source={require("../assets/images/grand-museum.png")}
                      style={styles.museumImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.museumInfo}>
                    <Text style={styles.museumName}>{museum.name}</Text>
                    <Text style={styles.museumType}>{museum.type}</Text>
                    <View style={styles.priceRatingRow}>
                      <Text style={styles.price}>{museum.price}</Text>
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>⭐ {museum.rating}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                
                {/* Remove Button */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFavorite(museum.id)}
                >
                  <Text style={styles.removeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={{ height: 30 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8DDD0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#E8DDD0",
    borderBottomWidth: 1,
    borderBottomColor: "#E8DDD0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: "#000",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  count: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  favoriteCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  museumImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E0E0E0",
  },
  museumImage: {
    width: "100%",
    height: "100%",
  },
  museumInfo: {
    flex: 1,
    justifyContent: "center",
  },
  museumName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  museumType: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  priceRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  ratingBadge: {
    backgroundColor: "#E8DDD0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeIcon: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
});
