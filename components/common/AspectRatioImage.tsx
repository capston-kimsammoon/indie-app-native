/*
import { useState, useEffect } from "react";
import { Image, View, StyleSheet } from "react-native";

export default function AspectRatioImage({ uri }: { uri: string }) {
  const [height, setHeight] = useState(200); // 기본값

  useEffect(() => {
    Image.getSize(uri, (width, height) => {
      const screenWidth = 300; // 원하는 width
      const ratio = height / width;
      setHeight(screenWidth * ratio);
    });
  }, [uri]);

  return <Image source={{ uri }} style={{ width: 300, height }} resizeMode="cover" />;
}
*/