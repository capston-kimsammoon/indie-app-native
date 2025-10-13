// app/(tabs)/mypage.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  Switch,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import Theme from "@/constants/Theme";

import {
  fetchUserInfo,
  updateNickname,
  updateUserSettings,
  updateProfileImage,
  removeProfileImage,
  withdrawAccount
} from "@/api/UserApi";
import { useAuthStore } from "@/src/state/authStore";

import IcHeartOutline from "@/assets/icons/ic-heart-outline.svg";
import IcEdit from "@/assets/icons/ic-edit.svg";
import IcStampOutline from "@/assets/icons/ic-stamp-outline.svg";
import IcSetting from "@/assets/icons/ic-setting.svg";
import IcChevronRight from "@/assets/icons/ic-chevron-right.svg";

const AVATAR = 72;

export default function TabMyPageScreen() {
  const router = useRouter();
  const { user, setUser, hydrated, setHydrated } = useAuthStore();
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [alarmOn, setAlarmOn] = useState(true);
  const [locationOn, setLocationOn] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const me = await fetchUserInfo().catch(() => null);
        if (cancelled) return;
        if (!me) {
          setUser(null);
          router.replace("/login");
          return;
        }
        setUser(me);
        setHydrated(true);
      })();
      return () => {
        cancelled = true;
      };
    }, [router, setUser, setHydrated])
  );

  useEffect(() => {
    if (!user) return;
    setNickname(user.nickname || "");
    setProfileUri(user.profile_url ?? null);
    setAlarmOn(!!user.alarm_enabled);
    setLocationOn(!!user.location_enabled);
  }, [user]);

  const showProfileOptions = () => {
    Alert.alert("프로필 사진", "사진을 변경하시겠습니까?", [
      {
        text: "기본 이미지로",
        onPress: async () => {
          try {
            await removeProfileImage();
            setProfileUri(null);
          } catch {
            Alert.alert("오류", "이미지 초기화에 실패했습니다.");
          }
        },
      },
      { text: "사진 선택", onPress: pickImage },
      { text: "취소", style: "cancel" },
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 보관함 접근 권한이 필요해요.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled) {
      setProfileUri(res.assets[0].uri || null);
      try {
        await updateProfileImage(res.assets[0] as any);
        const me = await fetchUserInfo().catch(() => null);
        if (me) setUser(me);
      } catch {
        Alert.alert("업로드 실패", "이미지 업로드에 실패했어요.");
      }
    }
  };

  const saveNickname = async () => {
    try {
      await updateNickname(nickname!.trim());
      const me = await fetchUserInfo().catch(() => null);
      if (me) setUser(me);
      setEditing(false);
    } catch {
      Alert.alert("이미 있는 닉네임입니다");
    }
  };

  const toggleAlarm = async (v: boolean) => {
    setAlarmOn(v);
    try {
      await updateUserSettings(v, locationOn);
    } catch {}
  };
  const toggleLocation = async (v: boolean) => {
    setLocationOn(v);
    try {
      await updateUserSettings(alarmOn, v);
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await useAuthStore.getState().logout();
      Alert.alert("로그아웃", "로그아웃 되었습니다.");
      router.replace("/login");
    } catch {
      Alert.alert("로그아웃 오류", "로그아웃 처리 중 문제가 발생했습니다.");
    }
  };

  const handleWithdraw = () => {
    if (withdrawing) return;
    Alert.alert(
      "회원 탈퇴",
      "정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: async () => {
            if (withdrawing) return;
            setWithdrawing(true);
            try {
              await withdrawAccount();
              await useAuthStore.getState().logout();
              router.replace("/login");
            } catch (e: any) {
              Alert.alert(
                "오류",
                e?.response?.data?.detail ??
                  e?.message ??
                  "탈퇴 처리 중 문제가 발생했습니다."
              );
            } finally {
              setWithdrawing(false);
            }
          },
        },
      ]
    );
  };

  if (!hydrated && !user)
    return <View style={{ flex: 1, backgroundColor: Theme.colors.white }} />;

  return (
    <View style={styles.screen}>
      {/* 상단 콘텐츠 */}
      <View style={{ flex: 1 }}>
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Pressable onPress={showProfileOptions} style={styles.avatarWrap}>
  {profileUri ? (
    <Image source={{ uri: profileUri }} style={styles.avatar} />
  ) : (
    // ✅ 로컬 기본 이미지로 대체
    <Image
      source={require("@/assets/images/profile.png")}
      style={[styles.avatar, styles.avatarPlaceholder]}
      resizeMode="cover"
    />
  )}

  <Pressable onPress={showProfileOptions} style={styles.avatarFab}>
    <IcSetting
      width={Theme.iconSizes.sm}
      height={Theme.iconSizes.sm}
      fill={Theme.colors.darkGray}
    />
  </Pressable>
</Pressable>

            <View style={styles.nameWrap}>
              {editing ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.nickInput}
                    value={nickname ?? ""}
                    onChangeText={setNickname}
                    placeholder="닉네임"
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={saveNickname}
                  />
                  <Pressable style={styles.saveBtn} onPress={saveNickname}>
                    <Text style={styles.saveBtnText}>저장</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.nickRow}>
                  <Text style={styles.nickname}>{nickname}</Text>
                  <Pressable hitSlop={8} onPress={() => setEditing(true)}>
                    <IcEdit
                      width={Theme.iconSizes.sm}
                      height={Theme.iconSizes.sm}
                      fill={Theme.colors.darkGray}
                    />
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* 찜 / 리뷰 / 스탬프 */}
          <View style={styles.tripletRow}>
            <View style={styles.tripletCol}>
              <Pressable
                style={styles.tripletBtn}
                onPress={() => router.push("/favorite")}
              >
                <IcHeartOutline
                  width={28}
                  height={28}
                  stroke={Theme.colors.darkGray}
                />
                <Text style={styles.tripletText}>찜</Text>
              </Pressable>
            </View>
            <View style={styles.tripletCol}>
              <Pressable
                style={styles.tripletBtn}
                onPress={() => router.push("/myreview")}
              >
                <IcEdit width={28} height={28} fill={Theme.colors.darkGray} />
                <Text style={styles.tripletText}>내가 쓴 리뷰</Text>
              </Pressable>
            </View>
            <View style={styles.tripletCol}>
              <Pressable
                style={styles.tripletBtn}
                onPress={() => router.push("/mystamp")}
              >
                <IcStampOutline
                  width={28}
                  height={28}
                  stroke={Theme.colors.darkGray}
                  fill={Theme.colors.darkGray}
                />
                <Text style={styles.tripletText}>스탬프 리스트</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        {/* 설정 토글 */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>알림 설정</Text>
            <View style={styles.switchWrap}>
              <Switch
                value={alarmOn}
                onValueChange={toggleAlarm}
                trackColor={{
                  false: Theme.colors.lightGray as any,
                  true: Theme.colors.themeOrange as any,
                }}
                thumbColor={"#FFFFFF"}
              />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowTitle}>위치정보 사용</Text>
            <View style={styles.switchWrap}>
              <Switch
                value={locationOn}
                onValueChange={toggleLocation}
                trackColor={{
                  false: Theme.colors.lightGray as any,
                  true: Theme.colors.themeOrange as any,
                }}
                thumbColor={"#FFFFFF"}
              />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowTitle}>공지사항</Text>
            <Pressable
              style={styles.navRow}
              onPress={() => router.push("/notice")}
            >
              <IcChevronRight
                width={Theme.iconSizes.sm}
                height={Theme.iconSizes.sm}
                fill={Theme.colors.darkGray}
              />
            </Pressable>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>고객센터</Text>
            <Pressable
              style={styles.navRow}
              onPress={() => router.push("/support")}
            >
              <IcChevronRight
                width={Theme.iconSizes.sm}
                height={Theme.iconSizes.sm}
                fill={Theme.colors.darkGray}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.logoutWrap}>
          <Pressable onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.withdrawWrap}>
        <Pressable onPress={handleWithdraw} disabled={withdrawing}>
          <Text style={styles.withdrawText}>
            {withdrawing ? "탈퇴 처리 중..." : "탈퇴하기"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Theme.colors.white },

  profileCard: { padding: Theme.spacing.md },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  avatarWrap: { position: "relative", marginRight: Theme.spacing.md },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
  },
  avatarPlaceholder: { justifyContent: "center", alignItems: "center" },
  avatarFab: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: Theme.iconSizes.md,
    height: Theme.iconSizes.md,
    borderRadius: 14,
    backgroundColor: Theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
  },
  nameWrap: { flex: 1, justifyContent: "center" },
  nickRow: { flexDirection: "row", alignItems: "center" },
  nickname: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold as any,
    marginRight: Theme.spacing.sm,
  },
  editRow: { flexDirection: "row", alignItems: "center" },
  nickInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    borderRadius: 10,
    fontSize: Theme.fontSizes.base,
    backgroundColor: "#ffffff",
  },
  saveBtn: {
    height: 40,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Theme.spacing.sm,
  },
  saveBtnText: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
  },
  tripletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: Theme.spacing.md,
  },
  tripletCol: { width: "30%", alignItems: "center" },
  tripletBtn: { alignItems: "center", justifyContent: "center" },
  tripletText: {
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.darkGray,
    marginTop: Theme.spacing.sm,
  },
  separator: { borderBottomWidth: 1, borderBottomColor: Theme.colors.lightGray },
  section: { padding: Theme.spacing.md },
  row: {
    marginVertical: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowTitle: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
    color: Theme.colors.black,
  },
  navRow: { marginLeft: "auto" },
  switchWrap: {
    transform: [
      { scaleX: Platform.OS === "ios" ? 0.7 : 0.88 },
      { scaleY: Platform.OS === "ios" ? 0.7 : 0.88 },
    ],
    marginLeft: "auto",
  },
  logoutWrap: { alignItems: "center" },
  logoutText: { color: Theme.colors.gray, fontSize: Theme.fontSizes.sm },
  withdrawWrap: { alignItems: "center", paddingVertical: Theme.spacing.lg },
  withdrawText: {
    color: Theme.colors.red,
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.medium,
  },
});
