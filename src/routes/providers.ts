import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { divideTimeRange } from "./helpers";
import { Schedule } from "../modules/db";
import moment from "moment";

interface ProviderSchedule {
  providerId: string;
  date: string;
  start: string;
  end: string;
}

export async function providerRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  fastify.get("/", async (request, reply) => {
    return await fastify.db.all("SELECT * FROM providers");
  });
  fastify.get<{ Params: { providerId: string } }>(
    "/schedule/:providerId",
    async (request, reply) => {
      const schedules = await fastify.db.all<Schedule[]>(
        `SELECT ps.id, p.name, p.title, ps.date, ps.time_slot, ps.booked_at, 
        ps.booked_by, confirmed
        FROM provider_schedule ps
        LEFT JOIN providers AS p
        ON p.id = ps.provider_id
        WHERE provider_id=${request.params.providerId};`
      );

      return schedules;
    }
  );

  fastify.post<{ Body: ProviderSchedule }>(
    "/schedule",
    async (request, reply) => {
      const stmt = await fastify.db.prepare(
        `INSERT INTO provider_schedule (provider_id, booked_by, booked_at, date, time_slot, confirmed) VALUES(?, ?, ?, ?,? ,?)`
      );
      const intervals = divideTimeRange(request.body.start, request.body.end);
      try {
        for (const interval of intervals) {
          await stmt.run([
            `${request.body.providerId}`,
            `NULL`,
            `NULL`,
            `${request.body.date}`,
            `${interval}`,
            0,
          ]);
        }
      } catch (err) {
        return reply.code(400).send({ msg: "Failed to add the schedule" });
      }
      await stmt.finalize();
      return { msg: `Posted the schedule with ${intervals.length} time slots` };
    }
  );
}
