import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

router.get("/api/users", async (ctx) => {
  ctx.response.headers.set("Content-Type", "application/json");
  ctx.response.headers.set("Cache-Control", "max-age=300");
  const Data= await fetch('https://dummyjson.com/products')
  const res= await Data.json()
  ctx.response.body = {res};
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
