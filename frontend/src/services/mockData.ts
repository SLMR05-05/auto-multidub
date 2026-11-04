import { Language, Poi, Tour, Ward, BusStop } from '@/types';

export const MOCK_LANGUAGES: Language[] = [
  { id: 1, code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', localeTts: 'vi-VN', isActive: true, isDefault: true, orderIndex: 1 },
  { id: 2, code: 'en', name: 'English', nativeName: 'English', localeTts: 'en-US', isActive: true, isDefault: false, orderIndex: 2 },
  { id: 3, code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', localeTts: 'zh-CN', isActive: true, isDefault: false, orderIndex: 3 },
  { id: 4, code: 'th', name: 'Thai', nativeName: 'ไทย', localeTts: 'th-TH', isActive: true, isDefault: false, orderIndex: 4 },
  { id: 5, code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', localeTts: 'hi-IN', isActive: true, isDefault: false, orderIndex: 5 },
  { id: 6, code: 'ko', name: 'Korean', nativeName: '한국어', localeTts: 'ko-KR', isActive: true, isDefault: false, orderIndex: 6 },
  { id: 7, code: 'ja', name: 'Japanese', nativeName: '日本語', localeTts: 'ja-JP', isActive: true, isDefault: false, orderIndex: 7 },
  { id: 8, code: 'fr', name: 'French', nativeName: 'Français', localeTts: 'fr-FR', isActive: false, isDefault: false, orderIndex: 8 },
];

export const MOCK_WARDS: Ward[] = [
  { id: 1, name: 'Khánh Hội', district: 'Quận 4', city: 'Thành phố Hồ Chí Minh' },
  { id: 2, name: 'Vĩnh Hội', district: 'Quận 4', city: 'Thành phố Hồ Chí Minh' },
  { id: 3, name: 'Xóm Chiếu', district: 'Quận 4', city: 'Thành phố Hồ Chí Minh' },
];

export const MOCK_BUS_STOPS: BusStop[] = [
  { id: 1, name: 'Trạm Cầu Khánh Hội (01)', code: 'BS-KH01', wardId: 1, latitude: 10.7681, longitude: 106.7052, address: 'Đoàn Như Hài, P. Khánh Hội', isActive: true },
  { id: 2, name: 'Trạm Nhà Rồng (02)', code: 'BS-KH02', wardId: 1, latitude: 10.7675, longitude: 106.7068, address: 'Nguyễn Tất Thành, P. Khánh Hội', isActive: true },
  { id: 3, name: 'Trạm Chợ Xóm Chiếu (03)', code: 'BS-XC01', wardId: 3, latitude: 10.7618, longitude: 106.7042, address: 'Lê Văn Linh, P. Xóm Chiếu', isActive: true },
  { id: 4, name: 'Trạm Nhà thờ Xóm Chiếu (04)', code: 'BS-XC02', wardId: 3, latitude: 10.7602, longitude: 106.7058, address: 'Nguyễn Tất Thành, P. Xóm Chiếu', isActive: true },
  { id: 5, name: 'Trạm Cầu Ông Lãnh Vĩnh Hội (05)', code: 'BS-VH01', wardId: 2, latitude: 10.7645, longitude: 106.6995, address: 'Hoàng Diệu, P. Vĩnh Hội', isActive: true },
];

export const MOCK_POIS: Poi[] = [
  {
    id: 1,
    code: 'POI_BEN_NHA_RONG',
    name: 'Bảo tàng Hồ Chí Minh - Bến Nhà Rồng',
    wardId: 1,
    busStopId: 2,
    latitude: 10.7683,
    longitude: 106.7067,
    radiusMeters: 60,
    priority: 5,
    status: 'PUBLISHED',
    version: 3,
    isDeleted: false,
    ward: MOCK_WARDS[0],
    busStop: MOCK_BUS_STOPS[1],
    images: [
      { id: 1, poiId: 1, fileName: 'nharong-1.jpg', imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80', orderIndex: 1, isPrimary: true },
      { id: 2, poiId: 1, fileName: 'nharong-2.jpg', imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80', orderIndex: 2, isPrimary: false }
    ],
    translations: [
      {
        id: 1, poiId: 1, languageCode: 'vi',
        title: 'Bến Nhà Rồng - Di tích Lịch sử Khởi hành tìm đường cứu nước',
        description: 'Bến Nhà Rồng khởi công xây dựng năm 1863, là trụ sở của hãng vận tải hoàng gia Pháp Messageries Impériales tại Sài Gòn. Nơi đây gắn liền với sự kiện ngày 5 tháng 6 năm 1911, người thanh niên Nguyễn Tất Thành bước lên con tàu Amiral Latouche-Tréville ra đi tìm đường cứu nước.',
        narrationScript: 'Chào mừng quý khách đến với Bến Nhà Rồng. Nơi đây từng là thương cảng sầm uất bậc nhất Sài Gòn xưa. Điểm nổi bật là đôi rồng gốm uốn lượn trên nóc mái.'
      },
      {
        id: 2, poiId: 1, languageCode: 'en',
        title: 'Nha Rong Wharf - Ho Chi Minh Museum',
        description: 'Constructed in 1863 along the Saigon River, Nha Rong Wharf was formerly the headquarters of the French shipping company Messageries Impériales. It is historically famous as the departure point of President Ho Chi Minh in 1911.',
        narrationScript: 'Welcome to Nha Rong Wharf, a historic landmark in District 4. Notice the French colonial architecture adorned with dragon statues on the roof.'
      }
    ],
    audios: [
      { id: 1, poiId: 1, languageCode: 'vi', fileName: 'poi_1_vi.mp3', audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg', format: 'mp3', durationSeconds: 65, isPrerecorded: true },
      { id: 2, poiId: 1, languageCode: 'en', fileName: 'poi_1_en.mp3', audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg', format: 'mp3', durationSeconds: 58, isPrerecorded: true }
    ]
  },
  {
    id: 2,
    code: 'POI_CHO_XOM_CHIEU',
    name: 'Chợ Xóm Chiếu - Thiên đường ẩm thực 24/7',
    wardId: 3,
    busStopId: 3,
    latitude: 10.7619,
    longitude: 106.7040,
    radiusMeters: 50,
    priority: 4,
    status: 'PUBLISHED',
    version: 2,
    isDeleted: false,
    ward: MOCK_WARDS[2],
    busStop: MOCK_BUS_STOPS[2],
    images: [
      { id: 3, poiId: 2, fileName: 'xomchieu-1.jpg', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', orderIndex: 1, isPrimary: true }
    ],
    translations: [
      {
        id: 3, poiId: 2, languageCode: 'vi',
        title: 'Chợ Xóm Chiếu (Chợ 200)',
        description: 'Chợ Xóm Chiếu nổi tiếng khắp thành phố với tên gọi Chợ 200, là thiên đường ẩm thực đường phố với vô số món ngon: ốc vỉa hè, súp cua, phá lấu, chuối ngào đường và các món chè Nam Bộ.',
        narrationScript: 'Bạn vừa đến Chợ Xóm Chiếu. Hãy chuẩn bị thưởng thức những món ăn vặt đặc sắc nhất Quận 4 với giá cả vô cùng bình dân.'
      },
      {
        id: 4, poiId: 2, languageCode: 'en',
        title: 'Xom Chieu Market - Street Food Heaven',
        description: 'Renowned as Market 200, Xom Chieu is a bustling culinary hub packed with iconic Vietnamese street delicacies: Pha Lau, savory snail dishes, crab soup, and traditional sweet desserts.',
        narrationScript: 'Welcome to Xom Chieu Market, the street food capital of District 4. Follow the aromas to discover Saigon genuine street flavors.'
      }
    ],
    audios: [
      { id: 3, poiId: 2, languageCode: 'vi', fileName: 'poi_2_vi.mp3', audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg', format: 'mp3', durationSeconds: 45, isPrerecorded: true }
    ]
  },
  {
    id: 3,
    code: 'POI_NHA_THO_XOM_CHIEU',
    name: 'Giáo xứ Nhà thờ Xóm Chiếu',
    wardId: 3,
    busStopId: 4,
    latitude: 10.7600,
    longitude: 106.7055,
    radiusMeters: 50,
    priority: 3,
    status: 'PUBLISHED',
    version: 1,
    isDeleted: false,
    ward: MOCK_WARDS[2],
    busStop: MOCK_BUS_STOPS[3],
    images: [
      { id: 4, poiId: 3, fileName: 'nhatho-1.jpg', imageUrl: 'https://images.unsplash.com/photo-1548625361-195fe57876a4?auto=format&fit=crop&w=800&q=80', orderIndex: 1, isPrimary: true }
    ],
    translations: [
      {
        id: 5, poiId: 3, languageCode: 'vi',
        title: 'Nhà thờ Xóm Chiếu hơn 160 năm tuổi',
        description: 'Được thành lập từ năm 1856, Nhà thờ Xóm Chiếu là một trong những cơ sở Công giáo lâu đời nhất khu vực Nam Sài Gòn, chứng nhân cho sự hình thành xóm thợ và dân cư Quận 4.',
        narrationScript: 'Chào mừng quý khách đến với Nhà thờ Xóm Chiếu. Ngôi thánh đường cổ kính với tháp chuông rêu phong qua hơn một thế kỷ.'
      }
    ],
    audios: [
      { id: 4, poiId: 3, languageCode: 'vi', fileName: 'poi_3_vi.mp3', audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg', format: 'mp3', durationSeconds: 50, isPrerecorded: true }
    ]
  },
  {
    id: 4,
    code: 'POI_CAU_MONG',
    name: 'Cầu Mống - Cây cầu bộ hành trăm tuổi',
    wardId: 1,
    busStopId: 1,
    latitude: 10.7695,
    longitude: 106.7042,
    radiusMeters: 45,
    priority: 4,
    status: 'PUBLISHED',
    version: 2,
    isDeleted: false,
    ward: MOCK_WARDS[0],
    busStop: MOCK_BUS_STOPS[0],
    images: [
      { id: 5, poiId: 4, fileName: 'caumong-1.jpg', imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80', orderIndex: 1, isPrimary: true }
    ],
    translations: [
      {
        id: 6, poiId: 4, languageCode: 'vi',
        title: 'Cầu Mống bắc qua Kênh Bến Nghé',
        description: 'Được công ty Pháp Eiffel thiết kế và xây dựng cuối thế kỷ 19 bằng thép mạ màu xanh ngọc bích, nối liền Quận 1 và Quận 4. Hiện nay đây là cây cầu dành riêng cho người đi bộ ngắm cảnh hoàng hôn tuyệt đẹp.',
        narrationScript: 'Trước mắt bạn là Cầu Mống, một biểu tượng kiến trúc thép duyên dáng bắc qua kênh Bến Nghé.'
      }
    ],
    audios: [
      { id: 5, poiId: 4, languageCode: 'vi', fileName: 'poi_4_vi.mp3', audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg', format: 'mp3', durationSeconds: 55, isPrerecorded: true }
    ]
  }
];

export const MOCK_TOURS: Tour[] = [
  {
    id: 1,
    code: 'TOUR_LICH_SU_Q4',
    name: 'Hành trình Ký ức Lịch sử Bến cảng Khánh Hội',
    description: 'Tour đi bộ khám phá các chứng tích lịch sử hàng trăm năm bên dòng sông Sài Gòn và kênh Bến Nghé.',
    coverImageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
    estimatedMinutes: 90,
    status: 'PUBLISHED',
    version: 2,
    pois: [
      { poi: MOCK_POIS[0], orderIndex: 1 },
      { poi: MOCK_POIS[3], orderIndex: 2 },
    ]
  },
  {
    id: 2,
    code: 'TOUR_AM_THUC_XOM_CHIEU',
    name: 'Food Tour: Hương vị Đêm Xóm Chiếu',
    description: 'Khám phá hơn 50 món ăn đường phố đậm chất phương Nam tại thánh địa ẩm thực Chợ Xóm Chiếu.',
    coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    estimatedMinutes: 60,
    status: 'PUBLISHED',
    version: 1,
    pois: [
      { poi: MOCK_POIS[1], orderIndex: 1 },
      { poi: MOCK_POIS[2], orderIndex: 2 },
    ]
  }
];

export const MOCK_QR_CODES = [
  {
    id: 1,
    code: 'q4NhArOn',
    poiId: 1,
    busStopId: 2,
    label: 'Biển đón cổng chính Bảo tàng Hồ Chí Minh',
    isActive: true,
    scanCount: 1420,
    poi: MOCK_POIS[0],
    busStop: MOCK_BUS_STOPS[1],
  },
  {
    id: 2,
    code: 'q4XoMcHi',
    poiId: 2,
    busStopId: 3,
    label: 'Cột mốc lối vào Chợ 200 Xóm Chiếu',
    isActive: true,
    scanCount: 980,
    poi: MOCK_POIS[1],
    busStop: MOCK_BUS_STOPS[2],
  },
  {
    id: 3,
    code: 'q4NhAtHo',
    poiId: 3,
    busStopId: 4,
    label: 'Bảng chỉ dẫn cổng Nhà thờ Xóm Chiếu',
    isActive: true,
    scanCount: 530,
    poi: MOCK_POIS[2],
    busStop: MOCK_BUS_STOPS[3],
  },
  {
    id: 4,
    code: 'q4CaUmOn',
    poiId: 4,
    busStopId: 1,
    label: 'Chân cầu Mống phía Bến Vân Đồn',
    isActive: true,
    scanCount: 890,
    poi: MOCK_POIS[3],
    busStop: MOCK_BUS_STOPS[0],
  },
  {
    id: 5,
    code: 'q4BsKh01',
    poiId: 4,
    busStopId: 1,
    label: 'Trạm chờ xe buýt Cầu Khánh Hội',
    isActive: false,
    scanCount: 112,
    poi: MOCK_POIS[3],
    busStop: MOCK_BUS_STOPS[0],
  }
];

export interface HeatmapPoint {
  id: number;
  latitude: number;
  longitude: number;
  weight: number; // 0.1 to 1.0 intensity
  visitors: number;
  wardName: string;
  nearbyPoi?: string;
}

export const MOCK_HEATMAP_POINTS: HeatmapPoint[] = [
  { id: 1, latitude: 10.7683, longitude: 106.7067, weight: 0.95, visitors: 3450, wardName: 'Khánh Hội', nearbyPoi: 'Bến Nhà Rồng' },
  { id: 2, latitude: 10.7687, longitude: 106.7060, weight: 0.85, visitors: 2890, wardName: 'Khánh Hội', nearbyPoi: 'Công viên Bến Bạch Đằng - Cảng Khánh Hội' },
  { id: 3, latitude: 10.7695, longitude: 106.7042, weight: 0.78, visitors: 2210, wardName: 'Khánh Hội', nearbyPoi: 'Cầu Mống' },
  { id: 4, latitude: 10.7672, longitude: 106.7048, weight: 0.65, visitors: 1680, wardName: 'Khánh Hội', nearbyPoi: 'Đoàn Như Hài - Bến Vân Đồn' },
  { id: 5, latitude: 10.7619, longitude: 106.7040, weight: 0.92, visitors: 3120, wardName: 'Xóm Chiếu', nearbyPoi: 'Chợ Xóm Chiếu (Chợ 200)' },
  { id: 6, latitude: 10.7600, longitude: 106.7055, weight: 0.58, visitors: 1350, wardName: 'Xóm Chiếu', nearbyPoi: 'Nhà thờ Xóm Chiếu' },
  { id: 7, latitude: 10.7610, longitude: 106.7065, weight: 0.48, visitors: 980, wardName: 'Xóm Chiếu', nearbyPoi: 'Hẻm ẩm thực Lê Văn Linh' },
  { id: 8, latitude: 10.7645, longitude: 106.6995, weight: 0.72, visitors: 1940, wardName: 'Vĩnh Hội', nearbyPoi: 'Cầu Ông Lãnh - Hoàng Diệu' },
  { id: 9, latitude: 10.7635, longitude: 106.7010, weight: 0.55, visitors: 1220, wardName: 'Vĩnh Hội', nearbyPoi: 'Phố ẩm thực Vĩnh Khánh' },
  { id: 10, latitude: 10.7650, longitude: 106.7025, weight: 0.62, visitors: 1470, wardName: 'Vĩnh Hội', nearbyPoi: 'Ngã tư Hoàng Diệu - Khánh Hội' }
];
