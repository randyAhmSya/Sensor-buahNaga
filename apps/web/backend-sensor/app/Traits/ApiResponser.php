<?php

namespace App\Traits;

trait ApiResponser
{
    protected function successResponse($data, $message = null, $code = 200, ?array $meta = null)
    {
        $body = [
            'status' => 'succes',
            'pesan' => $message,
            'data' => $data
        ];

        if ($meta !== null) {
            $body['meta'] = $meta;
        }

        return response()->json($body, $code);
    }

    protected function ErrorResponse($message, $code)
    {
        return response()->json([
            'status' => 'error',
            'pesan' => $message,
        ], $code);
    }
    protected function paginationMeta($paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'per_page'     => $paginator->perPage(),
            'total'        => $paginator->total(),
            'last_page'    => $paginator->lastPage(),
        ];
    }
}