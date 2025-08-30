### \#\#\# Ignoring Local Environment Changes

After adding your local API keys or other **secrets** to `src/environments/environment.ts`, you **must** tell Git to ignore changes to this file. This is a crucial step to prevent your personal keys from ever being accidentally committed to the repository. Run the following command from the project root:

```bash
git update-index --assume-unchanged src/environments/environment.ts
```

This command flags the file for your local Git instance, and you only need to run it once. If you ever need to commit an intentional change to this file's template, you can re-enable tracking with `--no-assume-unchanged`.