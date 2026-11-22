# AWS migration notes

Target deployment:

```text
ECS Fargate  → application containers
RDS          → PostgreSQL
S3           → documents and raw data
Bedrock      → managed AI models
CloudWatch   → logs and alarms
Secrets Manager → credentials
```

Terraform and EKS should be introduced only after the containerized services
have stable health checks and configuration contracts.
