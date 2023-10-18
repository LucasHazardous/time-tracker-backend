export const port = 8080;
export const minPasswordLength = 4;

export const adminUsername = "main_admin";
export const adminPassword = "nexus-time-tracker";

export const requestsTimeFrame = 30 * 60000;
export const maxRequestsPerTimeFrame = 100;

export const session_ttl = 60 * 60 * 24 * 2;

enum ErrorMsg {
    authorizationErrorMsg = 'Authorization failed',
    authenticationErrorMsg = 'Authentication failed',
    userExistsErrorMsg = 'User already exists',
    accessDeniedErrorMsg = 'Access denied'
}

export {
    ErrorMsg
}
