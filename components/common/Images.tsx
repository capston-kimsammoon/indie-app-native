// /components/common/Images.tsx
import React, { useState, useRef } from "react";
import { View, FlatList, Image, StyleSheet, Dimensions, Modal, Pressable } from "react-native";
import Theme from "@/constants/Theme";
import IcCloseOutline from '@/assets/icons/ic-close-outline.svg';

interface ImageItem {
    id?: number;
    image_url: string;
}

interface Props {
    images: ImageItem[];
    imageSize?: number; // 썸네일 크기
}

export default function Images({ images = [], imageSize = 100 }: Props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { width } = Dimensions.get("window");
    const flatListRef = useRef<FlatList>(null);

    const openModal = (index: number) => {
        setCurrentIndex(index);
        setModalVisible(true);
        setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index, animated: false });
        }, 0);
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    return (
        <View>
            {/* 썸네일 리스트 */}
            <FlatList
                data={images}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => item.id?.toString() ?? item.image_url ?? index.toString()}
                renderItem={({ item, index }) => (
                    <Pressable
                        onPress={() => openModal(index)}
                        style={{ marginRight: Theme.spacing.md, marginBottom: Theme.spacing.md }}
                    >
                        <Image
                            source={{ uri: item.image_url }}
                            style={{ width: imageSize, height: imageSize, borderRadius: 8 }}
                        />
                    </Pressable>
                )}
            />

            {/* 확대 모달 */}
            <Modal visible={modalVisible} transparent={true}>
                <View style={styles.modalContainer}>
                    {/* 닫기 버튼 */}
                    <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <IcCloseOutline width={Theme.iconSizes.lg} height={Theme.iconSizes.lg} />
                    </Pressable>

                    <FlatList
                        ref={flatListRef}
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => item.id?.toString() ?? item.image_url ?? index.toString()}
                        renderItem={({ item }) => (
                            <View style={{ width, justifyContent: "center", alignItems: "center" }}>
                                <Image
                                    source={{ uri: item.image_url }}
                                    style={{ width, height: width, resizeMode: "contain" }}
                                />
                            </View>
                        )}
                        getItemLayout={(_, index) => ({
                            length: width,  // 한 아이템 폭이 width만큼 고정
                            offset: width * index,
                            index,
                        })}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewConfigRef}
                    />


                    {/* 페이지 인디케이터 */}
                    <View style={styles.pagination}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[styles.dot, { opacity: index === currentIndex ? 1 : 0.3 }]}
                            />
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButton: {
        position: 'absolute',
        top: Theme.spacing.xl * 2,
        right: Theme.spacing.md,
        zIndex: 10,
    },
    pagination: {
        position: "absolute",
        bottom: Theme.spacing.xl * 2,
        flexDirection: "row",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Theme.colors.white,
        marginHorizontal: 4,
    },
});
