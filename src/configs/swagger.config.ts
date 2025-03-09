import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Notes API',
            version: '1.0.0',
            description: 'API documentation for the Notes API',
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC',
            },
        },
        servers: [
            {
                url: '/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Note: {
                    type: 'object',
                    required: ['title', 'content'],
                    properties: {
                        _id: { type: 'string', description: 'Note ID' },
                        title: { type: 'string', description: 'Note title' },
                        content: { type: 'string', description: 'Note content' },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array of tags (automatically converted to lowercase)'
                        },
                        owner: { type: 'string', description: 'User ID of the note owner' },
                        sharedWith: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array of user IDs with whom the note is shared'
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                User: {
                    type: 'object',
                    required: ['email', 'password', 'firstName', 'lastName'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'The unique identifier for the user',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'User password',
                        },
                        firstName: {
                            type: 'string',
                            description: 'User first name',
                        },
                        lastName: {
                            type: 'string',
                            description: 'User last name',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'The creation timestamp',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'The last update timestamp',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', default: false },
                        message: { type: 'string', description: 'Error message' },
                        error: { type: 'array', description: 'Error details' }
                    }
                },
                PaginationMeta: {
                    type: 'object',
                    properties: {
                        nextPage: { type: 'integer', description: 'Next page number' },
                        previousPage: { type: 'integer', description: 'Previous page number' },
                        currentPage: { type: 'integer', description: 'Current page number' },
                        pageLimit: { type: 'integer', description: 'Number of items per page' },
                        total: { type: 'integer', description: 'Total number of items' },
                        totalPages: { type: 'integer', description: 'Total number of pages' }
                    }
                },
                BaseResponse: {
                    type: 'object',
                    required: ['success', 'message'],
                    properties: {
                        code: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    },
                    example: {
                        code: 200,
                        success: true,
                        message: 'Operation successful'
                    }
                },
                PaginatedNotesResponse: {
                    type: 'object',
                    required: ['success', 'message', 'data', 'meta'],
                    properties: {
                        code: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Note' }
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                nextPage: { type: 'integer' },
                                previousPage: { type: 'integer' },
                                currentPage: { type: 'integer' },
                                pageLimit: { type: 'integer' },
                                total: { type: 'integer' },
                                totalPages: { type: 'integer' }
                            }
                        }
                    },
                    example: {
                        success: true,
                        message: 'Notes fetched successfully',
                        code: 200,
                        data: [{
                            _id: '507f1f77bcf86cd799439011',
                            title: 'Sample Note',
                            content: 'This is a sample note',
                            tags: ['sample'],
                            owner: '507f1f77bcf86cd799439012',
                            sharedWith: [],
                            createdAt: '2023-01-01T00:00:00.000Z',
                            updatedAt: '2023-01-01T00:00:00.000Z'
                        }],
                        meta: {
                            currentPage: 1,
                            pageLimit: 10,
                            total: 1,
                            totalPages: 1
                        }
                    }
                },
                SingleNoteResponse: {
                    type: 'object',
                    required: ['success', 'message', 'data'],
                    properties: {
                        code: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { $ref: '#/components/schemas/Note' }
                    },
                    example: {
                        success: true,
                        message: 'Note fetched successfully',
                        code: 200,
                        data: {
                            _id: '507f1f77bcf86cd799439011',
                            title: 'Sample Note',
                            content: 'This is a sample note',
                            tags: ['sample'],
                            owner: '507f1f77bcf86cd799439012',
                            sharedWith: [],
                            createdAt: '2023-01-01T00:00:00.000Z',
                            updatedAt: '2023-01-01T00:00:00.000Z'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    required: ['success', 'message'],
                    properties: {
                        code: { type: 'number' },
                        success: { type: 'boolean', default: false },
                        message: { type: 'string' }
                    },
                    example: {
                        success: false,
                        message: 'Invalid input',
                        code: 400
                    }
                },
                LoginResponse: {
                    type: 'object',
                    required: ['success', 'message', 'data'],
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            required: ['accessToken', 'refreshToken'],
                            properties: {
                                code: { type: 'number' },
                                accessToken: { type: 'string' },
                                refreshToken: { type: 'string' }
                            }
                        }
                    },
                    example: {
                        success: true,
                        message: 'Login successful',
                        code: 200,
                        data: {
                            accessToken: 'your_access_token',
                            refreshToken: 'your_refresh_token'
                        }
                    }
                },
                RefreshTokenResponse: {
                    type: 'object',
                    required: ['success', 'message', 'data'],
                    properties: {
                        code: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            required: ['accessToken'],
                            properties: {
                                accessToken: { type: 'string' }
                            }
                        }
                    },
                    example: {
                        success: true,
                        message: 'Token refreshed successfully',
                        code: 200,
                        data: { accessToken: 'your_access_token' }
                    }
                }
            },
        },
        paths: {
            '/auth/signup': {
                post: {
                    tags: ['Auth'],
                    summary: 'Register a new user',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password', 'firstName', 'lastName'],
                                    properties: {
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string', format: 'password' },
                                        firstName: { type: 'string' },
                                        lastName: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'User registered successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/BaseResponse' }
                                }
                            }
                        },
                        '400': {
                            description: 'Invalid input',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '409': {
                            description: 'Email already exists',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Login user',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string', format: 'password' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Login successful',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/LoginResponse' }
                                }
                            }
                        },
                        '401': {
                            description: 'Invalid credentials',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/auth/logout': {
                post: {
                    tags: ['Auth'],
                    summary: 'Logout user',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'Logout successful',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/BaseResponse' }
                                }
                            }
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/auth/refresh-token': {
                post: {
                    tags: ['Auth'],
                    summary: 'Refresh access token',
                    responses: {
                        '200': {
                            description: 'Token refreshed successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/RefreshTokenResponse' }
                                }
                            }
                        },
                        '401': {
                            description: 'Invalid refresh token',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/notes': {
                get: {
                    tags: ['Notes'],
                    summary: 'Get all notes',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'query',
                            name: 'page',
                            schema: { type: 'integer', default: 1 }
                        },
                        {
                            in: 'query',
                            name: 'perPage',
                            schema: { type: 'integer', default: 10 }
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Notes fetched successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/PaginatedNotesResponse' }
                                }
                            }
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                },
                post: {
                    tags: ['Notes'],
                    summary: 'Create a new note',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['title', 'content'],
                                    properties: {
                                        title: { type: 'string' },
                                        content: { type: 'string' },
                                        tags: {
                                            type: 'array',
                                            items: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Note created successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SingleNoteResponse' }
                                }
                            }
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '400': {
                            description: 'Invalid input',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/notes/{id}': {
                get: {
                    tags: ['Notes'],
                    summary: 'Get note by ID',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Note fetched successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SingleNoteResponse' }
                                }
                            }
                        },
                        '404': {
                            description: 'Note not found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '403': {
                            description: 'Forbidden - No access to this note',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                },
                patch: {
                    tags: ['Notes'],
                    summary: 'Update note',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string' },
                                        content: { type: 'string' },
                                        tags: {
                                            type: 'array',
                                            items: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Note updated successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SingleNoteResponse' }
                                }
                            }
                        },
                        '404': {
                            description: 'Note not found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '403': {
                            description: 'Forbidden - No write access to this note',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                },
                delete: {
                    tags: ['Notes'],
                    summary: 'Delete note',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Note deleted successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/BaseResponse' }
                                }
                            }
                        },
                        '404': {
                            description: 'Note not found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '403': {
                            description: 'Forbidden - No write access to this note',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/notes/{id}/share': {
                post: {
                    tags: ['Notes'],
                    summary: 'Share note with other users',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['emails'],
                                    properties: {
                                        emails: {
                                            type: 'array',
                                            items: { type: 'string', format: 'email' },
                                            maxItems: 10
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Note shared successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/BaseResponse' }
                                }
                            }
                        },
                        '404': {
                            description: 'Note not found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '400': {
                            description: 'Invalid request (e.g., users not found, already shared, or too many emails)',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '403': {
                            description: 'Forbidden - Only owner can share note',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/search': {
                get: {
                    tags: ['Search'],
                    summary: 'Search notes',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'query',
                            name: 'q',
                            required: true,
                            schema: { type: 'string' }
                        },
                        {
                            in: 'query',
                            name: 'page',
                            schema: { type: 'integer', default: 1 }
                        },
                        {
                            in: 'query',
                            name: 'perPage',
                            schema: { type: 'integer', default: 10 }
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Search results',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/PaginatedNotesResponse' }
                                }
                            }
                        },
                        '400': {
                            description: 'Missing search query',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options); 