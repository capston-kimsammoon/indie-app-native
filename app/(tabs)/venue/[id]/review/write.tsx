// app/(tabs)/venue/[id]/review/write.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Image, Pressable, ScrollView, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Theme from "@/constants/Theme";
import { createVenueReview } from "@/api/ReviewApi";
import IcClose from "@/assets/icons/ic-close.svg";

export default function WriteReviewPage() {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as { id: string };

  const [content, setContent] = useState("");
  const [images, setImages] = useState<(string | { uri: string })[]>([]);
  const [loading, setLoading] = useState(false);

  const MAX_LENGTH = 300;

  const pickImages = async () => {
    try {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다.");
        return;
      }

      if (images.length >= 6) {
        Alert.alert("이미지는 최대 6장까지 업로드 가능합니다.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 6 - images.length,
      });

      if (!result.canceled) {
        const selected = result.assets.map((a) => ({ uri: a.uri }));
        setImages((prev) => [...prev, ...selected].slice(0, 6));
      }
    } catch (err) {
      console.error(err);
      Alert.alert("이미지 선택 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      Alert.alert("리뷰 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await createVenueReview(Number(id), trimmedContent, images);
      Alert.alert("리뷰가 등록되었습니다!");
      router.back(); // 뒤로 돌아가면서 리뷰 목록 갱신
    } catch (err: any) {
      console.error(err);
      Alert.alert("리뷰 등록 실패", err.message || "");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleContentChange = (text: string) => {
    const chars = Array.from(text);
    setContent(chars.slice(0, MAX_LENGTH).join(""));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>리뷰 작성</Text>
      <TextInput
        multiline
        style={styles.textInput}
        placeholder="리뷰 내용을 입력하세요"
        value={content}
        onChangeText={handleContentChange}
      />
      <Text style={styles.leftText}>{Array.from(content).length}/{MAX_LENGTH}</Text>

      <Text style={styles.subtitle}>사진 첨부 ({images.length}/6)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
        {images.map((img, idx) => (
          <View key={idx} style={styles.thumbContainer}>
            <Image source={{ uri: typeof img === "string" ? img : img.uri }} style={styles.thumb} />
            <Pressable style={styles.removeBtn} onPress={() => removeImage(idx)}>
              <IcClose width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} fill={Theme.colors.white} />
            </Pressable>
          </View>
        ))}
        {images.length < 6 && (
          <Pressable style={styles.addBtn} onPress={pickImages}>
            <Text style={styles.addText}>+</Text>
          </Pressable>
        )}
      </ScrollView>

      <Pressable
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>{loading ? "등록 중..." : "등록"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Theme.spacing.md, backgroundColor: Theme.colors.white },
  title: { fontSize: Theme.fontSizes.lg, fontWeight: Theme.fontWeights.bold, marginBottom: Theme.spacing.md },
  leftText: { alignSelf: "flex-end", color: Theme.colors.gray, fontSize: Theme.fontSizes.sm, fontWeight: Theme.fontWeights.regular, marginBottom: Theme.spacing.md, marginTop: Theme.spacing.sm },
  subtitle: { fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.semibold },
  textInput: { minHeight: 120, borderWidth: 1, borderColor: Theme.colors.lightGray, borderRadius: 10, padding: Theme.spacing.md, fontSize: Theme.fontSizes.base, textAlignVertical: "top" },
  imageRow: { flexDirection: "row", flexWrap: "wrap", paddingTop: Theme.spacing.md },
  thumbContainer: { position: "relative", marginRight: Theme.spacing.md },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  removeBtn: { position: "absolute", top: -6, right: -6, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center" },
  removeText: { color: Theme.colors.white, fontSize: Theme.fontSizes.base, fontWeight: Theme.fontWeights.semibold },
  addBtn: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: Theme.colors.lightGray, justifyContent: "center", alignItems: "center" },
  addText: { fontSize: 32, color: Theme.colors.gray },
  submitButton: { backgroundColor: Theme.colors.themeOrange, borderRadius: 10, paddingVertical: Theme.spacing.sm, alignItems: "center", marginTop: Theme.spacing.md },
  disabledButton: { opacity: 0.6 },
  submitText: { color: Theme.colors.white, fontWeight: Theme.fontWeights.bold, fontSize: Theme.fontSizes.base },
});
