import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Theme from '@/constants/Theme';

// 아이콘
import IcBarHome from '@/assets/icons/ic-bar-home.svg';
import IcBarCalendar from '@/assets/icons/ic-bar-calendar.svg';
import IcBarLocation from '@/assets/icons/ic-bar-location.svg';
import IcBarStamp from '@/assets/icons/ic-bar-stamp.svg';
import IcBarMypage from '@/assets/icons/ic-bar-mypage.svg';

type Props = { pathname: string };

export default function TabBar({ pathname }: Props) {
  const router = useRouter();
  const iconSize = Theme.iconSizes.lg;

  const TabButton = ({ route, Icon }: { route: string; Icon: any }) => (
    <Pressable style={styles.tab} onPress={() => router.push(route)}>
      <Icon
        width={iconSize}
        height={iconSize}
      />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <TabButton route="/" Icon={IcBarHome} />
      <TabButton route="/calendar" Icon={IcBarCalendar} />
      <TabButton route="/location" Icon={IcBarLocation} />
      <TabButton route="/stamp" Icon={IcBarStamp} />
      <TabButton route="/mypage" Icon={IcBarMypage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.lightGray,
    backgroundColor: Theme.colors.white,
    marginBottom: Theme.spacing.md,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.md},
});
