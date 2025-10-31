  # Obtener VPC por defecto de AWS
  data "aws_vpc" "default" {
    default = true
  }

  # Obtener todas las subnets de la VPC por defecto
  data "aws_subnets" "default" {
    filter {
      name   = "vpc-id"
      values = [data.aws_vpc.default.id]
    }
  }

  # Obtener información detallada de cada subnet
  data "aws_subnet" "default" {
    for_each = toset(data.aws_subnets.default.ids)
    id       = each.value
  }
