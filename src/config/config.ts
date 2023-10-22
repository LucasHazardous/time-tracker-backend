export const port = 8080;
export const minPasswordLength = 4;

export const adminUsername = "main_admin";
export const adminPassword = "nexus-time-tracker";

export const requestsTimeFrame = 30 * 60000;
export const maxRequestsPerTimeFrame = 100;

export const sessionTTL = 60 * 60 * 24 * 2;

enum ErrorMsg {
    authorizationErrorMsg = 'Authorization failed',
    authenticationErrorMsg = 'Authentication failed',
    alreadyExistsErrorMsg = 'Object interferes with other',
    accessDeniedErrorMsg = 'Access denied',
    notFound = 'Target not found',
    unprocessableEntity = 'Unprocessable Entity'
}

export {
    ErrorMsg
}
