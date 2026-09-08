import type { FarmItem } from '@/types/farm.types'
import type { BlockItem } from '@/types/block.types'

export type { FarmItem, BlockItem }
export type FarmDetail = FarmItem


export const MOCK_FARMS: FarmItem[] = [
  {
    id: 'farm-1',
    name: 'Kebun Raya Bogor',
    location: 'Bogor, Jawa Barat, Indonesia',
    status: 'Aktif',
    totalBlocks: 4,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD_PsqSCDD72__M9KF745R-IZ0OdNaxnSD1vkInDOUqub7pwx6iBqXjymR93vizSvERiymonAaqldbxO5x488OktSHbF_IssiZwprsom2mDrYcAuitlEzLNhFG-VdceL7n0lbAtcGecHmZu7soGz2DuE7U73xk2pkt7UwpB2LRRdCvCjZPIFHY926_IfSFp4sXCj7yOyu0-6tsX2C1hxD_Iptzr5Cyi_DIOvDHvlpOAlurvX76-Xzu87w',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD_PsqSCDD72__M9KF745R-IZ0OdNaxnSD1vkInDOUqub7pwx6iBqXjymR93vizSvERiymonAaqldbxO5x488OktSHbF_IssiZwprsom2mDrYcAuitlEzLNhFG-VdceL7n0lbAtcGecHmZu7soGz2DuE7U73xk2pkt7UwpB2LRRdCvCjZPIFHY926_IfSFp4sXCj7yOyu0-6tsX2C1hxD_Iptzr5Cyi_DIOvDHvlpOAlurvX76-Xzu87w',
    blocks: [
      {
        id: 'blk-1',
        name: 'Blok A (Nursery)',
        phase: 'Vegetatif',
        description:
          'Fase pertumbuhan awal bibit buah naga dengan jadwal penyinaran spektrum penuh malam hari.',
        area: '500 m²',
        nodeSensor: 'Node-01A',
        status: 'Online',
        harvestEstimate: '12 Okt',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAYrpIW_P9Le_nSFn50QC_tohbXw7AQIiUP7wup0GT5285txyvWzWwPD6kqdSc7pFVtqjMM3WrETooHyTEoYdvZeNZWLO1OY_IicLcekq2bE03Z5QZxlNSdU7ziXwdC7U07NilFCfbU4CuJ5XdZZUF5jFrJLG46aGcyV766wt814OdaWskJKEnUUNqiDwBS9x8B3pf16Lu1qQAtCIN1XABpchcaYwzqvBcCgcp2bIjam3gp6vi7fA1mIQ',
      },
      {
        id: 'blk-2',
        name: 'Blok B (Pembungaan)',
        phase: 'Generatif',
        description:
          'Fase induksi pembungaan buah naga dengan lampu LED kuning intensif 6 jam per malam.',
        area: '450 m²',
        nodeSensor: 'Node-02B',
        status: 'Online',
        harvestEstimate: '20 Okt',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBArmvMm3jMxhKVVU2oRoaGL63gJi_XuOIjqXc79BJQnTgdadau0wqNVZFpfeY36XwkCV9EjEN35GJMEYzuJvlnG4IqTu78E20vUiE3gsXtCqyUipDwHkR6lqT6ocSqQFHL0kx8i_q1ikzE0Z-G8H873JYa5H9dKn4ES8na5ZSyWybhYXmr5G-eO7cj0RPnYlpFNCPZvmqSo9A-UyVjG3Pctvf8enB2_EELCu8D1nzLpcfqrtRCeMUVOg',
      },
      {
        id: 'blk-3',
        name: 'Blok C (Sterilisasi)',
        phase: 'Persiapan',
        description:
          'Sterilisasi dan pergantian lampu modul IoT. Sensor dalam status pemeliharaan berkala.',
        area: '600 m²',
        nodeSensor: 'Node-03C',
        status: 'Offline',
        harvestEstimate: '05 Nov',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDrfBH9mbl4Esl3DEDbMgzXEF7eOFjefnJr8GIuYNeV2NWY46dLfd-a1KUwmWZHR4mKKJ3BMTTC_wsPQk9E1X115vrwwS0wZrGwvro6zohXuBbjgVZM21L7lKQ-oj7Ww3yh9cPb2wGbv3XTAJC9B977K5NlyST7UB2BICZ2G9HolNstH2wFmo7fYIooKibgK54sT2dc-rD6GdmTCHsmsc8yYkqvaPpA-s900X3-MfjskGiOF2_8nYNQdg',
      },
      {
        id: 'blk-4',
        name: 'Blok D (Pematangan Buah)',
        phase: 'Matang',
        description:
          'Pematangan buah pasca-induksi cahaya. Monitoring lux harian untuk memprediksi panen.',
        area: '300 m²',
        nodeSensor: 'Node-04D',
        status: 'Online',
        harvestEstimate: '18 Nov',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCD4RcEzmmWWnPQ9s7Ou9j2Q6sMTn0NKjS4O-xlidB1drGniq6YZAsj_zsMqcX8TXwQRNeDSqR8ZbeVZjxpNqzVAj0f8ocIeaK1AvmUHaf56YB1Qbi-mWQlgC3LT2v1i2_1JvCmI-mMwLqpsWm73Dl8NDIzjIIxIMg3SadwR8r5YADng7c9mH3CUuzjIw2pUqEBC9ncQYQNuI1EgWGFLXx60saW40eNhAWrdZq7t-mZ80-guE5DTMzcxg',
      },
    ],
  },
  {
    id: 'farm-2',
    name: 'Lembang Farm House',
    location: 'Bandung, Jawa Barat, Indonesia',
    status: 'Aktif',
    totalBlocks: 1,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC6yqt6GX8TvJl3-Dnpe4OHwiPFJeeD619kLQh1_tnbghbGpL5YJPOCUdI6soM-X_4RFtHufMjJpnm0iOwgVb1D_3KaWQWegmA1HN7JIIbQu65WxxvxENx6IG7uhnYnW_fX0y8Aqlp02XRQBBqwfXT5hXuzMUSq_ytSbjOk9_q5um1-AHCHTUlAhZBUBONlyxH5BIRPfd7Alw4jN-o8IWQd5JOmaVWhF7u5jF3yhjONxbQojXF7_y0HyQ',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC6yqt6GX8TvJl3-Dnpe4OHwiPFJeeD619kLQh1_tnbghbGpL5YJPOCUdI6soM-X_4RFtHufMjJpnm0iOwgVb1D_3KaWQWegmA1HN7JIIbQu65WxxvxENx6IG7uhnYnW_fX0y8Aqlp02XRQBBqwfXT5hXuzMUSq_ytSbjOk9_q5um1-AHCHTUlAhZBUBONlyxH5BIRPfd7Alw4jN-o8IWQd5JOmaVWhF7u5jF3yhjONxbQojXF7_y0HyQ',
    blocks: [
      {
        id: 'blk-201',
        name: 'Blok Sayur Daun',
        phase: 'Vegetatif',
        description:
          'Budidaya tanaman selada dan kailan hidroponik dengan spektrum LED terkendali.',
        area: '800 m²',
        nodeSensor: 'Node-L01',
        status: 'Online',
        harvestEstimate: '25 Okt',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCD4RcEzmmWWnPQ9s7Ou9j2Q6sMTn0NKjS4O-xlidB1drGniq6YZAsj_zsMqcX8TXwQRNeDSqR8ZbeVZjxpNqzVAj0f8ocIeaK1AvmUHaf56YB1Qbi-mWQlgC3LT2v1i2_1JvCmI-mMwLqpsWm73Dl8NDIzjIIxIMg3SadwR8r5YADng7c9mH3CUuzjIw2pUqEBC9ncQYQNuI1EgWGFLXx60saW40eNhAWrdZq7t-mZ80-guE5DTMzcxg',
      },
    ],
  },
  {
    id: 'farm-3',
    name: 'Indoor Farm BSD',
    location: 'Tangerang, Banten, Indonesia',
    status: 'Inaktif',
    totalBlocks: 1,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCqLhSidleYzcS3vz-w1fEoC75-nl1mwiWtUufIi1y-Q4BYbLaj_GOJHPFE-4eIjjl_YtcLRi4dG-lvlgtrwjoDuMkTBe3gYWf6ViW9grtWFoDvaPUgakuf2JRVa90AVuc7sHeaMMlGow7LYcumv94AsiSqiDPMZihti7ftfLk7pv6jPFRYdN7s1SyFRlSSB5f7mAjk-qRtfA-Jz1kLgLwWSccfnRSR6Jru6pFWzDSXivD1hsB9MpwYAQ',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCqLhSidleYzcS3vz-w1fEoC75-nl1mwiWtUufIi1y-Q4BYbLaj_GOJHPFE-4eIjjl_YtcLRi4dG-lvlgtrwjoDuMkTBe3gYWf6ViW9grtWFoDvaPUgakuf2JRVa90AVuc7sHeaMMlGow7LYcumv94AsiSqiDPMZihti7ftfLk7pv6jPFRYdN7s1SyFRlSSB5f7mAjk-qRtfA-Jz1kLgLwWSccfnRSR6Jru6pFWzDSXivD1hsB9MpwYAQ',
    blocks: [
      {
        id: 'blk-301',
        name: 'Blok Vertikal Lab',
        phase: 'Perawatan',
        description: 'Kalibrasi sensor lingkungan mikro dan modul LED vertikal.',
        area: '300 m²',
        nodeSensor: 'Node-B01',
        status: 'Offline',
        harvestEstimate: 'Perawatan',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCqLhSidleYzcS3vz-w1fEoC75-nl1mwiWtUufIi1y-Q4BYbLaj_GOJHPFE-4eIjjl_YtcLRi4dG-lvlgtrwjoDuMkTBe3gYWf6ViW9grtWFoDvaPUgakuf2JRVa90AVuc7sHeaMMlGow7LYcumv94AsiSqiDPMZihti7ftfLk7pv6jPFRYdN7s1SyFRlSSB5f7mAjk-qRtfA-Jz1kLgLwWSccfnRSR6Jru6pFWzDSXivD1hsB9MpwYAQ',
      },
    ],
  },
]

export const MOCK_FARMS_LIST = MOCK_FARMS

export const getAllFarms = (): FarmItem[] => MOCK_FARMS

export const getFarmById = (id: string): FarmItem | undefined =>
  MOCK_FARMS.find((f) => f.id === id)

export const getBlocksByFarmId = (farmId: string): BlockItem[] => {
  const farm = MOCK_FARMS.find((f) => f.id === farmId)
  return farm ? farm.blocks : []
}
