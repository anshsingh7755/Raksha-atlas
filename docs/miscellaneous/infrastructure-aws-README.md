# AWS infrastructure — deployment foundation

## 1. What is this folder?

This folder contains Terraform code that describes a possible AWS environment for Raksha Atlas.

Terraform is an infrastructure-as-code tool. Instead of creating cloud resources by clicking through pages, you describe the desired resources in files and ask Terraform to prepare a plan.

**These files do not prove that AWS resources have been created.** The repository contains a foundation; deployment and production approval are separate steps.

## 2. Resources described

The Terraform configuration provides a foundation for:
- VPC, subnets and security groups for network separation.
- Private RDS PostgreSQL.
- Encrypted and versioned S3 storage.
- ECS cluster for container workloads.
- KMS encryption key.
- CloudWatch log group.
- Secrets Manager placeholders.
- IAM roles for ECS task execution and application tasks.

The configuration intentionally does not create a complete public application deployment. It does not currently provide the full application ECS service, public load balancer, NAT gateway, DNS, WAF or live release setup.

## 3. Secrets and database password

RDS manages its master password through Secrets Manager. Terraform should not receive a plaintext database password in a committed variable file.

The reserved application secret must be populated through an approved process before an application task uses it. Do not put secret values in Terraform files, `terraform.tfvars`, GitHub commits or chat messages.

## 4. Safe Terraform workflow

Use an explicitly selected non-production AWS account/profile.

1. Install Terraform version 1.6 or newer.
2. Change into the Terraform folder.
3. Copy `terraform.tfvars.example` to a local ignored `terraform.tfvars`.
4. Review region, resource names, CIDR ranges, database settings, retention and deletion protection.
5. Initialize providers.
6. Format and validate the configuration.
7. Create and inspect a plan.
8. Stop for review before applying anything.

Typical commands:

```bash
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan
```

Do not run `terraform apply` until account ownership, cost, IAM permissions, networking, encryption, backups, restore testing and security have been approved.

## 5. Terraform state

Terraform state records which real cloud resources are managed by the configuration. Losing or exposing state can cause serious problems.

Before team or production use:
- Store state remotely.
- Enable encryption and versioning.
- Use state locking.
- Restrict access to approved operators.
- Back up state.
- Never commit `*.tfstate` files or secrets.

## 6. Deployment boundary

The initial AWS direction is ECS/Fargate. Kubernetes/EKS is not required for the first deployment.

Before a real release, the project still needs a reviewed application service, network ingress, DNS/TLS, secrets, health checks, logs, backups, scaling and rollback configuration. Follow the roadmap and deployment runbooks rather than assuming the Terraform foundation is production-ready.# AWS deployment boundary

Terraform under `terraform/` defines a configurable AWS foundation: VPC/subnets/security groups, encrypted private RDS PostgreSQL, encrypted/versioned S3, ECS cluster, KMS key, CloudWatch log group, Secrets Manager placeholders and least-privilege task/execution IAM roles.

RDS manages its master password in Secrets Manager; Terraform does not accept a plaintext database password. The application secret is an empty reserved secret resource and must be populated through an approved rotation process before any ECS task references it. No secret values are committed.

It does **not** create an application ECS service, public load balancer, NAT gateway, DNS, WAF or live deployment. RDS is private. ECS task placement and ingress are intentionally left for the deployment architecture.

## Safe workflow

1. Install Terraform >= 1.6 and configure an explicitly selected AWS account/profile.
2. Copy `terraform.tfvars.example` to a local ignored `terraform.tfvars`; review region, names, CIDRs, Multi-AZ, retention and deletion protection.
3. Run `terraform init`, `terraform fmt -check -recursive`, `terraform validate`, then inspect `terraform plan`.
4. Do not run `terraform apply` until account, cost, IAM, networking, backup restore, encryption and security review are approved.

State must be stored remotely with encryption, versioning and locking before team/production use. Never commit state, tfvars, credentials or secrets.
