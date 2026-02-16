<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceHttps
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->isSecure()) {
            return response()->json(['message' => 'HTTPS required.'], 403);
        }

        return $next($request);
    }
}
