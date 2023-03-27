import { Hono } from "https://deno.land/x/hono/mod.ts";
import { connect } from "https://deno.land/x/redis@v0.28.0/redis.ts";
import { parseURL } from "https://deno.land/x/redis@v0.28.0/redis.ts";
import { cors } from "https://deno.land/x/hono/middleware.ts";
import {serve} from "https://deno.land/std/http/server.ts";


function searchID(input: string) {
  const regex = /^([a-zA-z-0-9]*)/gi;
  let m;
  while ((m = regex.exec(input.toString())) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    return m;
  }
}
function searchURL(input: string) {
  const regex =
    /https?:\/\/(?:www\.)?([-\d\w.]{2,256}[\d\w]{2,6}\b)*(\/[?\/\d\w\=+&#.-]*)*/gi;
  let m;
  while ((m = regex.exec(input)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    return m;
  }
}
const url = Deno.env.get("URL");
const redis = await connect(parseURL(url));
const app = new Hono();
app.use(
  "/api",
  cors({
    origin: "https://smrf.cc",
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
  })
);

app.all("/api", async (c) => {
  let uri:string = c.req.queries("url")[0];
  let duration:number = c.req.queries("dur")[0];
  if (!Number(duration) || duration <= 0 || uri.length === 0 || uri.startsWith('"') || !uri.startsWith("https://")) {
    return c.json(
      {
        queries: {
          errors: `${uri.startsWith('"') || !uri.startsWith("https://") ? "invalid URL" : 
            duration<=0 || !Number(duration) ? "duration requierd " : "uri requierd"
          }`,
        },
      },
      400
    );
  } else {
    const group:string[] = searchURL(uri);
    const idconstractor:string|undefined=btoa(group[2]).split("").reverse().join("").replace(/\=*/gi,'')
    const val = {
      id: `${
        group[2] && group[2]!=="/"
          ? `${group[2].length>15 ? idconstractor.substring(Math.floor(idconstractor.length/2),Math.floor(idconstractor.length/2)+6): idconstractor.substring(0,6)}`
          : btoa(group[1].replace(/\=*/gi,'')).substring(0, 6)
      }`,
      site: `${group[2] ? btoa(group[1] + group[2]) : btoa(group[1])}`,
    };
    const check: string = await redis.get(val.id);
    if (check) {
      return c.json({ url: `${Deno.env.get("HOST") + val.id}` });
    } else {
      await redis.setex(val.id, duration, val.site);
      return c.json({ url: `${Deno.env.get("HOST") + val.id}` });
      
    }
  }
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const mod = searchID(id);
  const qury = await redis.get(mod["0"]);
  if (qury) {
    return c.redirect(`https://${atob(qury)}`, 301);
  } else {
    return c.text("Not Found");
  }
});

serve(app.fetch);