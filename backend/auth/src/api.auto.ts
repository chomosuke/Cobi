/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/validate-token": {
    /** validate a token & return the userId */
    post: {
      responses: {
        /** success */
        200: {
          content: {
            "text/plain": number;
          };
        };
        /** failure */
        401: unknown;
      };
      requestBody: {
        content: {
          "text/plain": string;
        };
      };
    };
  };
  "/get-token": {
    /** validate userId & password and return a token. */
    post: {
      responses: {
        /** success */
        200: {
          content: {
            "text/plain": string;
          };
        };
        /** failure */
        401: unknown;
      };
      requestBody: {
        content: {
          "application/json": {
            userId: number;
            /** Format: password */
            password: string;
          };
        };
      };
    };
  };
  "/add-user": {
    /** add a userId-password combination */
    post: {
      responses: {
        /** success */
        200: {
          content: {
            "text/plain": number;
          };
        };
        /** userId too big */
        400: unknown;
      };
      requestBody: {
        content: {
          "application/json": {
            /** Format: password */
            password: string;
          };
        };
      };
    };
  };
  "/change-password": {
    /** change the password for a user */
    patch: {
      responses: {
        /** success */
        200: unknown;
        /** unauthenticated */
        401: unknown;
      };
      requestBody: {
        content: {
          "application/json": {
            userId: number;
            /** Format: password */
            currentPassword: string;
            /** Format: password */
            newPassword: string;
          };
        };
      };
    };
  };
}

export interface components {}

export interface operations {}

export interface external {}
