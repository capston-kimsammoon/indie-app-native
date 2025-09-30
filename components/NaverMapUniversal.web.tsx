// components/NaverMapUniversal.web.tsx
import React from "react";
import NaverMapWeb from "@/app/(tabs)/venue/NaverMapWeb";

type Marker = { id: string | number; lat: number; lng: number; title?: string };

type Props = {
  height?: number;
  markers?: Marker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerPress?: (id: string | number) => void;
  onSearchInMap?: (p: any) => void;
  pinSvg?: string;
  selectedPinSvg?: string;
  selectedId?: number;
};

export default function NaverMapUniversal(props: Props) {
  return <NaverMapWeb {...props} />;
}
