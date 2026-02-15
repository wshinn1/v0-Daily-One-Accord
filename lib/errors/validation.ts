import { ValidationError } from "./types"

export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === "") {
    throw new ValidationError(`${fieldName} is required`)
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format")
  }
}

export function validateLength(value: string, fieldName: string, min?: number, max?: number): void {
  if (min && value.length < min) {
    throw new ValidationError(`${fieldName} must be at least ${min} characters`)
  }
  if (max && value.length > max) {
    throw new ValidationError(`${fieldName} must be at most ${max} characters`)
  }
}

export function validateEnum<T>(value: T, allowedValues: T[], fieldName: string): void {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(", ")}`)
  }
}
