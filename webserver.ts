import { serve } from 'https://deno.land/std/http/server.ts'
import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { connect } from "https://deno.land/x/redis@v0.28.0/redis.ts";
import { parseURL } from "https://deno.land/x/redis@v0.28.0/redis.ts";

  function makeid(length:number):string {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result.toString();
}
const url=Deno.env.get("URL")
const regex = /https?:\/\/(?:www\.)*?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)*(\/[\/\d\w\.-]*)*(?:[\?])*(.+)*/gm;
const regex2 = /...../gm;

const redis =  await connect(parseURL(url))
const app = new Hono()
app.get("/api", async (c) => {
  const val=makeid(5)
  const uri= c.req.queries("url")
  let m;
  while ((m = regex.exec(uri)) !== null) {
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }
  await redis.setex(val,200,m[0])
  return c.json({url:`${Deno.env.get("HOST")+val}`});
}
})
app.get("/:id",async(c)=>{
  const id=c.req.param("id")
  let S;
  while ((S = regex2.exec(id)) !== null) {
    if (S.index === regex.lastIndex) {
        regex.lastIndex++;
    }
  const checker= await redis.exists(S[0])
  console.log(S[0])
  if (checker==1){
    const qury=await redis.get(S[0])
    if (qury.startsWith("https://")){
    return c.redirect(qury, 301)
  }else{
    return c.redirect("https://"+qury.toString(),301)
  }
  }else{
    return c.text("Not Found")
  }
}
})
;

serve(app.fetch)