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

function toBinary(input:string):string {
    const codeUnits = Uint16Array.from(
      { length: input.length },
      (element, index) => input.charCodeAt(index)
    );
    const charCodes = new Uint8Array(codeUnits.buffer);
  
    let result = "";
    charCodes.forEach((char) => {
      result += String.fromCharCode(char);
    });
    return result;
  }

  const url:string[] =searchURL("https://www.twitch.com")
const id=btoa(url[1]).split("").reverse().join("").substring(0, 6)
console.log(id,url)
console.log(id.split("").reverse().join("").replace(/\=*/gm,''))
