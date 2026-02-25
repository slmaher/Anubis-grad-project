import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

export default function Scan() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);

  useEffect(() => {
    // Request camera permission when component mounts
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleScan = async () => {
    if (!cameraRef.current) return;
    
    setIsScanning(true);
    
    try {
      // Take a picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      
      // Simulate processing for 2 seconds then navigate to result with photo
      setTimeout(() => {
        setIsScanning(false);
        // Pass the photo URI to scan-result screen
        router.push({
          pathname: "/(tabs)/scan-result",
          params: { photoUri: photo.uri }
        });
      }, 2000);
    } catch (error) {
      console.error('Error taking picture:', error);
      setIsScanning(false);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleBack = () => {
    router.push("/(tabs)/home");
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleGallery = async () => {
    try {
      // Request media library permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      // Check if user didn't cancel
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Navigate to scan-result with selected image
        router.push({
          pathname: "/(tabs)/scan-result",
          params: { photoUri: selectedImage.uri }
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  // Show loading or permission request screen
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera access is required to scan artifacts</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Artifact</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Camera View */}
      <View style={styles.cameraView}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          {/* Scanning Frame Overlay */}
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {isScanning && (
                <View style={styles.scanningLine} />
              )}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                {isScanning ? "Scanning..." : "Point camera at artifact"}
              </Text>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Bottom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleGallery}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.controlIcon}>🖼️</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.scanButton}
          onPress={handleScan}
          disabled={isScanning}
        >
          <View style={[styles.scanButtonInner, isScanning && styles.scanningActive]}>
            {isScanning ? (
              <Text style={styles.scanningText}>⌛</Text>
            ) : (
              <View style={styles.scanButtonDot} />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={toggleCameraFacing}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.controlIcon}>🔄</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  permissionText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  cameraView: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.9,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#fff",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanningLine: {
    width: "100%",
    height: 3,
    backgroundColor: "#D4AF37",
    position: "absolute",
    top: "50%",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  instructionsContainer: {
    position: "absolute",
    bottom: -80,
  },
  instructionsText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    paddingBottom: 50,
  },
  controlButton: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlIcon: {
    fontSize: 24,
  },
  scanButton: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  scanButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  scanningActive: {
    backgroundColor: "#D4AF37",
  },
  scanButtonDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#D4AF37",
  },
  scanningText: {
    fontSize: 32,
  },
});

