function searchURL(input: string) {
    const regex = /https?:\/\/(?:www\.)?([-\d\w.]{2,256}[\d\w]{2,6}\b)*(\/[?\/\d\w\=+&#.-]*)*/gi;
    let m;
    while ((m = regex.exec(input)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        return m;
  }}

  const url:string[]=searchURL("https://redis.io/docs")
const id=btoa(url[2])
console.log(id)
console.log(id.split("").reverse().join("").replace("=",'').substring(Math.floor(id.length/1.25),Math.floor(id.length/1.25)+6))
  