# GitHub Actions workflows

These workflows automate repository checks and controlled deployment tasks.

| Workflow | Purpose |
|---|---|
| `validate.yml` | Runs the project's automated validation checks. |
| `codeql.yml` | Runs CodeQL security analysis. |
| `deploy-ecs.yml` | Defines the manually controlled AWS ECS deployment path. |

A workflow file is not proof that a deployment has happened. The ECS workflow requires an approved and configured AWS environment. Keep secrets in GitHub Actions secrets or an approved secret manager; never hardcode credentials.

When changing build scripts, runtime paths or tests, check whether `validate.yml` needs to change. See the [run and deployment guide](../../docs/RUN-AND-DEPLOY.md).
