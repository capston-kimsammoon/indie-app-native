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
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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
                  <Heart size={24} />
                  <Text style={styles.tripletText}>찜</Text>
                </Pressable>
              </Link>
            </View>

            <View style={styles.tripletCol}>
              <Link href="/myreview" asChild>
                <Pressable style={styles.tripletBtn} accessibilityRole="button">
                  <Pencil size={24} />
                  <Text style={styles.tripletText}>내가 쓴 리뷰</Text>
                </Pressable>
              </Link>
            </View>

            <View style={styles.tripletCol}>
              <Link href="/mystamp" asChild>
              <Pressable style={styles.tripletBtn} accessibilityRole="button">
                <Stamp size={24} />
                <Text style={styles.tripletText}>나의 스탬프</Text>
              </Pressable>
              </Link>
            </View>
          </View>
        </View>

        {/* 토글 섹션 */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>알림 설정</Text>
             <View style={styles.switchWrap}>
   <Switch value={alarmOn} onValueChange={setAlarmOn} trackColor={{ false: '#E5E7EB', true: '#FB923C' }}
  thumbColor={alarmOn ? '#FFFFFF' : '#FFFFFF'} />
 </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>위치정보 사용</Text>
 <View style={styles.switchWrap}>
   <Switch value={locationOn} onValueChange={setLocationOn} trackColor={{ false: '#E5E7EB', true: '#FB923C' }}
  thumbColor={alarmOn ? '#FFFFFF' : '#FFFFFF'}/>
 </View>
          </View>
        </View>

        {/* 리스트 섹션 */}
        <View style={styles.section}>
          <Pressable style={styles.navRow}>
            <Text style={styles.rowTitle}>공지사항</Text>
            <ChevronRight size={18} />
          </Pressable>
          <Pressable style={styles.navRow}>
            <Text style={styles.rowTitle}>고객센터</Text>
            <ChevronRight size={18} />
          </Pressable>
        </View>
        <View style={styles.logoutWrap}>
          <Pressable onPress={() => Alert.alert('로그아웃', '아직 개발중~')}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>© Kimthreemun Corp.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  header: {
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' },

  profileCard: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: '#f3f3f3',
  },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  avatarFab: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e1e1e1',
  },
  nameWrap: { flex: 1, justifyContent: 'center' },
  nickRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nickname: { fontSize: 18, fontWeight: '700' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nickInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  saveBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 14, fontWeight: '600' },

  tripletRow: {
    marginTop: 24,
    paddingHorizontal: 20,
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
    gap: 9,
  },
  tripletText: { fontSize: 12, color: '#111' },

  section: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  row: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTitle: { fontSize: 15 },

  navRow: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
 switchWrap: {
   transform: [{ scaleX: Platform.OS === 'ios' ? 0.7 : 0.88 },
               { scaleY: Platform.OS === 'ios' ? 0.7 : 0.88 }],
   marginRight: Platform.OS === 'ios' ? 0 : -4,
 },
  logoutWrap: { paddingTop: 24, alignItems: 'center' },
  logoutText: { color: '#8e8e93', fontSize: 14 },

  footer: { paddingTop: 24, alignItems: 'center' },
  footerText: { fontSize: 11, color: '#b1b1b3' },
});
