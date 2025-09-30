// app/(tabs)/alarm.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Theme from "@/constants/Theme";
import { useRouter } from "expo-router";
import IcClose from "@/assets/icons/ic-close.svg";
import { fetchNotifications, removeNotification, markNotificationRead } from "@/api/NotificationApi";
import { NotificationItem } from "@/types/notification";
import { formatRelativeTime } from "@/utils/dateUtils";

const NotificationCard = ({
  item,
  onPress,
  onDelete,
}: {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
  onDelete: (id: number) => void;
}) => (
  <TouchableOpacity
    style={[styles.itemContainer, item.is_read && { opacity: 0.5 }]}
    onPress={() => onPress(item)}
  >
    <View style={{ flex: 1 }}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemContent}>{item.body}</Text>
      <Text style={styles.itemDate}>{formatRelativeTime(item.created_at)}</Text>
    </View>
    <TouchableOpacity
      style={styles.closeBtn}
      onPress={() =>
        Alert.alert(
          "알림 삭제",
          "이 알림을 삭제하시겠습니까?",
          [
            { text: "취소", style: "cancel" },
            { text: "삭제", style: "destructive", onPress: () => onDelete(item.id) },
          ],
          { cancelable: true }
        )
      }
    >
      <IcClose width={Theme.iconSizes.sm} height={Theme.iconSizes.sm} />
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function AlarmScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await fetchNotifications();
    setNotifications(data);
  };

  const handlePress = async (item: NotificationItem) => {
    if (!item.is_read) {
      await markNotificationRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
    }

    if (item.link_url) {
      router.push(item.link_url);
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await removeNotification(id);
    if (ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handleDeleteAll = () => {
    if (notifications.length === 0) return;

    Alert.alert(
      "모든 알림 삭제",
      "모든 알림을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            await Promise.all(notifications.map((n) => removeNotification(n.id)));
            setNotifications([]);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 전체 삭제 버튼 */}
      {notifications.length > 0 && (
        <TouchableOpacity style={styles.deleteAllBtn} onPress={handleDeleteAll}>
          <Text style={styles.deleteAllText}>전체 삭제</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationCard item={item} onPress={handlePress} onDelete={handleDelete} />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>알림이 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },
  deleteAllBtn: {
    alignItems: "flex-end",
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  deleteAllText: {
    color: Theme.colors.darkGray,
    fontSize: Theme.fontSizes.sm,
    fontWeight: Theme.fontWeights.regular,
  },
  itemContainer: {
    flexDirection: "row",
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Theme.colors.lightGray,
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  itemTitle: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.bold,
    marginBottom: Theme.spacing.xs,
  },
  itemContent: {
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.xs,
  },
  itemDate: {
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.gray,
    marginTop: Theme.spacing.xs,
  },
  closeBtn: { marginLeft: Theme.spacing.sm },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Theme.spacing.lg,
  },
  emptyText: {
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.gray,
  },
});
