// components/maps/NaverMapWebView.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

export type Marker = {
  id: string | number;
  lat: number;
  lng: number;
  title?: string;
};

type Props = {
  height?: number;
  markers?: Marker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerPress?: (id: string | number) => void;
  onSearchInMap?: (params: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
    center: { lat: number; lng: number };
    zoom?: number;
  }) => void;
  pinSvg?: string;
  selectedPinSvg?: string;
  selectedId?: number;
  myLocation?: { lat: number; lng: number } | null;
};

const buildHtml = (
  clientId: string,
  initialCenter: { lat: number; lng: number },
  initialZoom: number
) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .marker-label {
      background: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      position: absolute;
      transform: translate(-50%, -100%);
      margin-top: -8px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  
  <script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}"></script>
  <script>
    (function() {
      let map = null;
      let markers = [];
      let markerLabels = [];
      let ready = false;
      let queue = [];
      var myLocationMarker = null;
      var myLocationCircle = null;

      const INITIAL_CENTER = { 
        lat: ${Number(initialCenter.lat).toFixed(6)}, 
        lng: ${Number(initialCenter.lng).toFixed(6)} 
      };
      const INITIAL_ZOOM = ${Number(initialZoom)};

      function postMessage(data) {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        } catch (e) {
          // Silent fail
        }
      }

      function log(message, data) {
        postMessage({ type: 'log', message: message + ' ' + JSON.stringify(data || '') });
      }

      function init() {
        if (!window.naver || !window.naver.maps) {
          postMessage({ 
            type: 'error', 
            message: 'Naver Maps not loaded'
          });
          return;
        }

        try {
          log('🗺️ Initializing map', { center: INITIAL_CENTER, zoom: INITIAL_ZOOM });
          
          map = new naver.maps.Map('map', {
            center: new naver.maps.LatLng(INITIAL_CENTER.lat, INITIAL_CENTER.lng),
            zoom: INITIAL_ZOOM,
            zoomControl: false,
            mapTypeControl: false,
          });

          naver.maps.Event.addListener(map, 'idle', function() {
            var bounds = map.getBounds();
            var center = map.getCenter();
            var zoom = map.getZoom();
            
            var ne = bounds.getNE();
            var sw = bounds.getSW();
            
            postMessage({
              type: 'boundsChanged',
              bounds: {
                ne: { lat: ne.lat(), lng: ne.lng() },
                sw: { lat: sw.lat(), lng: sw.lng() },
                center: { lat: center.lat(), lng: center.lng() },
                zoom: zoom
              }
            });
          });

          ready = true;
          postMessage({ 
            type: 'ready', 
            message: 'Map initialized',
            center: INITIAL_CENTER,
            zoom: INITIAL_ZOOM
          });

          while (queue.length > 0) {
            handleMessage(queue.shift());
          }
        } catch (error) {
          postMessage({ 
            type: 'init_error', 
            message: error.message,
            stack: error.stack 
          });
        }
      }

      function handleMessage(msg) {
        if (!msg || !msg.type) return;

        switch (msg.type) {
          case 'setMarkers':
            setMarkers(msg.data, msg.pinSvg, msg.selectedPinSvg, msg.selectedId);
            break;
          case 'setView':
            if (msg.center) {
              map.setCenter(new naver.maps.LatLng(msg.center.lat, msg.center.lng));
            }
            if (typeof msg.zoom === 'number') {
              map.setZoom(msg.zoom);
            }
            postMessage({ type: 'setView:done' });
            break;
          case 'locate':
            if (msg.lat && msg.lng) {
              map.panTo(new naver.maps.LatLng(msg.lat, msg.lng));
              if (msg.zoom) map.setZoom(msg.zoom);
            }
            break;
          case 'showMyLocation':
            showMyLocation(msg.lat, msg.lng);
            break;
          case 'hideMyLocation':
            hideMyLocation();
            break;
        }
      }

      function showMyLocation(lat, lng) {
        hideMyLocation();
        
        var position = new naver.maps.LatLng(lat, lng);
        
        // myLocationCircle = new naver.maps.Circle({
        //   map: map,
        //   center: position,
        //   radius: 50,
        //   fillColor: '#4285F4',
        //   fillOpacity: 0.2,
        //   strokeColor: '#4285F4',
        //   strokeOpacity: 0.5,
        //   strokeWeight: 1,
        //   clickable: false
        // });
        
        // myLocationMarker = new naver.maps.Marker({
        //   map: map,
        //   position: position,
        //   icon: {
        //     content: '<div style="width: 20px; height: 20px; border-radius: 50%; background: #4285F4; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        //     anchor: new naver.maps.Point(10, 10)
        //   },
        //   zIndex: 1000
        // });
      }

      function hideMyLocation() {
        if (myLocationMarker) {
          myLocationMarker.setMap(null);
          myLocationMarker = null;
        }
        if (myLocationCircle) {
          myLocationCircle.setMap(null);
          myLocationCircle = null;
        }
      }

      function setMarkers(data, baseSvg, selectedSvg, selectedId) {
        // 기존 마커 제거
        markers.forEach(m => m.setMap(null));
        markerLabels.forEach(l => l.setMap && l.setMap(null));
        markers = [];
        markerLabels = [];

        if (!data || !Array.isArray(data)) return;

        data.forEach(item => {
          if (!item || typeof item.lat !== 'number' || typeof item.lng !== 'number') return;

          const isSelected = selectedId != null && String(item.id) === String(selectedId);

          // 내 위치는 기본 마커로
          let icon = undefined;
          if (String(item.id) !== '-1') {
            const svg = isSelected && selectedSvg ? selectedSvg : baseSvg;
            if (svg) {
              const size = isSelected ? 40 : 32;
              const encodedSvg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
              icon = {
                url: encodedSvg,
                size: new naver.maps.Size(size, size),
                anchor: new naver.maps.Point(size / 2, size),
              };
            }
          }

          const position = new naver.maps.LatLng(item.lat, item.lng);

          const marker = new naver.maps.Marker({
            position,
            map: map,
            title: item.title || '',
            icon, // undefined이면 기본 마커
            zIndex: isSelected ? 100 : 10,
          });

          marker.addListener('click', () => {
            postMessage({ type: 'markerClick', id: item.id });
          });

          markers.push(marker);

          // 선택된 마커에만 라벨
          if (isSelected && String(item.id) !== '-1' && item.title) {
            const labelText = item.title.length > 8 ? item.title.substring(0, 8) + '...' : item.title;
            const label = new naver.maps.Marker({
              position,
              map,
              icon: {
                content: '<div class="marker-label" style="color: #3C9C58;">' + labelText + '</div>',
                anchor: new naver.maps.Point(0, 44),
              },
              zIndex: 101,
            });
            markerLabels.push(label);
          }
        });

        postMessage({ type: 'markersSet', count: markers.length });
      }


      window.addEventListener('message', function(event) {
        try {
          var msg = JSON.parse(event.data);
          if (!ready) {
            queue.push(msg);
          } else {
            handleMessage(msg);
          }
        } catch (e) {
          postMessage({ type: 'error', message: 'Parse error: ' + e.message });
        }
      });

      document.addEventListener('message', function(event) {
        try {
          var msg = JSON.parse(event.data);
          if (!ready) {
            queue.push(msg);
          } else {
            handleMessage(msg);
          }
        } catch (e) {
          postMessage({ type: 'error', message: 'Document parse error: ' + e.message });
        }
      });

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        setTimeout(init, 100);
      }
    })();
  </script>
</body>
</html>`;

export default function NaverMapWebView({
  height = 240,
  markers = [],
  center,
  zoom,
  onMarkerPress,
  onSearchInMap,
  pinSvg,
  selectedPinSvg,
  selectedId,
  myLocation,
}: Props) {
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);

  const naverClientId = Constants.expoConfig?.extra?.naverMapKey ||
    Constants.manifest?.extra?.naverMapKey ||
    process.env.EXPO_PUBLIC_NAVER_MAP_KEY;

  const HTML = useMemo(() => {
    if (!naverClientId) {
      console.error('❌ Naver Map Client ID is not set');
      return '<html><body><h1>Map configuration error</h1></body></html>';
    }

    const initialCenter = center || { lat: 37.5665, lng: 126.978 };
    const initialZoom = zoom || 15;

    return buildHtml(naverClientId, initialCenter, initialZoom);
  }, [naverClientId, center, zoom]);

  const postMessage = (msg: any) => {
    if (webRef.current) {
      webRef.current.postMessage(JSON.stringify(msg));
    }
  };

  // 마커 업데이트
  useEffect(() => {
    if (!ready) return;

    const timer = setTimeout(() => {
      postMessage({
        type: 'setMarkers',
        data: markers,
        pinSvg: pinSvg || null,
        selectedPinSvg: selectedPinSvg || null,
        selectedId: selectedId != null ? selectedId : null
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [ready, markers, pinSvg, selectedPinSvg, selectedId]);

  // 중심점 변경
  useEffect(() => {
    if (!ready || !center) return;

    postMessage({
      type: 'setView',
      center: center,
      zoom: zoom
    });
  }, [ready, center, zoom]);

  // 내 위치 표시/숨기기
  useEffect(() => {
    if (!ready) return;

    if (myLocation) {
      postMessage({
        type: 'showMyLocation',
        lat: myLocation.lat,
        lng: myLocation.lng
      });
    } else {
      postMessage({
        type: 'hideMyLocation'
      });
    }
  }, [ready, myLocation]);

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      switch (msg.type) {
        case 'ready':
          setReady(true);
          break;

        case 'init_error':
          console.error('❌ Map init error:', msg.message);
          Alert.alert('지도 초기화 실패', msg.message);
          break;

        case 'markerClick':
          if (onMarkerPress) {
            onMarkerPress(msg.id);
          }
          break;

        case 'boundsChanged':
          if (onSearchInMap) {
            onSearchInMap({
              ne: msg.bounds.ne,
              sw: msg.bounds.sw,
              center: msg.bounds.center,
              zoom: msg.bounds.zoom
            });
          }
          break;

        case 'error':
          console.error('[NaverMap Error]', msg.message);
          break;

        default:
          break;
      }
    } catch (e) {
      console.error('Message parse error:', e);
    }
  };

  return (
    <View style={{ height }}>
      <WebView
        ref={webRef}
        source={{
          html: HTML,
          baseUrl: 'http://localhost'
        }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        style={{ flex: 1 }}
      />
    </View>
  );
}