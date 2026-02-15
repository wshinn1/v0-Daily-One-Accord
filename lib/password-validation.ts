export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export interface PasswordRequirements {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
}

/**
 * Validates a password against security requirements
 * @param password - The password to validate
 * @param requirements - Optional custom requirements (defaults to DEFAULT_PASSWORD_REQUIREMENTS)
 * @returns PasswordValidationResult with isValid flag and array of error messages
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS,
): PasswordValidationResult {
  const errors: string[] = []

  if (!password || password.trim().length === 0) {
    return {
      isValid: false,
      errors: ["Password is required"],
    }
  }

  const trimmedPassword = password.trim()

  // Check minimum length
  if (trimmedPassword.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`)
  }

  // Check for uppercase letters
  if (requirements.requireUppercase && !/[A-Z]/.test(trimmedPassword)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  // Check for lowercase letters
  if (requirements.requireLowercase && !/[a-z]/.test(trimmedPassword)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  // Check for numbers
  if (requirements.requireNumbers && !/[0-9]/.test(trimmedPassword)) {
    errors.push("Password must contain at least one number")
  }

  // Check for special characters
  if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmedPassword)) {
    errors.push("Password must contain at least one special character (!@#$%^&*()_+-=[]{}...)")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Generates a secure random password that meets all requirements
 * @param length - Length of the password (default: 16)
 * @returns A secure random password
 */
export function generateSecurePassword(length = 16): string {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ" // Removed I, O for clarity
  const lowercase = "abcdefghjkmnpqrstuvwxyz" // Removed i, l, o for clarity
  const numbers = "23456789" // Removed 0, 1 for clarity
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  const allChars = uppercase + lowercase + numbers + symbols

  // Ensure at least one of each required character type
  let password = ""
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password to avoid predictable patterns
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

/**
 * Gets a human-readable description of password requirements
 * @param requirements - The password requirements
 * @returns A formatted string describing the requirements
 */
export function getPasswordRequirementsText(
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS,
): string {
  const parts: string[] = []

  parts.push(`at least ${requirements.minLength} characters`)

  if (requirements.requireUppercase) parts.push("one uppercase letter")
  if (requirements.requireLowercase) parts.push("one lowercase letter")
  if (requirements.requireNumbers) parts.push("one number")
  if (requirements.requireSpecialChars) parts.push("one special character")

  return `Password must contain ${parts.join(", ")}.`
}
