import { View, Text } from 'react-native';
import LifeScoreCard from '../../components/LifeScoreCard';
export default function Dashboard() {
  return <View style={{padding:16}}><Text style={{fontSize:20}}>Dashboard</Text><LifeScoreCard score={72} trend={3} /></View>;
}
