import React, { Suspense, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from "react-native";
import { Canvas, useFrame, useLoader } from "@react-three/fiber/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Asset } from "expo-asset";

const anubisModel = require("../../assets/models/anubis.glb");

function Model({ rotationY }) {
  const groupRef = useRef();
  const modelAsset = Asset.fromModule(anubisModel);
  const gltf = useLoader(GLTFLoader, modelAsset.uri);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotationY;
    }
  });

  return (
    <group ref={groupRef} position={[0, 1, 0]} scale={1}>
      <primitive object={gltf.scene} />
    </group>
  );
}

export default function Artifact3DViewer() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const title = params.title || "Anubis statue";
  const [rotationY, setRotationY] = useState(0);

const lastX = useRef(0);
const velocity = useRef(0);
const animationRef = useRef(null);

const stopInertia = () => {
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  }
};

const startInertia = () => {
  stopInertia();

  const animate = () => {
    velocity.current *= 0.94; // lower = stops faster

    setRotationY((prev) => prev + velocity.current);

    if (Math.abs(velocity.current) > 0.0015) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  animationRef.current = requestAnimationFrame(animate);
};

const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (event) => {
      stopInertia();
      lastX.current = event.nativeEvent.pageX;
      velocity.current = 0;
    },

    onPanResponderMove: (event) => {
      const currentX = event.nativeEvent.pageX;
      const deltaX = currentX - lastX.current;

      const sensitivity = 0.008; // lower = slower drag
      const rotationAmount = deltaX * sensitivity;

      setRotationY((prev) => prev + rotationAmount);

      velocity.current = rotationAmount;
      lastX.current = currentX;
    },

    onPanResponderRelease: () => {
      startInertia();
    },
  })
).current;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← {title}</Text>
      </TouchableOpacity>

      <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
        <Canvas camera={{ position: [0, 0.6, 6], fov: 45 }}>
          <ambientLight intensity={1.8} />
          <directionalLight position={[3, 5, 5]} intensity={2.2} />
          <directionalLight position={[-3, 2, 4]} intensity={1.2} />

          <Suspense fallback={null}>
            <Model rotationY={rotationY} />
          </Suspense>
        </Canvas>
      </View>

      <Text style={styles.hint}>Drag left or right to rotate</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1108",
  },
  canvasWrapper: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  hint: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "700",
  },
});