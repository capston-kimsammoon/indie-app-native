import { Text, TextProps } from './Themed';

export function PretendardText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'Pretendard' }]} />;
}
