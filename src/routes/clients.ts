import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { Schedule } from "../modules/db";
import moment from "moment";

export async function clientRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  fastify.get("/", async (request, reply) => {
    return await fastify.db.all(`SELECT * FROM clients`);
  });

  fastify.put<{ Params: { scheduleId: string; clientId: string } }>(
    "/reserve/:scheduleId/:clientId",
    async (request, reply) => {
      const schedule = await fastify.db.get<Schedule>(
        `SELECT * FROM provider_schedule WHERE id=${request.params.scheduleId}`
      );

      if (!schedule) return reply.code(400).send({ msg: "Wrong res ID" });

      // Don't allow reservation if it's already booked or within last 30 minutes
      const today = moment();
      const scheduleDate = moment(`${schedule.date}T${schedule.time_slot}`);
      const bookedAt =
        schedule.booked_at === "NULL"
          ? moment().subtract(1, "week")
          : moment(schedule.booked_at);

      if (schedule.confirmed || today.diff(bookedAt, "minutes") < 30) {
        return reply.code(400).send({ msg: "Not allowed" });
      }

      // Reservations must be made at least 24 hours in advance
      if (scheduleDate.diff(today, "hour") < 24) {
        return reply
          .code(400)
          .send({ msg: "Can only schedule 24 hours in advance" });
      }

      // Update the record to reflect booked at time and booked by
      await fastify.db.exec(`UPDATE provider_schedule
        SET booked_by = ${request.params.clientId},
            booked_at = DATETIME('now')
        WHERE id = ${request.params.scheduleId};
        `);

      return { msg: `Booked for schedule with ID ${schedule.id}` };
    }
  );

  fastify.put<{ Params: { scheduleId: string; clientId: string } }>(
    "/confirm/:scheduleId/:clientId",
    async (request, reply) => {
      // Only allow confirm by the same client and if not confirmed
      const schedule = await fastify.db.get(
        `SELECT * FROM provider_schedule
            WHERE id=${request.params.scheduleId}
            AND booked_at IS NOT NULL
            AND booked_by = ${request.params.clientId}
            AND confirmed=0
            `
      );

      if (!schedule) {
        request.log.info(
          `Schedule with id ${request.params.scheduleId} not found`
        );
        return reply.code(400).send({ msg: "Not allowed to confirm" });
      }

      // If passed 30 minutes don't allow to confirm
      const today = moment();
      const bookedAt = moment(schedule.booked_at);
      if (today.diff(bookedAt, "minute") > 30) {
        return reply.code(400).send({ msg: "Over 30 minutes" });
      }

      //Update the record
      await fastify.db.exec(
        `UPDATE provider_schedule
        SET confirmed = 1
        WHERE id = ${request.params.scheduleId};
        `
      );

      return { msg: `Confirmed booking for schedule ${schedule.id}` };
    }
  );
}
