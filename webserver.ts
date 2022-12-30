import { serve } from 'https://deno.land/std/http/server.ts'
import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { RedisConnection } from "https://deno.land/x/redis@v0.28.0/connection.ts";
import { RedisConnectionOptions } from "https://deno.land/x/redis@v0.28.0/connection.ts";

let redis = new RedisConnection({hostname:"redis://containers-us-west-68.railway.app",port:8040,RedisConnectionOptions({username="default",password="O9GvloCKjwfTR74NoCfM"})})
const app = new Hono()
app.get("/api/:url", async (c) => {
  const uri= c.req.param("url")
  await redis.set(uri, 'http://google.com', {
    EX: 10
  });
  const ret= await redis.get(uri)
  return c.text(ret);
});

serve(app.fetch)
