import { serve } from "https://deno.land/std/http/server.ts";
import { Hono } from "https://deno.land/x/hono/mod.ts";
import { connect } from "https://deno.land/x/redis@v0.28.0/redis.ts";
import { parseURL } from "https://deno.land/x/redis@v0.28.0/redis.ts";
import { cors } from "https://deno.land/x/hono/middleware.ts";

function makeid(length: number): string {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result.toString();
}
function searchID(input: string) {
  const regex = /^([a-zA-z-0-9]*)/gm;
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
    origin: "https://smrf.netlify.app",
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
  })
);

app.all("/api", async (c) => {
  const uri = c.req.queries("url");
  const duration = c.req.queries("dur");
  if (duration.length === 0 || uri.length === 0) {
    return c.json(
      {
        queries: {
          errors: `${
            duration.length === 0 ? "duration requierd " : "uri requierd"
          }`,
        },
      },
      400
    );
  } else {
    const group = searchURL(uri);
    const val = {
      id: `${
        group[2]
          ? btoa(group[2].slice(-1)).substring(0, 6)
          : btoa(group[1].slice(-1)).substring(0, 6)
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
