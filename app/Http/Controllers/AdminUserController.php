<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function __construct(private readonly UserService $userService)
    {
    }

    public function index()
    {
        $result = $this->userService->listAll();
        return response()->json($result['data'], $result['status']);
    }

    public function store(Request $request)
    {
        $result = $this->userService->create($request->all());
        return response()->json($result['data'], $result['status']);
    }

    public function update(Request $request, int $id)
    {
        $result = $this->userService->update($id, $request->all());
        return response()->json($result['data'], $result['status']);
    }

    public function destroy(int $id)
    {
        $result = $this->userService->disable($id);
        return response()->json($result['data'], $result['status']);
    }
}
