/** OpenAPI 3 description of the API, shown with Swagger UI at /docs. */
export const openapi = {
  openapi: '3.0.3',
  info: { title: 'BookIt API', version: '1.0.0', description: 'REST API for booking appointments (learning project).' },
  servers: [{ url: '/api' }],
  paths: {
    '/health': { get: { summary: 'Health check', responses: { 200: { description: 'OK' } } } },
    '/services': { get: { summary: 'List services', responses: { 200: { description: 'List of services' } } } },
    '/slots': {
      get: {
        summary: 'Available time slots for a service on a day',
        parameters: [
          { name: 'serviceId', in: 'query', required: true, schema: { type: 'string', example: 'haircut' } },
          { name: 'date', in: 'query', required: true, schema: { type: 'string', example: '2026-12-01' } },
        ],
        responses: { 200: { description: 'Slots' }, 400: { description: 'Validation failed' }, 404: { description: 'Service not found' } },
      },
    },
    '/bookings': {
      get: {
        summary: 'List bookings (paginated)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['confirmed', 'cancelled'] } },
          { name: 'date', in: 'query', schema: { type: 'string', example: '2026-12-01' } },
        ],
        responses: { 200: { description: 'A page of bookings' } },
      },
      post: {
        summary: 'Create a booking',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['serviceId', 'customerName', 'customerEmail', 'startAt'],
                properties: {
                  serviceId: { type: 'string', example: 'haircut' },
                  customerName: { type: 'string', example: 'Ana Popescu' },
                  customerEmail: { type: 'string', example: 'ana@example.com' },
                  startAt: { type: 'string', format: 'date-time', example: '2026-12-01T10:00:00Z' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' }, 400: { description: 'Validation failed' }, 409: { description: 'Slot already booked' }, 422: { description: 'Outside opening hours / in the past' } },
      },
    },
    '/bookings/{id}': {
      get: { summary: 'Get one booking', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Booking' }, 404: { description: 'Not found' } } },
    },
    '/bookings/{id}/cancel': {
      patch: { summary: 'Cancel a booking', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Cancelled' }, 404: { description: 'Not found' } } },
    },
  },
} as const;

/** Swagger UI loaded from a CDN, so we need no extra npm package. */
export const swaggerHtml = `<!doctype html><html><head><title>BookIt API docs</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head>
<body><div id="ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: '/api/openapi.json', dom_id: '#ui' });</script></body></html>`;
