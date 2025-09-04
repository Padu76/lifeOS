import { View, Text } from 'react-native';
export default function LifeScoreCard({ score, trend }: { score:number; trend:number }) {
  const color = score < 41 ? 'red' : score < 71 ? 'orange' : 'green';
  return <View style={{padding:16, borderWidth:1, borderColor:'#ddd', borderRadius:12}}>
    <Text style={{fontSize:18}}>LifeScore</Text>
    <Text style={{fontSize:48, color}}>{score}</Text>
    <Text>Trend: {trend >=0 ? `+${trend}` : trend}</Text>
  </View>;
}
