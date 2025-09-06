import { corsHeaders } from './cors.ts';

export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify({ success: true, data }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status 
    }
  );
}

export function createErrorResponse(error: string, status: number = 500, details?: any) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error,
      ...(details && { details })
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status 
    }
  );
}

export function createValidationErrorResponse(errors: string[]) {
  return createErrorResponse('Validation failed', 400, { validation_errors: errors });
}
