generate-client-sdk:
	curl -s http://localhost:$(SERVER_PORT)/docs-yaml --output tmp/sdk/api.yaml
	docker run --rm -v $(PWD)/tmp/sdk:/local openapitools/openapi-generator-cli generate -i /local/api.yaml -g typescript-axios -o /local --skip-validate-spec

.PHONY: generate-client-sdk

app-dev-run:
	docker compose -f devops/dev/docker-compose.yml -p food-ordering up

.PHONY: app-dev-run

app-test-run:
	mkdir -p tmp/sdk
	$(MAKE) generate-client-sdk
	docker compose -f devops/test/docker-compose.yml -p food-ordering up --abort-on-container-exit 

.PHONY: app-test-run