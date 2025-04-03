# VPM Latest Version Listing Action
  
Generate a JSON list of the latest versions for specified VPM packages using GitHub Actions.

## Usage
Add the following to any workflow
```diff
name: Build Repo Listing

on: 
  workflow_dispatch:
  push:
    branches: main
    paths: config.json

jobs:
  build:
    runs-on: ubuntu-latest
    name: Build
    steps:
      - name: Checkout
        uses: actions/checkout@v4

+      - name: Build Latest Version Listing
+        uses: yukineko-works/vpm-latest-version-listing-action@v1
+        with:
+          config: config.json
+          token: ${{ secrets.GITHUB_TOKEN }}
```

## Setting


## Property

Property | Type | Default | Required | Description
--- | --- | --- | --- | ---
config | string | | Yes | Path to config.json
output | string | `latest-version.json` | No | Path to output json
token | string | | Yes | Github token

## License
MIT License