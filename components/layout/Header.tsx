import React from 'react';
import { SafeAreaView, View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import Theme from '@/constants/Theme';
import { useRouter } from 'expo-router';

// 아이콘
import IcHeaderLogo from '@/assets/icons/ic-header-logo.svg';
import IcHeaderSearch from '@/assets/icons/ic-header-search.svg';
import IcHeaderAlarm from '@/assets/icons/ic-header-alarm.svg';
import IcArrowLeft from '@/assets/icons/ic-arrow-left.svg';

// 상태바 높이 계산 (iOS 노치 / Android 상태바 대응)
import { getStatusBarHeight } from 'react-native-status-bar-height';

type Props = { pathname: string; title?: string; venueName?: string; artistName?: string };

export default function Header({ pathname, title, venueName, artistName }: Props) {
  const headerIconSize = Theme.iconSizes.md;
  const router = useRouter();

  const handleNavigateToAlarm = () => router.push('/alarm');
  const handleNavigateToSearch = () => router.push('/search');
  const handleGoBack = () => router.back();

  // 공통 헤더 구조
  const renderHeaderContent = (leftNode: React.ReactNode, centerNode: React.ReactNode, rightNode: React.ReactNode) => (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {leftNode}
        {centerNode}
        {rightNode}
      </View>
    </SafeAreaView>
  );

  // 홈
  if (pathname === '/' || pathname === '/index') {
    return renderHeaderContent(
      <View style={styles.left}>
        <IcHeaderLogo height={headerIconSize} />
      </View>,
      <View />,
      <View style={styles.right}>
        <Pressable style={styles.icon} onPress={handleNavigateToSearch}>
          <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Pressable onPress={handleNavigateToAlarm}>
          <IcHeaderAlarm width={headerIconSize} height={headerIconSize} />
        </Pressable>
      </View>
    );
  }

  // 공통 뒤로가기 + 타이틀 + 검색 아이콘 구조
  const backTitleSearch = (headerTitle: string) =>
    renderHeaderContent(
      <Pressable style={styles.left} onPress={handleGoBack}>
        <IcArrowLeft width={headerIconSize} height={headerIconSize} />
      </Pressable>,
      <Text style={styles.title}>{headerTitle}</Text>,
      <Pressable style={styles.right} onPress={handleNavigateToSearch}>
        <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
      </Pressable>
    );

  // 매거진
  if (pathname.startsWith('/magazine')) return backTitleSearch('김삼문 pick!');
  // 공연장 리뷰
  if (pathname.startsWith('/review')) return backTitleSearch('공연장 리뷰');
  // 공연 상세
  if (pathname.startsWith('/performance/') && title) return backTitleSearch(title);
  // 공연 리스트
  if (pathname.startsWith('/performance')) return backTitleSearch('공연');
  // 공연장 상세
  if (pathname.startsWith('/venue/') && venueName) return backTitleSearch(venueName);
  // 공연장 리스트
  if (pathname.startsWith('/venue')) return backTitleSearch('공연장');
  // 아티스트 상세
  if (pathname.startsWith('/artist/') && artistName) return backTitleSearch(artistName);
  // 아티스트 리스트
  if (pathname.startsWith('/artist')) return backTitleSearch('아티스트');
  // 캘린더
  if (pathname.startsWith('/calendar')) return backTitleSearch('캘린더');
  // 알림
  if (pathname.startsWith('/alarm'))
    return renderHeaderContent(
      <Pressable style={styles.left} onPress={handleGoBack}>
        <IcArrowLeft width={headerIconSize} height={headerIconSize} />
      </Pressable>,
      <Text style={styles.title}>알림</Text>,
      <View style={styles.right} />
    );
  // 검색
  if (pathname.startsWith('/search'))
    return renderHeaderContent(
      <Pressable style={styles.left} onPress={handleGoBack}>
        <IcArrowLeft width={headerIconSize} height={headerIconSize} />
      </Pressable>,
      <Text style={styles.title}>검색</Text>,
      <View style={styles.right} />
    );
  // 마이페이지 관련
  if (pathname.startsWith('/mypage')) return backTitleSearch('');
  if (pathname.startsWith('/stamp')) return backTitleSearch('스탬프');
  if (pathname.startsWith('/favorite')) return backTitleSearch('찜');
  if (pathname.startsWith('/myreview')) return backTitleSearch('내가 쓴 리뷰');
  if (pathname.startsWith('/mystamp')) return backTitleSearch('스탬프 리스트');
  if (pathname.startsWith('/getstamp')) return backTitleSearch('스탬프 찾기');
  if (pathname.startsWith('/nearby')) return backTitleSearch('가까운 공연 찾기');
  if (pathname.startsWith('/notice')) return backTitleSearch('공지사항');
  if (pathname.startsWith('/support')) return backTitleSearch('고객센터');
  if (pathname.startsWith('/login'))
    return renderHeaderContent(
      <Pressable style={styles.left}>
      </Pressable>,
      <Text style={styles.title}></Text>,
      <View style={styles.right} />
    );

  if (pathname.startsWith('/terms/service')) return backTitleSearch('고객센터');
  if (pathname.startsWith('/terms/location')) return backTitleSearch('고객센터');
  if (pathname.startsWith('/terms/privacy')) return backTitleSearch('고객센터');

  // 기본 헤더
  return renderHeaderContent(
    <Pressable style={styles.left}>
      <IcArrowLeft width={headerIconSize} height={headerIconSize} />
    </Pressable>,
    <Text style={styles.title}>{title ?? '기본'}</Text>,
    <View style={styles.right}>
      {pathname.startsWith('/performance') && (
        <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Theme.colors.white,
    paddingTop: Platform.OS === 'android' ? getStatusBarHeight() : 0, // Android 상태바 고려
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: Theme.spacing.sm,
  },
  left: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Theme.spacing.md },
  right: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Theme.spacing.md },
  icon: { marginRight: Theme.spacing.sm },
  title: { fontSize: Theme.fontSizes.lg, fontWeight: Theme.fontWeights.bold },
});
