import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gatewayService } from './gatewayService.ts';
import { apiClient, ApiError } from './api.ts';
import type { ApiResponse } from '@/types/api.types';
import type { GatewayBackend } from '@/types/gateway.types';

describe('gatewayService - resetGatewayPairing', () => {
  it('1. Melempar galat jika ID gateway kosong atau hanya spasi', async () => {
    await assert.rejects(
      async () => {
        await gatewayService.resetGatewayPairing('');
      },
      {
        name: 'Error',
        message: 'ID gateway tidak valid',
      }
    );

    await assert.rejects(
      async () => {
        await gatewayService.resetPairing('   ');
      },
      {
        name: 'Error',
        message: 'ID gateway tidak valid',
      }
    );
  });

  it('2. Berhasil mereset pairing dan menerima kode pairing baru (HTTP 200)', async () => {
    const originalPost = apiClient.post;
    const testGatewayId = 'gw-uuid-12345';
    let requestedEndpoint = '';

    const mockResponse: ApiResponse<GatewayBackend> = {
      status: 'success',
      message: 'Pairing gateway berhasil direset',
      data: {
        id_gateway: testGatewayId,
        blok_id: 'block-uuid-1',
        kode_perangkat: 'GTW-ESP32-01',
        status_koneksi: 'belum_terhubung',
        kode_pairing: 'PAIR-998877',
        token_gateway: null,
      },
    };

    try {
      apiClient.post = (async <T>(endpoint: string): Promise<T> => {
        requestedEndpoint = endpoint;
        return mockResponse as unknown as T;
      }) as typeof apiClient.post;

      const result = await gatewayService.resetGatewayPairing(testGatewayId);

      assert.equal(requestedEndpoint, `/petani/gateway/${testGatewayId}/reset-pairing`);
      assert.equal(result.status, 'success');
      assert.equal(result.data.kode_pairing, 'PAIR-998877');
      assert.equal(result.data.token_gateway, null);
    } finally {
      apiClient.post = originalPost;
    }
  });

  it('3. Menangani galat 403 Forbidden (Bukan pemilik gateway)', async () => {
    const originalPost = apiClient.post;

    try {
      apiClient.post = (async (): Promise<never> => {
        throw new ApiError('Forbidden', 403);
      }) as typeof apiClient.post;

      await assert.rejects(
        async () => {
          await gatewayService.resetGatewayPairing('gw-uuid-unauthorized');
        },
        (err: unknown) => {
          assert(err instanceof ApiError);
          assert.equal(err.status, 403);
          return true;
        }
      );
    } finally {
      apiClient.post = originalPost;
    }
  });

  it('4. Menangani galat 404 Not Found (Gateway tidak ditemukan)', async () => {
    const originalPost = apiClient.post;

    try {
      apiClient.post = (async (): Promise<never> => {
        throw new ApiError('Gateway not found', 404);
      }) as typeof apiClient.post;

      await assert.rejects(
        async () => {
          await gatewayService.resetGatewayPairing('gw-uuid-notfound');
        },
        (err: unknown) => {
          assert(err instanceof ApiError);
          assert.equal(err.status, 404);
          return true;
        }
      );
    } finally {
      apiClient.post = originalPost;
    }
  });

  it('5. Menangani galat 402 Payment Required (Langganan kedaluwarsa)', async () => {
    const originalPost = apiClient.post;

    try {
      apiClient.post = (async (): Promise<never> => {
        throw new ApiError('Payment Required', 402);
      }) as typeof apiClient.post;

      await assert.rejects(
        async () => {
          await gatewayService.resetGatewayPairing('gw-uuid-expired');
        },
        (err: unknown) => {
          assert(err instanceof ApiError);
          assert.equal(err.status, 402);
          return true;
        }
      );
    } finally {
      apiClient.post = originalPost;
    }
  });
});

