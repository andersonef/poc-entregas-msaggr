up:
	npm install
	docker compose -f dev-docker-compose.yml build
	docker compose -f dev-docker-compose.yml up -d
	docker exec poc-entregas-msaggr npx prisma generate
	docker exec poc-entregas-msaggr npx prisma db push

up-standalone:
	npm install
	docker compose -f dev-docker-compose-standalone.yml build
	docker compose -f dev-docker-compose-standalone.yml up -d
	docker exec poc-entregas-msaggr npx prisma generate
	docker exec poc-entregas-msaggr npx prisma db push

down:
	docker compose -f dev-docker-compose.yml down

bash:
	docker exec -it poc-entregas-msaggr bash

listen-logs:
	docker logs poc-entregas-msaggr --follow