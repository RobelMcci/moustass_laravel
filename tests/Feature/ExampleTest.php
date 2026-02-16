<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->withServerVariables([
            'HTTPS' => 'on',
            'SERVER_PORT' => 443,
        ])->get('https://localhost/health');

        $response->assertStatus(200);
    }
}
