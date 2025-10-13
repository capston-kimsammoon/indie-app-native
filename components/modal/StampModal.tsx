// components/modal/StampModal.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import Theme from "@/constants/Theme";

interface StampModalProps {
  visible: boolean;
  onClose: () => void;
  stamp: {
    id: number;
    image: string;
    date: string;
    title?: string;
    venueName?: string;
    performanceId?: string;
  } | null;
}

export default function StampModal({ visible, onClose, stamp }: StampModalProps) {
  const router = useRouter();

  if (!stamp) return null;

  const handlePosterPress = () => {
    if (stamp.performanceId) {
      onClose();
      router.push(`/performance/${stamp.performanceId}`);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          {/* 공연 포스터 */}
          <TouchableOpacity 
            onPress={handlePosterPress}
            activeOpacity={stamp.performanceId ? 0.7 : 1}
            disabled={!stamp.performanceId}
          >
            <Image
              source={stamp.image ? { uri: stamp.image } : require('@/assets/images/modie-sample.png')}
              style={styles.posterImage}
            />
          </TouchableOpacity>

          {/* 공연 정보 */}
          <View style={styles.infoContainer}>
            {/* 공연 날짜 */}
            <Text style={styles.dateText}>{stamp.date}</Text>

            {/* 공연 제목 */}
            {stamp.title && (
              <Text style={styles.titleText}>{stamp.title}</Text>
            )}

            {/* 공연장 이름 */}
            {stamp.venueName && (
              <Text style={styles.venueText}>{stamp.venueName}</Text>
            )}
          </View>

          {/* 확인 버튼 */}
          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              pressed && { opacity: 0.8 }
            ]}
            onPress={onClose}
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Theme.colors.shadow,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "60%",
    maxWidth: 320,
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    padding: Theme.spacing.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  posterImage: {
    width: "100%",
    aspectRatio: 3/4,
    borderRadius: 12,
    marginBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.lightGray,
  },
  infoContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  dateText: {
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.darkGray,
  },
  titleText: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
    textAlign: "center",
  },
  venueText: {
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.themeOrange,
    textAlign: "center",
  },
  confirmButton: {
    width: "100%",
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.themeOrange,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold,
  },
});