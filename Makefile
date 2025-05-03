swagger.generate:
	curl -s http://localhost:$(SERVER_PORT)/docs-yaml --output tmp/sdk/api.yaml
	docker run --rm -v $(PWD)/tmp/sdk:/local openapitools/openapi-generator-cli generate -i /local/api.yaml -g typescript-axios -o /local --skip-validate-spec

app.run.dev:
	docker compose -f devops/dev/docker-compose.yml -p food-ordering up

app.run.test:
	mkdir -p tmp/sdk
	$(MAKE) generate-client-sdk
	docker compose -f devops/test/docker-compose.yml -p food-ordering up --abort-on-container-exit 

app.dev.setup.external:
	docker compose -p "food-delivery" -f devops/local-dev/docker-compose.yml up

app.dev.teardown.external:
	docker compose -p "food-delivery" down --volumes --remove-orphans
