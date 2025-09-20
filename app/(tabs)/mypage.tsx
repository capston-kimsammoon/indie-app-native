import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  Switch,
  Alert,
  ScrollView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Settings,
  User,
  Pencil,
  Heart,
  Stamp,
  ChevronRight,
} from 'lucide-react-native';
import { Link } from 'expo-router';
import Theme from '@/constants/Theme';

import IcEdit from '@/assets/icons/ic-edit.svg';
import IcStamper from '@/assets/icons/ic-stamper.svg';

const AVATAR = 72;

export default function TabMyPageScreen() {
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [nickname, setNickname] = useState('예빈스클럽');
  const [editing, setEditing] = useState(false);
  const [alarmOn, setAlarmOn] = useState(true);
  const [locationOn, setLocationOn] = useState(true);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 보관함 접근 권한이 필요해요.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled) {
      setProfileUri(res.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Pressable onPress={pickImage} style={styles.avatarWrap}>
            {profileUri ? (
              <Image source={{ uri: profileUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <User size={40} />
              </View>
            )}
            <Pressable onPress={pickImage} style={styles.avatarFab}>
              <Settings size={16} />
            </Pressable>
          </Pressable>

          <View style={styles.nameWrap}>
            {editing ? (
              <View style={styles.editRow}>
                <TextInput
                  style={styles.nickInput}
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="닉네임"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => setEditing(false)}
                />
                <Pressable style={styles.saveBtn} onPress={() => setEditing(false)}>
                  <Text style={styles.saveBtnText}>저장</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.nickRow}>
                <Text style={styles.nickname}>{nickname}</Text>
                <Pressable hitSlop={8} onPress={() => setEditing(true)}>
                  <Pencil size={18} />
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* 찜 / 내가 쓴 리뷰 / 스탬프 */}
        <View style={styles.tripletRow}>
          <View style={styles.tripletCol}>
            <Link href="/favorite" asChild>
              <Pressable style={styles.tripletBtn} accessibilityRole="button">
                <Heart size={Theme.iconSizes.lg} />
                <Text style={styles.tripletText}>찜</Text>
              </Pressable>
            </Link>
          </View>

          <View style={styles.tripletCol}>
            <Link href="/myreview" asChild>
              <Pressable style={styles.tripletBtn} accessibilityRole="button">
                <Pencil size={Theme.iconSizes.lg} />
                <Text style={styles.tripletText}>내가 쓴 리뷰</Text>
              </Pressable>
            </Link>
          </View>

          <View style={styles.tripletCol}>
            <Link href="/mystamp" asChild>
            <Pressable style={styles.tripletBtn} accessibilityRole="button">
              <Stamp size={Theme.iconSizes.lg} />
              <Text style={styles.tripletText}>스탬프 리스트</Text>
            </Pressable>
            </Link>
          </View>
        </View>
      </View>
      <View style={styles.separator} />

      {/* 토글 섹션 */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>알림 설정</Text>
            <View style={styles.switchWrap}>
              <Switch value={alarmOn} onValueChange={setAlarmOn} trackColor={{ false: Theme.colors.lightGray, true: Theme.colors.themeOrange }}
            thumbColor={alarmOn ? '#FFFFFF' : '#FFFFFF'} />
            </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>위치정보 사용</Text>
            <View style={styles.switchWrap}>
              <Switch value={locationOn} onValueChange={setLocationOn} trackColor={{ false: Theme.colors.lightGray, true: Theme.colors.themeOrange }}
            thumbColor={alarmOn ? '#FFFFFF' : '#FFFFFF'}/>
            </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>공지사항</Text>
          <Pressable style={styles.navRow}>
            <ChevronRight size={18} />
          </Pressable>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>고객센터</Text>
          <Pressable style={styles.navRow}>
            <ChevronRight size={18} />
          </Pressable>
        </View>
      </View>

      <View style={styles.logoutWrap}>
        <Pressable onPress={() => Alert.alert('로그아웃', '아직 개발중~')}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: Theme.colors.white,
  },

  profileCard: { 
    padding: Theme.spacing.md,
  },
  profileRow: { 
    flexDirection: 'row',
     alignItems: 'center', 
     gap: 16 
  },
  avatarWrap: { 
    position: 'relative' 
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
  },
  avatarPlaceholder: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarFab: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: Theme.iconSizes.md,
    height: Theme.iconSizes.md,
    borderRadius: 14,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
  },
  nameWrap: { 
    flex: 1, 
    justifyContent: 'center',
  },
  nickRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  nickname: { 
    fontSize: Theme.fontSizes.lg, 
    fontWeight: Theme.fontWeights.semibold,
  },
  editRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { 
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold,
  },

  tripletRow: {
    marginVertical: Theme.spacing.md,
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'stretch',
  },
  tripletCol: {
    flex: 1,     
    alignItems: 'center', 
    justifyContent: 'center',
  },
  tripletBtn: {
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  tripletText: { 
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.darkGray,
    fontWeight: Theme.fontWeights.medium,
    marginTop: Theme.spacing.sm,
  },
  separator: {
      borderBottomWidth: 1,
      borderBottomColor: Theme.colors.lightGray,
  },
  section: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
  },
  row: {
    marginVertical: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTitle: { 
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.black, 
  },

  navRow: {
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
 switchWrap: {
   transform: [{ scaleX: Platform.OS === 'ios' ? 0.7 : 0.88 },
               { scaleY: Platform.OS === 'ios' ? 0.7 : 0.88 }],
   marginRight: Platform.OS === 'ios' ? 0 : -4,
 },
  logoutWrap: { 
    alignItems: 'center' 
  },
  logoutText: { 
    color: Theme.colors.gray,
    fontSize: Theme.fontSizes.sm, 
  },
});
