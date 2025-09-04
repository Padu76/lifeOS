export default function Button({children, ...props}:{children:any}){
  return <button {...props} style={{padding:8, borderRadius:8}}>{children}</button>
}
