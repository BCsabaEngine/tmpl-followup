import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const VALIDATION_ERROR_MAX_COUNT = 5;
const ajv = new Ajv({
  coerceTypes: true,
  useDefaults: true,
  removeAdditional: 'all',
  strict: true,
  allErrors: true,
  keywords: ['kind', 'modifier', 'instanceOf'],
});
addFormats(ajv);

export const validateObject = <T>(
  schema: Record<string, any>,
  object: unknown,
): T => {
  const isValid = ajv.validate(schema, object);
  if (isValid) return object as T;

  let message = 'Validation error';
  if (ajv.errors && ajv.errors.length > 0) {
    const errorStrings = ajv.errors.map((error) => [error.instancePath, error.message].filter(Boolean).join(' '));
    const errorUniqueStrings = errorStrings.filter((currentError, index) => errorStrings.indexOf(currentError) === index);
    const errorUniqueStringsCount: number = errorUniqueStrings.length
    message = `Validation errors(${errorUniqueStringsCount}): `;
    message += errorUniqueStrings.slice(0, VALIDATION_ERROR_MAX_COUNT).join(', ');
  }
  const error = new Error(message);
  Object.assign(error, { validationErrors: ajv.errors });
  throw error;
};