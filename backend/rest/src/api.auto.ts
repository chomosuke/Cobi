/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/account/login": {
    post: {
      responses: {
        /** logged in */
        200: {
          content: {
            "text/plain": string;
          };
        };
        /** unauthorized */
        401: unknown;
      };
      requestBody: components["requestBodies"]["usernamePassword"];
    };
  };
  "/account/register": {
    post: {
      responses: {
        /** register success and logged in */
        200: {
          content: {
            "text/plain": string;
          };
        };
        /** username taken */
        409: unknown;
      };
      requestBody: components["requestBodies"]["usernamePassword"];
    };
  };
  "/account": {
    /** get info for the logged in account */
    get: {
      responses: {
        /** info for the logged in account */
        200: {
          content: {
            "application/json": {
              username: string;
            };
          };
        };
        /** unauthorized */
        401: unknown;
      };
    };
    /** change username or password */
    patch: {
      responses: {
        /** username or password changed successfully */
        200: unknown;
        /** unauthorized */
        401: unknown;
        /** username taken */
        409: unknown;
      };
      requestBody: {
        content: {
          "application/json": {
            /** Format: password */
            currentPassword: string;
            username?: string;
            /** Format: password */
            password?: string;
          };
        };
      };
    };
  };
  "/account/search": {
    /** search for userId with username */
    get: {
      parameters: {
        query: {
          username: string;
        };
      };
      responses: {
        /** found userIds presumably ranked */
        200: {
          content: {
            "application/json": string[];
          };
        };
      };
    };
  };
  "/account/{userId}": {
    /** get info for the account for user with userId */
    get: {
      parameters: {
        path: {
          userId: string;
        };
      };
      responses: {
        /** info for the logged in account */
        200: {
          content: {
            "application/json": {
              username: string;
            };
          };
        };
        /** user not found */
        404: unknown;
      };
    };
  };
  "/account/profile-picture": {
    /** get profile picture for user with userId */
    get: {
      responses: {
        /** imageUrl */
        200: {
          content: {
            "text/plain": string;
          };
        };
      };
    };
    /** set profile picture for current user */
    put: {
      responses: {
        /** profile picture updated */
        200: unknown;
        /** unauthorized */
        401: unknown;
      };
      /** imageUrl */
      requestBody: {
        content: {
          "text/plain": string;
        };
      };
    };
    /** remove profile picture for current user */
    delete: {
      responses: {
        /** profile picture deleted */
        200: unknown;
        /** profile picture doesn't exist */
        204: never;
        /** unauthorized */
        401: unknown;
      };
    };
  };
  "/account/profile-picture/{userId}": {
    /** get profile picture for user with userId */
    get: {
      parameters: {
        path: {
          userId: string;
        };
      };
      responses: {
        /** imageUrl */
        200: {
          content: {
            "text/plain": string;
          };
        };
        /** user not found */
        404: unknown;
      };
    };
  };
  "/contacts": {
    /** get list of contact for the current user */
    get: {
      responses: {
        /** list of contact's userId */
        200: {
          content: {
            "application/json": string[];
          };
        };
        /** unauthorized */
        401: unknown;
      };
    };
  };
  "/contact/{userId}": {
    /** get the information of a contact */
    get: {
      parameters: {
        path: {
          userId: string;
        };
      };
      responses: {
        /** information of a contact */
        200: {
          content: {
            "application/json": {
              chatId: string;
            };
          };
        };
        /** unauthorized */
        401: unknown;
        /** contact not found */
        404: unknown;
      };
    };
    /** delete contact for the current user */
    delete: {
      parameters: {
        path: {
          userId: string;
        };
      };
      responses: {
        /** contact deleted */
        200: unknown;
        /** contact with userId does not exist */
        204: never;
        /** unauthorized */
        401: unknown;
      };
    };
  };
  "/contact/block": {
    /** block a user */
    post: {
      responses: {
        /** invite sent */
        200: unknown;
        /** unauthorized */
        401: unknown;
        /** userId does not exist */
        404: unknown;
      };
      /** userId */
      requestBody: {
        content: {
          "text/plain": string;
        };
      };
    };
  };
  "/contact/invites/outgoing": {
    /** get all outgoing invite for the current user */
    get: {
      responses: {
        /** list of userId the current user has invited */
        200: {
          content: {
            "application/json": string[];
          };
        };
        /** unauthorized */
        401: unknown;
      };
    };
  };
  "/contact/invite/outgoing": {
    /** invite another user to be contact */
    post: {
      responses: {
        /** invite sent */
        200: unknown;
        /** unauthorized */
        401: unknown;
        /** userId does not exist */
        404: unknown;
      };
      /** userId */
      requestBody: {
        content: {
          "text/plain": string;
        };
      };
    };
  };
  "/contact/invites/incoming": {
    /** get all incoming invite for the current user */
    get: {
      responses: {
        /** list of userId that sent the current user a invite */
        200: {
          content: {
            "application/json": string[];
          };
        };
        /** unauthorized */
        401: unknown;
      };
    };
  };
  "/contact/invite/incoming/{userId}": {
    /** accept or reject an invite */
    post: {
      parameters: {
        path: {
          userId: string;
        };
      };
      responses: {
        /** invite accepted/rejected */
        200: unknown;
        /** unauthorized */
        401: unknown;
        /** invite with userId does not exist */
        404: unknown;
      };
      requestBody: {
        content: {
          "text/plain": string;
        };
      };
    };
  };
  "/messages/{chatId}/older-than/{messageId}": {
    /** get the newest 256 messages older than message with messageId */
    get: {
      parameters: {
        path: {
          chatId: string;
          messageId: string;
        };
      };
      responses: {
        /** messageIds */
        200: {
          content: {
            "application/json": string[];
          };
        };
        /** unauthorized */
        401: unknown;
        /** messageId or chatId not found */
        404: unknown;
      };
    };
  };
  "/messages/{chatId}/newer-than/{messageId}": {
    /** get the oldest 256 messages newer than message with messageId */
    get: {
      parameters: {
        path: {
          chatId: string;
          messageId: string;
        };
      };
      responses: {
        /** messageIds */
        200: {
          content: {
            "application/json": string[];
          };
        };
        /** unauthorized */
        401: unknown;
        /** messageId or chatId not found */
        404: unknown;
      };
    };
  };
  "/messages/{chatId}/newest": {
    /** get the newest 256 messages for user */
    get: {
      parameters: {
        path: {
          chatId: string;
        };
      };
      responses: {
        /** messageIds */
        200: {
          content: {
            "application/json": string[];
          };
        };
        /** unauthorized */
        401: unknown;
        /** chatId not found */
        404: unknown;
      };
    };
  };
  "/message/{chatId}": {
    /** sending a message */
    post: {
      parameters: {
        path: {
          chatId: string;
        };
      };
      responses: {
        /** message sent */
        200: {
          content: {
            "text/plain": string;
          };
        };
        /** unauthorized */
        401: unknown;
        /** chatId not found */
        404: unknown;
      };
      requestBody: {
        content: {
          "application/json": {
            /** @enum {string} */
            type: "text" | "image" | "video" | "file";
            /** @description for image, video & file it's the url */
            content: string | string[];
          };
        };
      };
    };
  };
  "/message/{chatId}/{messageId}": {
    /** get the content of the message */
    get: {
      parameters: {
        path: {
          messageId: string;
          chatId: string;
        };
      };
      responses: {
        /** message content */
        200: {
          content: {
            "application/json": {
              /** Format: date-time */
              timeSent: string;
              /** Format: date-time */
              timeRecieved: string;
              /** Format: date-time */
              timeRead: string;
              /** @enum {string} */
              type: "text" | "image" | "video" | "file";
              /** @description for image, video & file it's the url */
              content: string | string[];
            };
          };
        };
        /** unauthorized */
        401: unknown;
        /** messageId or chatId not found */
        404: unknown;
      };
    };
  };
}

export interface components {
  requestBodies: {
    usernamePassword: {
      content: {
        "application/json": {
          username: string;
          /** Format: password */
          password: string;
        };
      };
    };
  };
}

export interface operations {}

export interface external {}
