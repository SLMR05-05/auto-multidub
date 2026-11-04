export type Role = 'ADMIN' | 'EDITOR' | 'ANALYST' | 'USER';
export type PoiStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TourStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TriggerType = 'GPS' | 'QR' | 'MANUAL';
export type AudioMode = 'PRERECORDED' | 'TTS';
export type PackageStatus = 'BUILDING' | 'READY' | 'FAILED' | 'DEPRECATED';

export interface Language {
  id: number;
  code: string; // 'vi', 'en', 'zh-CN', 'th', 'hi', 'ko', 'ja', ...
  name: string; // 'Vietnamese', 'English', ...
  nativeName: string; // 'Tiếng Việt', 'ไทย', ...
  localeTts: string; // 'vi-VN', 'th-TH', ...
  isActive: boolean;
  isDefault: boolean;
  orderIndex: number;
}

export interface Ward {
  id: number;
  name: string;
  district: string;
  city: string;
}

export interface BusStop {
  id: number;
  name: string;
  code?: string;
  wardId?: number;
  latitude: number;
  longitude: number;
  address?: string;
  isActive: boolean;
}

export interface PoiImage {
  id: number;
  poiId: number;
  fileName: string;
  imageUrl: string;
  orderIndex: number;
  isPrimary: boolean;
}

export interface PoiAudio {
  id: number;
  poiId: number;
  languageCode: string;
  fileName: string;
  audioUrl: string;
  format: string;
  durationSeconds: number;
  isPrerecorded: boolean;
}

export interface PoiTranslation {
  id: number;
  poiId: number;
  languageCode: string;
  title: string;
  description: string;
  narrationScript: string;
}

export interface Poi {
  id: number;
  code: string;
  name: string;
  wardId?: number;
  busStopId?: number;
  latitude: number;
  longitude: number;
  radiusMeters: number; // 20 - 300m (default 50m)
  priority: number; // 1 - 5 (default 3)
  cooldownMinutes?: number;
  status: PoiStatus;
  version: number;
  isDeleted: boolean;
  translations?: PoiTranslation[];
  audios?: PoiAudio[];
  images?: PoiImage[];
  ward?: Ward;
  busStop?: BusStop;
}

export interface Tour {
  id: number;
  code: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  estimatedMinutes: number;
  status: TourStatus;
  version: number;
  pois?: { poi: Poi; orderIndex: number }[];
}

export interface QrCode {
  id: number;
  code: string;
  poiId: number;
  busStopId?: number;
  label?: string;
  isActive: boolean;
  scanCount: number;
  poi?: Poi;
  busStop?: BusStop;
}

export interface OfflinePackage {
  id: number;
  code: string;
  name: string;
  wardId?: number;
  tourId?: number;
  languageCode?: string;
  packageType: 'MEDIA_IMAGES' | 'AUDIO_LANG' | 'FULL_BUNDLE';
  version: number;
  fileSizeBytes: number;
  checksumSha256: string;
  status: PackageStatus;
}

export interface ConversationMessage {
  id: number;
  sessionId: number;
  senderType: 'USER' | 'ASSISTANT';
  inputType: 'VOICE' | 'TEXT';
  content: string;
  audioUrl?: string;
  createdAt: string;
}

export interface ConversationSession {
  id: number;
  deviceId: string;
  currentPoiId?: number;
  languageCode: string;
  sessionTitle?: string;
  startedAt: string;
  messages?: ConversationMessage[];
}

export interface AppUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string;
  phoneNumber?: string;
  provider?: 'LOCAL' | 'GOOGLE' | 'APPLE' | 'FACEBOOK';
}
