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

  const url:string[]=searchURL("https://railway.app/project/adw-01cf-4917-acc2-ea1c8315f888/plugin/ecfa081b-6956-4508-a24a-606858b8ae53/Data")
  console.log(btoa(url[2].split('').reverse().join('')))