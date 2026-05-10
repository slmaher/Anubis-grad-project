import React, { Suspense, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import { Canvas, useFrame, useThree } from "@react-three/fiber/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Asset } from "expo-asset";
import * as THREE from "three";

const anubisModel = require("../../assets/models/anubis.glb");

function Model({ rotationY, modelUrl }) {
  const groupRef = useRef();
  const [model, setModel] = useState(null);
  const { scene } = useThree();

  useEffect(() => {
    if (!modelUrl) return;

    const loader = new THREE.GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const loadedScene = gltf.scene;
        // Auto-center and scale
        const box = new THREE.Box3().setFromObject(loadedScene);
        const center = box.getCenter(new THREE.Vector3());
        loadedScene.position.sub(center);

        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4 / maxDim;
        loadedScene.scale.multiplyScalar(scale);

        loadedScene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        setModel(loadedScene);
      },
      undefined,
      (error) => console.error("Model loading error:", error),
    );
  }, [modelUrl]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotationY;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {model && <primitive object={model} />}
    </group>
  );
}

export default function Artifact3DViewer() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [modelUrl, setModelUrl] = useState("");

  const title = params.title || "Anubis statue";
  const [rotationY, setRotationY] = useState(0);

  useEffect(() => {
    try {
      const modelAsset = Asset.fromModule(anubisModel);
      setModelUrl(modelAsset.localUri || modelAsset.uri);
    } catch (error) {
      console.error("Failed to resolve model asset:", error);
    }
  }, []);

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
    }),
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
            <Model rotationY={rotationY} modelUrl={modelUrl} />
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
