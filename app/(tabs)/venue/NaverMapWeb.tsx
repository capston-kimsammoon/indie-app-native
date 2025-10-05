import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

export type Marker = { id: string | number; lat: number; lng: number; title?: string };

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
  naverClientId?: string; // 사용 안 함(요청대로 하드코딩 URL 사용) - 남겨둠
};

const BASE_URL = 'https://localhost';

const buildHtml = () => `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    html,body,#map{margin:0;padding:0;height:100%}
    .btn{position:absolute;z-index:1000;background:#fff5ef;border:1px solid #ff7a3d;color:#d55a1f;border-radius:24px;padding:6px 10px}
    #searchHere{top:10px;left:50%;transform:translateX(-50%)}
    #locateMe{right:12px;bottom:12px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;background-color:transparent;border:none}
  </style>
</head>
<body>
  <div id="map"></div>
  <button id="searchHere" class="btn">현 지도에서 검색</button>
  <button id="locateMe" class="btn" aria-label="현 위치로 이동">📍</button>
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#B0B0B0"><path d="M440-42v-80q-125-14-214.5-103.5T122-440H42v-80h80q14-125 103.5-214.5T440-838v-80h80v80q125 14 214.5 103.5T838-520h80v80h-80q-14 125-103.5 214.5T520-122v80h-80Zm40-158q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-120q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400Zm0-80Z"/></svg>

  <script>
  (function(){
    function post(x){ try{ window.ReactNativeWebView.postMessage(JSON.stringify(x)); }catch(e){} }
    post({ type:'origin', origin: location.origin, href: location.href });

    // 네이버 지도 JS 로더 (요청대로 URL 고정)
    var s = document.createElement('script');
    s.src = "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=kfo2xff2i9";
    s.onload = function(){ post({ type:'maps', ok:true }); init(); };
    s.onerror = function(e){ post({ type:'maps', ok:false, error: String(e), src: s.src }); };
    document.head.appendChild(s);

    var map=null, markers=[], ready=false, queue=[], myMarker=null;
    var initialCentered=false; var locateFallbackTimer=null;

    function init(){
      if(!window.naver||!naver.maps){ post({ type:'init', ok:false }); return; }
      map = new naver.maps.Map('map',{ center:new naver.maps.LatLng(37.5533,126.9232), zoom:13 });
      ready=true; post({ type:'ready' });
      while(queue.length){ handle(queue.shift()); }

      document.getElementById('searchHere').onclick=function(){
        var b=map.getBounds(), c=map.getCenter();
        post({ type:'searchHere',
          ne:{lat:b.getNE().lat(),lng:b.getNE().lng()},
          sw:{lat:b.getSW().lat(),lng:b.getSW().lng()},
          center:{lat:c.lat(),lng:c.lng()},
          zoom: map.getZoom()
        });
      };
      document.getElementById('locateMe').onclick=function(){ post({ type:'locate:request' }); };

      // 진입 즉시 위치 요청 (RN이 응답 늦으면 HTML5 폴백)
      // post({ type:'locate:request', reason:'init' });
      // clearTimeout(locateFallbackTimer);
      // locateFallbackTimer=setTimeout(function(){
      //   if(initialCentered) return;
      //   if(navigator.geolocation){
      //     navigator.geolocation.getCurrentPosition(function(pos){
      //       handle({ type:'locate:set', lat:pos.coords.latitude, lng:pos.coords.longitude, accuracy:pos.coords.accuracy });
      //     }, function(err){
      //       post({ type:'locate:error', source:'html5', code:err.code, message:err.message });
      //     }, { enableHighAccuracy:true, timeout:5000, maximumAge:10000 });
      //   }
      // }, 1200);
    }

    window.addEventListener('message', function(e){
      var msg; try{ msg=JSON.parse(e.data||'{}'); }catch(_){ return; }
      if(!ready){ queue.push(msg); return; }
      handle(msg);
    });

    function handle(msg){
      if(msg.type==='setMarkers'){
        markers.forEach(m=>m.setMap(null)); markers=[];
        var baseSvg=msg.pinSvg||null, selSvg=msg.selectedPinSvg||baseSvg;
        var selId=msg.selectedId!=null?String(msg.selectedId):null;
        (msg.data||[]).forEach(function(it){
          if(!it) return;
          var icon;
          if(selId && String(it.id)===selId && selSvg){
            icon={ content: selSvg, size:new naver.maps.Size(28,28), anchor:new naver.maps.Point(14,28) };
          }else if(baseSvg){
            icon={ content: baseSvg, size:new naver.maps.Size(28,28), anchor:new naver.maps.Point(14,28) };
          }
          var m=new naver.maps.Marker({ position:new naver.maps.LatLng(it.lat,it.lng), map, title:it.title||'', icon: icon||undefined });
          naver.maps.Event.addListener(m,'click',()=>post({ type:'marker', id: it.id }));
          markers.push(m);
        });
        post({ type:'setMarkers:done', count: markers.length });

      } else if(msg.type==='setView' && msg.center){
        map.setCenter(new naver.maps.LatLng(msg.center.lat,msg.center.lng));
        if(typeof msg.zoom==='number') map.setZoom(msg.zoom);
        post({ type:'setView:done', center: msg.center, zoom: msg.zoom });

      } else if(msg.type==='locate:set' && typeof msg.lat==='number' && typeof msg.lng==='number'){
        clearTimeout(locateFallbackTimer);
        var ll=new naver.maps.LatLng(msg.lat,msg.lng);
        if(!myMarker){
          myMarker=new naver.maps.Marker({ position: ll, map, icon:{ content:'<div style="background:#007bff;border-radius:50%;width:14px;height:14px;border:2px solid white;"></div>', size:new naver.maps.Size(14,14), anchor:new naver.maps.Point(7,7) }, zIndex: 9999 });
        }else{ myMarker.setPosition(ll); }
        // if(!initialCentered){ initialCentered=true; map.setCenter(ll); map.setZoom(15); post({ type:'locate:centered', zoom:15 }); }
        // else{ map.panTo(ll); }
        if(msg.forceZoom === true){ map.setZoom(15); }
        map.panTo(ll);
      }
    }
  })();
  </script>
</body>
</html>`;

export default function NaverMapWeb({
  height = 240,
  markers = [],
  center,
  zoom,
  onMarkerPress,
  onSearchInMap,
  pinSvg,
  selectedPinSvg,
  selectedId,
}: Props) {
  const webRef = useRef<WebView>(null);
  const post = (m: any) => webRef.current?.postMessage?.(JSON.stringify(m));

  const HTML = useMemo(() => buildHtml(), []);
  const [ready, setReady] = useState(false);

  const postMarkers = () => {
    if (!ready) return;
    post({
      type: 'setMarkers',
      data: markers,
      pinSvg: pinSvg ?? null,
      selectedPinSvg: selectedPinSvg ?? null,
      selectedId: typeof selectedId === 'number' ? selectedId : null
    });
  };
  useEffect(() => { postMarkers(); }, [ready, markers]);
  useEffect(() => { if (ready && center) post({ type: 'setView', center, zoom }); }, [ready, center, zoom]);
  useEffect(() => { postMarkers(); }, [ready, pinSvg, selectedPinSvg, selectedId]);

  const handleLocateRequest = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한 필요', '설정에서 위치 권한을 허용해 주세요.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      post({ type: 'locate:set', lat: pos.coords.latitude, lng: pos.coords.longitude , forceZoom: true});
    } catch (e: any) {
      Alert.alert('현재 위치를 가져오지 못했어요', String(e?.message || e));
    }
  };

  return (
    <View style={{ height }}>
      <WebView
        ref={webRef}
        source={{ html: HTML, baseUrl: BASE_URL }}
        originWhitelist={['*']}
        onLoadEnd={() => { /* 초기 로드 완료(네이버 스크립트 로딩은 별도) */ }}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === 'ready') {
              setReady(true);
              // 초기 싱크 한번
              if (center) post({ type: 'setView', center, zoom });
              postMarkers();
            }
            if (msg.type === 'marker') onMarkerPress?.(msg.id);
            else if (msg.type === 'searchHere') onSearchInMap?.(msg);
            else if (msg.type === 'locate:request') handleLocateRequest();
            else console.log('[WEB MSG]', msg);
          } catch {}
        }}
      />
    </View>
  );
}
