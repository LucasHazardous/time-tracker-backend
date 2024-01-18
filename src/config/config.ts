export const port = 8080;
export const minPasswordLength = 4;

export const secret_token: string = process.env.SALT!;

export const adminUsername = "main_admin";
export const adminPassword = "nexus-time-tracker";

export const requestsTimeFrame = 30 * 60000;
export const maxRequestsPerTimeFrame = 100;

export const sessionTTL = 60 * 60 * 24 * 2;

export const prismaAlreadyExistsError = 'P2002';
export const prismaNotFoundError = 'P2025';

export const allowedVacationCategories = [
    "wypoczynkowy",
    "rodzicielski",
    "szkoleniowy",
    "okolicznościowy"
];

export const allowedPresenceCategories = [
    "zdalnie",
    "w biurze"
];

interface JwtTokenPayload {
    id: string,
    admin: boolean
}

enum ErrorMsg {
    authorizationErrorMsg = 'Authorization failed',
    authenticationErrorMsg = 'Authentication failed',
    alreadyExistsErrorMsg = 'Object interferes with other',
    accessDeniedErrorMsg = 'Access denied',
    notFound = 'Target not found',
    unprocessableEntity = 'Unprocessable Entity'
}

export {
    ErrorMsg,
    JwtTokenPayload
}
