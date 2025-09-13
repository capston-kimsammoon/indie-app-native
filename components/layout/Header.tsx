import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Theme from '@/constants/Theme';

// 아이콘
import IcHeaderLogo from '@/assets/icons/ic-header-logo.svg';
import IcHeaderSearch from '@/assets/icons/ic-header-search.svg';
import IcHeaderAlarm from '@/assets/icons/ic-header-alarm.svg';
import IcArrowLeft from '@/assets/icons/ic-arrow-left.svg';

type Props = { pathname: string };

export default function Header({ pathname }: Props) {
  const headerIconSize = Theme.iconSizes.sm;

  // 페이지별 조건부 UI
  if (pathname === '/' || pathname === '/index') {
    // 홈
    return (
      <View style={styles.header}>
        <View style={styles.left}>
          <IcHeaderLogo height={headerIconSize} />
        </View>
        <View style={styles.right}>
          <Pressable style={styles.icon}>
            <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
          </Pressable>
          <Pressable>
            <IcHeaderAlarm width={headerIconSize} height={headerIconSize} />
          </Pressable>
        </View>
      </View>
    );
  }

  if (pathname.startsWith('/performance')) {
    // 공연 리스트 / 공연 상세
    return (
      <View style={styles.header}>
        <Pressable style={styles.left}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>공연</Text>
        <Pressable style={styles.right}>
          <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
        </Pressable>
      </View>
    );
  }

  if (pathname.startsWith('/calendar')) {
    return (
      <View style={styles.header}>
        <Text style={styles.title}>캘린더</Text>
      </View>
    );
  }

  if (pathname.startsWith('/mypage')) {
    return (
      <View style={styles.header}>
        <Text style={styles.title}>마이페이지</Text>
      </View>
    );
  }

  // 기본 헤더
  return (
    <View style={styles.header}>
      <Text style={styles.title}>기본</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.lightGray,
    backgroundColor: Theme.colors.white,
    marginTop: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xs,
  },
  left: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md },
  right: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md },
  icon: { marginRight: Theme.spacing.sm },
  title: { fontSize: Theme.fontSizes.lg, fontWeight: Theme.fontWeights.bold, padding: Theme.spacing.lg },
});
