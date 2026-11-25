# GitHub Actions — automated repository workflows

## What is GitHub Actions?

GitHub Actions runs automated jobs when code is pushed, a pull request is opened or a workflow is started manually.

A workflow is a YAML file that tells GitHub which commands to run. It can check code, run tests, scan for security problems or deploy an application.

## Workflows in this folder

| File | Purpose |
|---|---|
| `validate.yml` | Runs the repository's automated validation checks. |
| `codeql.yml` | Runs CodeQL security analysis. |
| `deploy-ecs.yml` | Provides the controlled AWS ECS deployment path. |

## Typical validation flow

```text
Code is pushed or a pull request opens
              |
              v
GitHub starts the configured workflow
              |
              v
Install required tools and dependencies
              |
              v
Run build, tests and configuration checks
              |
              v
Show success or failure in the commit / pull request
```

The exact steps are defined in each YAML file. Read that file before changing the workflow.

## Deployment warning

The existence of `deploy-ecs.yml` does not mean AWS deployment has happened or is ready. The AWS account, ECS service, task definition, secrets and approvals must be configured first.

## Safe changes

- Store credentials in GitHub Actions secrets or an approved secret manager.
- Never hardcode passwords or tokens in workflow YAML.
- Use least-privilege permissions.
- Keep validation steps aligned with the actual project scripts.
- Do not remove a failing check until the failure is understood.
- Confirm workflow results; a commit alone is not proof that CI passed.
