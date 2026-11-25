# AWS deployment boundary

Terraform under `terraform/` defines a configurable AWS foundation: VPC/subnets/security groups, encrypted private RDS PostgreSQL, encrypted/versioned S3, ECS cluster, KMS key, CloudWatch log group, Secrets Manager placeholders and least-privilege task/execution IAM roles.

RDS manages its master password in Secrets Manager; Terraform does not accept a plaintext database password. The application secret is an empty reserved secret resource and must be populated through an approved rotation process before any ECS task references it. No secret values are committed.

It does **not** create an application ECS service, public load balancer, NAT gateway, DNS, WAF or live deployment. RDS is private. ECS task placement and ingress are intentionally left for the deployment architecture.

## Safe workflow

1. Install Terraform >= 1.6 and configure an explicitly selected AWS account/profile.
2. Copy `terraform.tfvars.example` to a local ignored `terraform.tfvars`; review region, names, CIDRs, Multi-AZ, retention and deletion protection.
3. Run `terraform init`, `terraform fmt -check -recursive`, `terraform validate`, then inspect `terraform plan`.
4. Do not run `terraform apply` until account, cost, IAM, networking, backup restore, encryption and security review are approved.

State must be stored remotely with encryption, versioning and locking before team/production use. Never commit state, tfvars, credentials or secrets.
