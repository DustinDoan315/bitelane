import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export type SupportedLanguage = 'en' | 'vi';

const resources = {
  en: {
    translation: {
      tabs: {
        discover: 'Discover',
        route: 'Route',
        saved: 'Saved',
        profile: 'Profile',
      },
      onboarding: {
        subtitle: 'Your next meal, already on the way.',
        body: 'Find food that fits your route, budget, and mood without wasting time deciding.',
        cta: 'Start exploring',
      },
      discover: {
        eyebrow: 'ON YOUR WAY',
        title: 'Find your next meal.',
        subtitle: 'Good food that fits your route, budget, and mood.',
        routeLabel: 'YOUR ROUTE',
        routeEmpty: 'Set a route to personalize recommendations',
        routeSummary: '{{origin}} → {{destination}}',
        recommendations: 'Recommended for you',
        refresh: 'Refresh',
      },
      route: {
        title: 'Your route',
        subtitle: 'Tell us where you are going and we will find food along the way.',
        locations: 'Locations',
        originPlaceholder: 'Starting point',
        destinationPlaceholder: 'Destination',
        preferences: 'Preferences',
        budget: 'Budget',
        budgets: {
          any: 'Any budget',
          value: 'Good value',
          premium: 'Premium',
        },
        moodPlaceholder: 'Mood (optional)',
        update: 'Update recommendations',
      },
      saved: {
        title: 'Saved meals',
        emptyTitle: 'No saved meals yet',
        emptyMessage: 'Bookmark a recommendation and it will appear here.',
      },
      profile: {
        title: 'Profile',
        subtitle: 'Personal preferences will live here.',
        language: 'Language',
        notifications: 'Notifications',
        help: 'Help & feedback',
        privacy: 'Privacy',
        comingSoon: 'Coming soon',
      },
      meal: {
        distance: '{{minutes}} min detour',
        save: 'Save meal',
        remove: 'Remove from saved meals',
      },
      meals: {
        meal1: {
          name: 'Cơm tấm sườn nướng',
          cuisine: 'Vietnamese · Rice',
          venue: 'Bếp Nhà Lane',
          reason: 'Fast, filling, and close to your route',
        },
        meal2: {
          name: 'Bún bò Huế',
          cuisine: 'Vietnamese · Noodles',
          venue: 'Món Ngon Corner',
          reason: 'A warm, spicy pick for a low-key lunch',
        },
        meal3: {
          name: 'Salmon grain bowl',
          cuisine: 'Healthy · Bowl',
          venue: 'Green Stop',
          reason: 'A lighter option with a premium feel',
        },
      },
    },
  },
  vi: {
    translation: {
      tabs: {
        discover: 'Khám phá',
        route: 'Tuyến đường',
        saved: 'Đã lưu',
        profile: 'Cá nhân',
      },
      onboarding: {
        subtitle: 'Món ngon tiếp theo, ngay trên đường đi.',
        body: 'Tìm món ăn hợp với tuyến đường, ngân sách và tâm trạng mà không mất thời gian đắn đo.',
        cta: 'Bắt đầu khám phá',
      },
      discover: {
        eyebrow: 'TRÊN ĐƯỜNG ĐI',
        title: 'Tìm món ăn tiếp theo.',
        subtitle: 'Món ngon hợp với tuyến đường, ngân sách và tâm trạng của bạn.',
        routeLabel: 'TUYẾN ĐƯỜNG',
        routeEmpty: 'Thiết lập tuyến đường để cá nhân hóa gợi ý',
        routeSummary: '{{origin}} → {{destination}}',
        recommendations: 'Gợi ý cho bạn',
        refresh: 'Làm mới',
      },
      route: {
        title: 'Tuyến đường của bạn',
        subtitle: 'Cho chúng tôi biết bạn đang đi đâu để tìm món ăn trên đường.',
        locations: 'Địa điểm',
        originPlaceholder: 'Điểm bắt đầu',
        destinationPlaceholder: 'Điểm đến',
        preferences: 'Tùy chọn',
        budget: 'Ngân sách',
        budgets: {
          any: 'Mọi mức giá',
          value: 'Tiết kiệm',
          premium: 'Cao cấp',
        },
        moodPlaceholder: 'Tâm trạng (không bắt buộc)',
        update: 'Cập nhật gợi ý',
      },
      saved: {
        title: 'Món đã lưu',
        emptyTitle: 'Chưa có món đã lưu',
        emptyMessage: 'Lưu một gợi ý để món ăn xuất hiện ở đây.',
      },
      profile: {
        title: 'Cá nhân',
        subtitle: 'Tùy chọn cá nhân sẽ được hiển thị ở đây.',
        language: 'Ngôn ngữ',
        notifications: 'Thông báo',
        help: 'Trợ giúp & phản hồi',
        privacy: 'Quyền riêng tư',
        comingSoon: 'Sắp ra mắt',
      },
      meal: {
        distance: 'đi vòng {{minutes}} phút',
        save: 'Lưu món ăn',
        remove: 'Bỏ khỏi món đã lưu',
      },
      meals: {
        meal1: {
          name: 'Cơm tấm sườn nướng',
          cuisine: 'Món Việt · Cơm',
          venue: 'Bếp Nhà Lane',
          reason: 'Nhanh, no bụng và gần tuyến đường của bạn',
        },
        meal2: {
          name: 'Bún bò Huế',
          cuisine: 'Món Việt · Mì',
          venue: 'Góc Món Ngon',
          reason: 'Lựa chọn nóng hổi, cay nhẹ cho bữa trưa thư thả',
        },
        meal3: {
          name: 'Tô ngũ cốc cá hồi',
          cuisine: 'Lành mạnh · Tô',
          venue: 'Green Stop',
          reason: 'Nhẹ nhàng hơn với cảm giác cao cấp',
        },
      },
    },
  },
} as const;

const deviceLanguage = getLocales()[0]?.languageCode?.toLowerCase();
const initialLanguage: SupportedLanguage = deviceLanguage === 'vi' ? 'vi' : 'en';

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  fallbackLng: 'en',
  initImmediate: false,
  interpolation: {
    escapeValue: false,
  },
  lng: initialLanguage,
  resources,
});

export const supportedLanguages: Array<{ code: SupportedLanguage; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
];

export default i18n;
