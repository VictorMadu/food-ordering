generate-client-sdk:
	curl -s http://localhost:$(PORT)/docs-yaml --output tmp/sdk/api.yaml
	docker run --rm -v $(PWD)/tmp/sdk:/local openapitools/openapi-generator-cli generate -i /local/api.yaml -g typescript-axios -o /local --skip-validate-spec

.PHONY: generate-client-sdk

# PORT=8080 make generate-client-sdk