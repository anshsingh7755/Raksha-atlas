variable "aws_region" {
  description = "AWS region for the foundation."
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Deployment environment tag."
  type        = string
  default     = "development"
}

variable "name_prefix" {
  description = "Lowercase unique prefix used for named AWS resources."
  type        = string
  default     = "raksha-atlas-dev"
}

variable "vpc_cidr" {
  type    = string
  default = "10.40.0.0/16"
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.40.1.0/24", "10.40.2.0/24"]
}

variable "database_subnet_cidrs" {
  type    = list(string)
  default = ["10.40.11.0/24", "10.40.12.0/24"]
}

variable "database_name" {
  type    = string
  default = "raksha_atlas"
}

variable "database_username" {
  type    = string
  default = "raksha"
}

variable "database_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "database_multi_az" {
  type    = bool
  default = false
}

variable "database_deletion_protection" {
  type    = bool
  default = true
}
\nvariable "database_backup_retention_days" {
  description = "Automated RDS backup retention in days."
  type        = number
  default     = 7
  validation {
    condition     = var.database_backup_retention_days >= 7 && var.database_backup_retention_days <= 35
    error_message = "Use at least 7 and at most 35 days of automated backup retention."
  }
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days."
  type        = number
  default     = 30
}
