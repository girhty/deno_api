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

const redis =  await connect(parseURL("redis://default:O9GvloCKjwfTR74NoCfM@containers-us-west-68.railway.app:8040"))
const app = new Hono()
app.get("/api", async (c) => {
  const val=makeid(5)
  const uri= c.req.queries("url")
  const checker= await redis.exists(uri)
  if (checker==1){
    const qury=await redis.get(uri)
    return c.redirect(qury, 301)
  }
  else{
    await redis.setex(val,40,uri)
    return c.json({url:`${"http://localhost:8000/api?url="+val}`});
  }
});

serve(app.fetch)
