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
function search(input:string){
  const regex = /^([a-zA-z-0-9]*)/gm;
  let m:RegExpExecArray | null ;
  while ((m = regex.exec(input.toString())) !== null) {
    if (m.index === regex.lastIndex) {regex.lastIndex++;}
    return m;
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
  const val:string=makeid(6)
  const uri:string= c.req.queries("url")
  const duration:number=c.req.queries("dur")
  await redis.setex(val,duration,uri)
  return c.json({url:`${Deno.env.get("HOST")+val}`});
  
  }
)
function findKeyByValue(obj, value:string):string {
  for (const key in obj) {
    if (obj[key] === value) {
      return key;
    }
  }
  return "Not Found";
}
app.get("/:id",async(c)=>{
  const id=c.req.param("id")
  const mod = search(id)
  let data=localStorage
  const red=findKeyByValue(data,`https://smrf.deno.dev/${id}`)
  if (red!=="Not Found"){
    return c.redirect(red,301)
  }
  const qury=await redis.get(mod["0"])
  if (qury){
    return c.redirect(qury, 301)
  }else{
    return c.text("Not Valid")
    }
})
;

serve(app.fetch)