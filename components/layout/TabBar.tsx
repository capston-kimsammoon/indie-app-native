import { View, Pressable, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Theme from "@/constants/Theme";
import { RFValue } from "react-native-responsive-fontsize";

// 아이콘
import IcBarHome from "@/assets/icons/ic-bar-home.svg";
import IcBarCalendar from "@/assets/icons/ic-bar-calendar.svg";
import IcBarLocation from "@/assets/icons/ic-bar-location.svg";
import IcBarStamp from "@/assets/icons/ic-bar-stamp.svg";
import IcBarMypage from "@/assets/icons/ic-bar-mypage.svg";

type Props = { pathname: string };

const TABS = [
  { label: "홈", route: "/", Icon: IcBarHome },
  { label: "캘린더", route: "/calendar", Icon: IcBarCalendar },
  { label: "주변 공연", route: "/nearby", Icon: IcBarLocation },
  { label: "스탬프", route: "/stamp", Icon: IcBarStamp },
  { label: "마이페이지", route: "/mypage", Icon: IcBarMypage },
];

export default function TabBar({ pathname }: Props) {
  const router = useRouter();
  const iconSize = Theme.iconSizes.lg;

  const TabButton = ({
    route,
    Icon,
    label,
  }: {
    route: string;
    Icon: any;
    label: string;
  }) => {
    const isActive = pathname === route;
    const color = isActive ? Theme.colors.themeOrange : Theme.colors.gray;

    const handlePress = () => {
      if (!isActive) {
        router.push(route); // 현재 화면이면 push 안 함
      }
    };

    return (
      <TouchableOpacity style={styles.tab} onPress={handlePress}>
        <Icon width={iconSize} height={iconSize} fill={color} />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {TABS.map((tab, i) => (
        <TabButton key={i} {...tab} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Theme.colors.lightGray,
    backgroundColor: Theme.colors.white,
    paddingBottom: Theme.spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.sm,
    margin: Theme.spacing.xs,
  },
  label: {
    fontSize: RFValue(9),
    fontWeight: Theme.fontWeights.medium,
    marginTop: Theme.spacing.xs,
  },
});
