import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { findNodeForBlock } from './blockNodeMatcher.ts'

describe('findNodeForBlock', () => {
  const mockNodeA = {
    id_sensor: 'sensor-uuid-1',
    kode_perangkat: 'NODE-001',
    blok_id: 'block-uuid-a',
    status_koneksi: 'aktif',
  }

  const mockNodeB = {
    id_sensor: 'sensor-uuid-2',
    kode_perangkat: 'NODE-002',
    id_blok: 'block-uuid-b',
    status_koneksi: 'aktif',
  }

  const mockNodeC = {
    id_sensor: 'sensor-uuid-3',
    kode_perangkat: 'NODE-003',
    blok: {
      id_blok: 'block-uuid-c',
      nama_blok: 'Blok Timur',
    },
    status_koneksi: 'aktif',
  }

  const mockNodeD = {
    id_sensor: 'sensor-uuid-4',
    kode_perangkat: 'NODE-004',
    blockId: 'block-uuid-d',
    status_koneksi: 'aktif',
  }

  const allNodes = [mockNodeA, mockNodeB, mockNodeC, mockNodeD]

  it('mengembalikan node jika cocok dengan properti blok_id langsung', () => {
    const result = findNodeForBlock(allNodes, 'block-uuid-a')
    assert.ok(result)
    assert.equal(result.kode_perangkat, 'NODE-001')
  })

  it('mengembalikan node jika cocok dengan properti id_blok', () => {
    const result = findNodeForBlock(allNodes, 'block-uuid-b')
    assert.ok(result)
    assert.equal(result.kode_perangkat, 'NODE-002')
  })

  it('mengembalikan node jika cocok dengan properti nested blok.id_blok', () => {
    const result = findNodeForBlock(allNodes, 'block-uuid-c')
    assert.ok(result)
    assert.equal(result.kode_perangkat, 'NODE-003')
  })

  it('mengembalikan node jika cocok dengan properti camelCase blockId', () => {
    const result = findNodeForBlock(allNodes, 'block-uuid-d')
    assert.ok(result)
    assert.equal(result.kode_perangkat, 'NODE-004')
  })

  it('menangani input spasi atau huruf kapital/kecil dengan benar', () => {
    const result = findNodeForBlock(allNodes, '  BLOCK-UUID-A  ')
    assert.ok(result)
    assert.equal(result.kode_perangkat, 'NODE-001')
  })

  it('mengembalikan null jika blockId tidak ditemukan di kumpulan node', () => {
    const result = findNodeForBlock(allNodes, 'block-unknown')
    assert.equal(result, null)
  })

  it('mengembalikan null jika daftar node kosong, null, atau undefined', () => {
    assert.equal(findNodeForBlock([], 'block-uuid-a'), null)
    assert.equal(findNodeForBlock(null, 'block-uuid-a'), null)
    assert.equal(findNodeForBlock(undefined, 'block-uuid-a'), null)
  })

  it('mengembalikan null jika blockId kosong atau spasi saja', () => {
    assert.equal(findNodeForBlock(allNodes, ''), null)
    assert.equal(findNodeForBlock(allNodes, '   '), null)
    assert.equal(findNodeForBlock(allNodes, null), null)
    assert.equal(findNodeForBlock(allNodes, undefined), null)
  })
})
