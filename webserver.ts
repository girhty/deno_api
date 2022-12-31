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
const regex = /([a-zA-Z,:,\/\/,0-9]*\.[a-zA-Z]*)/gm;
const regex1= /[a-zA-Z0-9]/gm;
const redis =  await connect(parseURL("redis://default:O9GvloCKjwfTR74NoCfM@containers-us-west-68.railway.app:8040"))
const app = new Hono()
app.get("/api", async (c) => {
  const val=makeid(5)
  const uri= c.req.queries("url")
  const id=c.req.queries("id")
  let m;
const checker= await redis.exists(id)
    if (checker==1){
      const qury=await redis.get(id)
      return c.redirect(`${qury || "https://"+qury}`, 301)
    }
    else{
      while ((m = regex.exec(uri)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
      await redis.setex(val,20,m[0])
      return c.json({url:`${"http://localhost:8000/api?id="+val}`});
    }
    }
});

serve(app.fetch)
