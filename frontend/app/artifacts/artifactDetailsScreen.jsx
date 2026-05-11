import { Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const TABS = ['Facts'];

const imageMap = {
  anubis: require("../../assets/images/Anubis-Statue.png"),
  tutankhamun: require("../../assets/images/tutankhamun.jpg"),
};

export default function ArtifactDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('Facts');

  const imageKey = params.imageKey;
  const artifactImage = imageMap[imageKey] || imageMap["anubis"];

  // Get artifact data from params
  const artifactTitle = params.title || "Anubis";
  const artifactDescription =
    params.description ||
    "Exquisite handcrafted replicas of ancient Egyptian artifacts, meticulously made in Egypt by master artisans.";

  return (
    <View style={styles.root}>
      {/* Full-width hero image */}
      <View style={styles.hero}>
        <Image
        source={artifactImage}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
        />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>{artifactTitle}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <View style={styles.tabItem}>
  <Text style={[styles.tabLabel, styles.tabLabelActive]}>
    Facts
  </Text>
  <View style={styles.tabUnderline} />
</View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.contentTitle}>
              Discover {artifactTitle}
            </Text>

            <Text style={styles.contentBody}>
              {artifactDescription}
              {"\n\n"}
              This piece is a museum-quality treasure that brings the mystique
              of ancient Egypt into your home or collection. Each artifact is
              carefully crafted with attention to historical detail and
              authentic materials.
            </Text>
          </View>

          

          <View style={{ height: 40 }} />
        </ScrollView>
        {/* CTA Button */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.ctaBtn}
              activeOpacity={0.85}
              onPress={() => {
                router.push("/artifacts/ArtifactsScreen");
              }}
            >
              <Text style={styles.ctaTxt}>
                Take a virtual tour
              </Text>
            </TouchableOpacity>
          </View>
      </View>
    </View>
  );
}

/* ======================= STYLES (React Native CSS) ======================= */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a1108',
  },

  hero: {
    width: '100%',
    height: height * 0.58,
    backgroundColor: '#2a1e0e',
    position: 'relative',
  },

  heroImgPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(80,55,25,0.8)',
  },

  heroEmoji: {
    fontSize: 120,
  },

  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  backArrow: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
  },

  backLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },

  sheet: {
    flex: 1,
    backgroundColor: '#362411',
  },

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },

  tabLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },

  tabLabelActive: {
    color: '#fff',
  },

  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '0%',
    right: '0%',
    height: 2,
    backgroundColor: '#969696',
    borderRadius: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },

  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgb(255, 248, 230)',
    marginBottom: 12,
  },

  contentBody: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },

  ctaContainer: {
    paddingHorizontal: 30,
    bottom: 50,
    alignItems: 'center',
  },

  ctaBtn: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  ctaTxt: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
});