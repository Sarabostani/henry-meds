import fastify, { FastifyInstance } from "fastify";
import { clientRoutes } from "./routes/clients";
import dbPlugin from "./modules/db";
import { providerRoutes } from "./routes/providers";

const app = fastify({
  logger: true,
});

app.register(dbPlugin);

app.get("/", function (request, reply) {
  request.log.info("health check");
  reply.send({ msg: "alive" });
});

app.register(providerRoutes, { prefix: "/api/providers" });
app.register(clientRoutes, { prefix: "/api/clients" });

app.listen(
  {
    port: 3000,
    host: "localhost",
  },
  function (err, address) {
    if (err) {
      app.log.error(err);
    }
  }
);
export { FastifyInstance };
