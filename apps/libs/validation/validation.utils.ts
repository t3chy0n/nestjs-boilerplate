import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationException } from '@libs/validation/exceptions/validation.exception';

export function validateValue(value, type, ErrorClass = ValidationException) {
  if (['object'].includes(typeof value)) {
    validateObjectValue(value, type, ErrorClass);
  } else {
    validatePrimitiveValue(value, type, ErrorClass);
  }
}

export function validatePrimitiveValue(value, type, ErrorClass) {
  const match = (typeof value).toLowerCase() === type.name.toLowerCase();
  if (!match) {
    throw new ErrorClass(
      `Validation failed. Value expected type to be ${type.name} type!`,
    );
  }
}

function validateObjectValue(value, type, ErrorClass) {
  const e = validateSync(plainToInstance(type, value));
  if (e.length > 0) {
    throw new ErrorClass(e);
  }
}
