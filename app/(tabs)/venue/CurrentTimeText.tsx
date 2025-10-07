// import React, { useEffect, useState } from 'react';
// import { Text } from 'react-native';

// export default function CurrentTimeText(){
// const [time, setTime] = useState(new Date());
// useEffect(()=>{ const t = setInterval(()=>setTime(new Date()), 1000); return ()=>clearInterval(t); },[]);
// const t = format(time);
// return <Text style={{ textAlign: 'left', paddingHorizontal: 16, paddingVertical: 12, fontWeight: '600' }}>{t}</Text>;
// }
// function format(date: Date){
// const h = date.getHours(); const m = String(date.getMinutes()).padStart(2,'0');
// const period = h>=12 ? '오후':'오전'; const hour = h % 12 === 0 ? 12 : h % 12;
// return `${period} ${hour}시 ${m}분 이후 공연`;
// }