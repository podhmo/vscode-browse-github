check:
	npx tsx ./src/resolve.ts

bundle:
	npm run vscode:prepublish

build:
	npx vsce package
