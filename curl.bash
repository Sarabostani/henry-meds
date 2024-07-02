curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"providerId": 1, "date": "2024-07-03", "start": "8:00", "end": "16:00"}' \
  localhost:3000/api/providers/schedule

curl localhost:3000/api/providers/schedule/1
curl localhost:3000/api/providers
curl localhost:3000/api/clients
curl -X PUT localhost:3000/api/clients/reserve/25/1
curl -X PUT localhost:3000/api/clients/confirm/25/1
