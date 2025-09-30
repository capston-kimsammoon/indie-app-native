import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Theme from '@/constants/Theme';
import { useRouter } from 'expo-router';

// 아이콘
import IcHeaderLogo from '@/assets/icons/ic-header-logo.svg';
import IcHeaderSearch from '@/assets/icons/ic-header-search.svg';
import IcHeaderAlarm from '@/assets/icons/ic-header-alarm.svg';
import IcArrowLeft from '@/assets/icons/ic-arrow-left.svg';

type Props = { pathname: string; title?: string, venueName?: string, artistName?: string};

export default function Header({ pathname, title, venueName, artistName }: Props) {
  const headerIconSize = Theme.iconSizes.md;
  const router = useRouter();

  // 3. 페이지 이동 함수들
  const handleNavigateToAlarm = () => {
    router.push('/alarm');
  };
  const handleNavigateToSearch = () => {
    router.push('/search');
  };
  const handleGoBack = () => {
    router.back();
  };

  // 페이지별 조건부 UI
  if (pathname === '/' || pathname === '/index') {
    // 홈
    return (
      <View style={styles.header}>
        <View style={styles.left}>
          <IcHeaderLogo height={headerIconSize} />
        </View>
        <View style={styles.right}>
          {/* 각 아이콘에 맞는 이동 함수 연결 */}
          <Pressable style={styles.icon} onPress={handleNavigateToSearch}>
            <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
          </Pressable>
          <Pressable onPress={handleNavigateToAlarm}>
            <IcHeaderAlarm width={headerIconSize} height={headerIconSize} />
          </Pressable>
        </View>
      </View>
    );
  }

  if (pathname.startsWith('/magazine')) {
    // 매거진
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={handleGoBack}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>김삼문 pick!</Text>
        <Pressable style={styles.right} onPress={handleNavigateToSearch}>
          <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
        </Pressable>
      </View>
    );
  }

  if (pathname.startsWith('/review')) {
    // 공연장 리뷰
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={handleGoBack}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>공연장 리뷰</Text>
        <Pressable style={styles.right} onPress={handleNavigateToSearch}>
          <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
        </Pressable>
      </View>
    );
  }

  if (pathname.startsWith('/performance/') && title) {
    // 공연 상세
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={handleGoBack}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>{title}</Text> 
        <Pressable style={styles.right} onPress={handleNavigateToSearch}>
          <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
        </Pressable>
      </View>
    );
  }

  if (pathname.startsWith('/performance')) {
    // 공연 리스트
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={handleGoBack}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>공연</Text>
        <Pressable style={styles.right} onPress={handleNavigateToSearch}>
          <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
        </Pressable>
      </View>
    );
  }

  if (pathname.startsWith('/venue/') && title) {
    // 공연장 상세
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={handleGoBack}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>{venueName}</Text> 
        <Pressable style={styles.right} onPress={handleNavigateToSearch}>
          <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
        </Pressable>
      </View>
    );
  }

  if (pathname.startsWith('/venue')) {
    // 공연장 리스트
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={handleGoBack}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>공연장</Text>
        <Pressable style={styles.right} onPress={handleNavigateToSearch}>
          <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
        </Pressable>
      </View>
    );
  }

  if (pathname.startsWith('/artist/') && title) {
    // 아티스트 상세
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={handleGoBack}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>{artistName}</Text> 
        <Pressable style={styles.right} onPress={handleNavigateToSearch}>
          <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
        </Pressable>
      </View>
    );
  }

  if (pathname.startsWith('/artist')) {
    // 아티스트 리스트
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={handleGoBack}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>아티스트</Text>
        <Pressable style={styles.right} onPress={handleNavigateToSearch}>
          <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
        </Pressable>
      </View>
    );
  }

  if (pathname.startsWith('/calendar')) {
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={handleGoBack}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>캘린더</Text>
        <Pressable style={styles.right} onPress={handleNavigateToSearch}>
          <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
        </Pressable>
      </View>
    );
  }
  
  // 알림 페이지 헤더
  if (pathname.startsWith('/alarm')) {
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={handleGoBack}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>알림</Text>
        <View style={styles.right} />
      </View>
    );
  }

  // 검색 페이지 헤더 추가
  if (pathname.startsWith('/search')) {
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={handleGoBack}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>검색</Text>
        <View style={styles.right} />
      </View>
    );
  }

  if (pathname.startsWith('/mypage')) {
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={() => router.push('/')}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}></Text>
        <View style={styles.right}>
        </View>
      </View>
    );
  }
  if (pathname.startsWith('/stamp')) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.left} onPress={() => router.push('/')}>
        <IcArrowLeft width={headerIconSize} height={headerIconSize} />
      </Pressable>
      <Text style={styles.title}>스탬프</Text>
      <Pressable
       style={styles.right}
       hitSlop={8}
       onPress={() => router.setParams({ search: '1' })}
     >
        <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
      </Pressable>
    </View>
  );
}
  if (pathname.startsWith('/favorite')) {
    return (
      <View style={styles.header}>
        <Pressable style={styles.left} onPress={() => router.push('/mypage')}>
          <IcArrowLeft width={headerIconSize} height={headerIconSize} />
        </Pressable>
        <Text style={styles.title}>찜</Text>
        <View style={styles.right}>
        </View>
      </View>
    );
  }
  if (pathname.startsWith('/myreview')) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.left} onPress={() => router.push('/mypage')}>
        <IcArrowLeft width={headerIconSize} height={headerIconSize} />
      </Pressable>
      <Text style={styles.title}>내가 쓴 리뷰</Text>
      <Pressable
       style={styles.right}
       hitSlop={8}
       onPress={() => router.setParams({ search: '1' })}
     >
        <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
      </Pressable>
    </View>
  );
}
if (pathname.startsWith('/mystamp')) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.left} onPress={() => router.push('/mypage')}>
        <IcArrowLeft width={headerIconSize} height={headerIconSize} />
      </Pressable>
      <Text style={styles.title}>나의 스탬프</Text>
      <Pressable
       style={styles.right}
       hitSlop={8}
       onPress={() => router.setParams({ search: '1' })}
     >
        <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
      </Pressable>
    </View>
  );
}
if (pathname.startsWith('/getstamp')) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.left} onPress={() => router.push('/mystamp')}>
        <IcArrowLeft width={headerIconSize} height={headerIconSize} />
      </Pressable>
      <Text style={styles.title}>스탬프 찾기</Text>
      <Pressable
       style={styles.right}
       hitSlop={8}
       onPress={() => router.setParams({ search: '1' })}
     >
        <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
      </Pressable>
    </View>
  );
}

if (pathname.startsWith('/location')) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.left} onPress={() => router.push('/')}>
        <IcArrowLeft width={headerIconSize} height={headerIconSize} />
      </Pressable>
      <Text style={styles.title}>가까운 공연 찾기</Text>
      <Pressable
       style={styles.right}
       hitSlop={8}
       onPress={() => router.setParams({ search: '1' })}
     >
        <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
      </Pressable>
    </View>
  );
}
  // 기본 헤더
  return (
    <View style={styles.header}>
      <Pressable style={styles.left}>
        <IcArrowLeft width={headerIconSize} height={headerIconSize} />
      </Pressable>
      <Text style={styles.title}>{title ?? '기본'}</Text>
      <View style={styles.right}>
        {pathname.startsWith('/performance') && (
          <IcHeaderSearch width={headerIconSize} height={headerIconSize} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
    borderBottomColor: Theme.colors.lightGray,
    backgroundColor: Theme.colors.white,
    marginTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.xs,
  },
  left: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md },
  right: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md },
  icon: { marginRight: Theme.spacing.sm },
  title: { fontSize: Theme.fontSizes.lg, fontWeight: Theme.fontWeights.bold, padding: Theme.spacing.lg },
});
