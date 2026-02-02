<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class VisitorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $visitors = Visitor::orderBy('check_in_time', 'desc')->get();
            return response()->json($visitors);
        } catch (\Exception $e) {
            Log::error('Error fetching visitors: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch visitors'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'required|string|max:20',
                'purpose' => 'required|string|max:255',
                'host_name' => 'nullable|string|max:255',
                'company' => 'nullable|string|max:255',
                'check_out_time' => 'nullable|date',
            ]);

            $visitor = new Visitor($validated);
            $visitor->check_in_time = now();
            $visitor->save();

            return response()->json($visitor, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error creating visitor: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create visitor'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $visitor = Visitor::findOrFail($id);
            return response()->json($visitor);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Visitor not found'], 404);
        }
    }

    /**
     * Update the checkout time for a visitor.
     */
    public function updateCheckout(Request $request, string $id): JsonResponse
    {
        try {
            $visitor = Visitor::findOrFail($id);

            $validated = $request->validate([
                'check_out_time' => 'nullable|date',
            ]);

            $visitor->check_out_time = $validated['check_out_time'] ?? now();
            $visitor->save();

            return response()->json($visitor);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error updating checkout: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update checkout'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $visitor = Visitor::findOrFail($id);
            $visitor->delete();

            return response()->json(['message' => 'Visitor deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting visitor: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete visitor'], 500);
        }
    }

    /**
     * Export visitors as CSV.
     */
    public function report()
    {
        try {
            $visitors = Visitor::orderBy('check_in_time', 'desc')->get();

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="visitors_report.csv"',
            ];

            $callback = function() use ($visitors) {
                $file = fopen('php://output', 'w');

                // CSV headers
                fputcsv($file, [
                    'Name',
                    'Email',
                    'Phone',
                    'Purpose',
                    'Check-In Time',
                    'Check-Out Time',
                    'Host Name',
                    'Company'
                ]);

                // CSV data
                foreach ($visitors as $visitor) {
                    fputcsv($file, [
                        $visitor->name,
                        $visitor->email,
                        $visitor->phone,
                        $visitor->purpose,
                        $visitor->check_in_time ? $visitor->check_in_time->format('Y-m-d H:i:s') : '',
                        $visitor->check_out_time ? $visitor->check_out_time->format('Y-m-d H:i:s') : '',
                        $visitor->host_name ?? '',
                        $visitor->company ?? '',
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            Log::error('Error generating report: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate report'], 500);
        }
    }
}

