import Koa from "koa";
import router from "./routes";

const cors = require('@koa/cors');
const bodyparser = require('koa-bodyparser');
const koa = new Koa();

koa.use(bodyparser());
koa.use(cors());
koa.use(router.routes());

koa.listen(3003);

