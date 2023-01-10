import { serve } from 'https://deno.land/std/http/server.ts'
import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { connect } from "https://deno.land/x/redis@v0.28.0/redis.ts";
import { parseURL } from "https://deno.land/x/redis@v0.28.0/redis.ts";
import { cors } from 'https://deno.land/x/hono/middleware.ts'

  function makeid(length:number):string {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result.toString();
}
function search(input){
  const regex = /(......)/gm;
  let m;
  while ((m = regex.exec(input.toString())) !== null) {
    if (m.index === regex.lastIndex) {regex.lastIndex++;}
    return m
  }
}
const url=Deno.env.get("URL")
const redis =  await connect(parseURL(url))
const app = new Hono()
app.use(
  '/api',
  cors({
    origin: "*",
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600
  })
)
app.all("/api", async (c) => {
  const val:string=makeid(5)
  const uri:string= c.req.queries("url")
  const duration:number=c.req.queries("dur")
  await redis.setex(val,duration,uri)
  return c.json({url:`${Deno.env.get("HOST")+val}`});
  }
)
app.get("/:query",async(c)=>{
  const query=c.req.param("query")
  const id = search(query)
  const qury=await redis.get(id['0'])
  if (qury){
    return c.redirect(qury, 301)
  }
  return c.text("Not Found")
})
;

serve(app.fetch)