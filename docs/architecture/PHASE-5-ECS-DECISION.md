## Simple explanation

This document records the infrastructure decision for the first AWS container deployment.

The current decision is to start with ECS on Fargate rather than Kubernetes/EKS. ECS is simpler to operate for the current service size. Kubernetes should be considered only if real workload, team or platform needs justify the extra operational complexity.

This is an architecture decision, not proof that AWS resources have been deployed.

# Phase 5.10 — ECS first, EKS only when justified

## Decision

Use Amazon ECS on Fargate as the initial orchestration target. Do not add Kubernetes/EKS or Helm to the first production release.

## Rationale

- Current service count and deployment topology do not demonstrate a need for Kubernetes control-plane complexity.
- ECS integrates with IAM, VPC, CloudWatch, load balancers and task definitions.
- Fargate avoids worker-node management for the initial workload.
- A smaller operational surface reduces security, patching, observability and incident-response burden.
- Terraform defines an ECS foundation, but no application service is provisioned yet.

## Reconsider EKS only when evidence shows

- Multiple teams need independent cluster-level platform APIs and policy controls.
- Workloads need Kubernetes-specific operators, scheduling, service mesh or ecosystem integrations.
- Multi-tenant workload density or portability needs cannot be met economically with ECS.
- Measured ECS operational or cost constraints justify EKS control-plane and node-management overhead.
- A platform team can own upgrades, admission policies, network policy, RBAC, secrets, autoscaling and incident response.

## Required evidence before an EKS decision

Architecture decision record, cost comparison, threat model, staffing/on-call plan, workload compatibility matrix, Terraform/Helm proof of concept, observability parity, rollback plan and explicit approval. Do not operate parallel ECS and EKS production platforms without a defined business need.
