# Henry Meds Coding Exercise

By Houman Sarabostani
Jul 1, 2024

## Setup
This web server is created in Node and TypeScript. To begin, `node` and `npm` should be 
installed on the host machine to run this application

After installing node, navigate to the root directory in the terminal and run the following

``` 
npm install
npm run dev
```

## The web app
This web application uses `SQLite` in memory to use as a database to mimic a production environment.
Upon initialization of the application, the tables used for this task are created and seeded with random entries.

## Data model
The entire data model consists of 3 tables, `providers`, `clients`, and `provider_schedules`.

The table `provider_schedule` gets populated when a provider posts an availability time.
```json
{
    "id": "string",
    "provider_id": "int",
    "booked_by": "int",
    "booked_at": "date_time" ,
    "date": "date",
    "time_slot": "time(HH:mm)",
    "confirmed": "boolean"
}
```

## Endpoint call examples

```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"providerId": 1, "date": "2024-07-03", "start": "8:00", "end": "16:00"}' \
  localhost:3000/api/providers/schedule

curl localhost:3000/api/providers/schedule/1
curl localhost:3000/api/providers
curl localhost:3000/api/clients
curl -X PUT localhost:3000/api/clients/reserve/25/1
curl -X PUT localhost:3000/api/clients/confirm/25/1
```
