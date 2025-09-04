import { View, Text } from 'react-native';
export default function SuggestionCard({title, copy}:{title:string; copy:string}){
  return <View style={{padding:12, borderWidth:1, borderColor:'#eee', borderRadius:12}}>
    <Text style={{fontWeight:'bold'}}>{title}</Text>
    <Text>{copy}</Text>
  </View>
}
