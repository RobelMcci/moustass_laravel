<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceHttps
{
    public function handle(Request $request, Closure $next)
    {
        // HTTPS obligatoire en production uniquement
        if (!$request->isSecure() && env('APP_ENV') === 'production') {
            return response()->json(['message' => 'HTTPS required.'], 403);
        }

        return $next($request);
    }
}
