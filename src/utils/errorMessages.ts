import ErrorResponse from '../interfaces/ErrorResponse';

const missingFields = (fields: string[]): ErrorResponse => {
  return { message: `Missing required fields: ${fields.join(', ')}` };
};

const failedToFetch = (
  entity: string,
  stack?: string | unknown,
): ErrorResponse => {
  return { message: `Failed to fetch ${entity}`, stack: stack };
};

const failedToCreate = (
  entity: string,
  stack?: string | unknown,
): ErrorResponse => {
  return { message: `Failed to create ${entity}`, stack: stack };
};

const failedToUpdate = (
  entity: string,
  stack?: string | unknown,
): ErrorResponse => {
  return { message: `Failed to update ${entity}`, stack: stack };
};

// function failedToDelete(
const failedToDelete = (
  entity: string,
  stack?: string | unknown,
): ErrorResponse => {
  return { message: `Failed to delete ${entity}`, stack: stack };
};

const invalidRole = (role: string): ErrorResponse => {
  return { message: `Invalid role: ${role}` };
};

export {
  missingFields,
  failedToFetch,
  failedToCreate,
  failedToUpdate,
  failedToDelete,
  invalidRole,
};
