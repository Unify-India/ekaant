### \#\#\# Ignoring Local Environment Changes

After adding your local API keys or other **secrets** to `src/environments/environment.ts`, you **must** tell Git to ignore changes to this file. This is a crucial step to prevent your personal keys from ever being accidentally committed to the repository. Run the following command from the project root:

```bash
git update-index --assume-unchanged src/environments/environment.ts
```

This command flags the file for your local Git instance, and you only need to run it once. If you ever need to commit an intentional change to this file's template, you can re-enable tracking with `--no-assume-unchanged`.

## Commit Message Guidelines

### Commit Message Format

Each commit message consists of a **header**, an optional **body**, and an optional **footer**:

```
<type>: <subject>

<body>

<footer>
```

- The **header** is mandatory & must be in all lowercase.
- The **body** & **footer** can have both uppercase & lowercase letters.
- Each line should be under 100 characters.

#### Examples

```
docs: update api response sheet
fix: modify permissions for user
```

```
feat: update auth token generation in helper class

Updated the Implementation of JWT token generation in the JWTHelper class, including role-based claims.
Updated token expiration and signing key handling for better security.

Closes #123
```

### Reverting a Commit

If reverting a commit, use the following format:

```
revert: <header of reverted commit>

This reverts commit <hash>.
```

### Commit Types

- **build**: Changes to the build system or dependencies
- **chore**: Non-production code updates
- **ci**: Continuous Integration changes
- **docs**: Documentation updates
- **feat**: New features
- **fix**: Bug fixes
- **perf**: Performance improvements
- **refactor**: Code restructuring without changing behavior
- **style**: Formatting changes (whitespace, semi-colons, etc.)
- **test**: Adding or modifying tests
- **sample**: Sample code changes

### Commit Subject

- Use the imperative, present tense ("change" not "changed").
- Do not end with a period (`.`).

### Commit Body

- Use the imperative, present tense.
- Explain the reason for the change and its impact.

### Commit Footer

- Use for breaking changes (`BREAKING CHANGE:`) and Reference `Pinestem tasks/bugs` (e.g. Fixes #INRT-2723).

### Merge Request Title Format

```
docs: add request response document
```

```
fix: fix ticket sorting bug
```

```
feat: allow multiple owners for an organisation
```
