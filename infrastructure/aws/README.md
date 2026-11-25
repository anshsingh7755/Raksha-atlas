# AWS deployment boundary

Terraform in this directory defines a configurable, additive AWS foundation: VPC/subnets/security groups, encrypted private RDS PostgreSQL, encrypted S3 bucket, ECS cluster and least-privilege task/execution IAM roles.

It does **not** create an application ECS service, public load balancer, NAT gateway, DNS, WAF, production secrets, or a live deployment. Those require approved container image URIs, identity/network decisions, budget review and the Phase 10 release gate. RDS is private; ECS task placement and ingress are intentionally left for deployment design.

## Safe workflow

1. Install Terraform >= 1.6 and configure an explicitly selected AWS account/profile.
2. Copy `terraform.tfvars.example` to a local ignored `terraform.tfvars`; set unique names, region and CIDR ranges.
3. Run `terraform init`, `terraform fmt -check`, `terraform validate`, then inspect `terraform plan`.
4. Do not run `terraform apply` until account, cost, IAM, networking, backup, encryption and security review are approved.

State must be stored remotely with encryption, versioning and locking before team/production use. Never commit state, tfvars, credentials or secrets.
