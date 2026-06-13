import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed', // vi không có prefix, en có /en

  pathnames: {
    // Home
    '/': '/',

    // Dynamic destination/product slug
    '/[slug]': {
      vi: '/[slug]',
      en: '/[slug]',
    },

    // Destinations
    '/destinations': {
      vi: '/diem-den',
      en: '/destinations',
    },

    // Cart
    '/cart': {
      vi: '/gio-hang',
      en: '/cart',
    },

    // Checkout
    '/checkout': {
      vi: '/thanh-toan',
      en: '/checkout',
    },

    // Review
    '/review': {
      vi: '/danh-gia',
      en: '/review',
    },

    // Data Calculator
    '/data-calculator': {
      vi: '/cong-cu-tinh-data',
      en: '/data-usage-calculator',
    },

    // What is eSIM
    '/what-is-esim': {
      vi: '/esim-la-gi',
      en: '/what-is-esim',
    },

    // Coupon
    '/coupon': {
      vi: '/ma-giam-gia',
      en: '/coupon',
    },

    // Blog
    '/blog': {
      vi: '/blog',
      en: '/blog',
    },
    '/blog/[slug]': {
      vi: '/blog/[slug]',
      en: '/blog/[slug]',
    },
    '/blog/[slug]/[parent]': {
      vi: '/blog/[slug]/[parent]',
      en: '/blog/[slug]/[parent]',
    },
    '/blog/search': {
      vi: '/blog/search',
      en: '/blog/search',
    },

    // About Us
    '/about-us': {
      vi: '/gioi-thieu',
      en: '/about-us',
    },

    // Press Area
    '/press-area': {
      vi: '/khu-vuc-bao-chi',
      en: '/press-area',
    },

    // Help Center
    '/help-center': {
      vi: '/ho-tro',
      en: '/help-center',
    },
    '/help-center/[slug]': {
      vi: '/ho-tro/[slug]',
      en: '/help-center/[slug]',
    },
    '/help-center/[slug]/[parent]': {
      vi: '/ho-tro/[slug]/[parent]',
      en: '/help-center/[slug]/[parent]',
    },
    '/help-center/categories': {
      vi: '/ho-tro/danh-muc',
      en: '/help-center/categories',
    },
    '/help-center/search': {
      vi: '/ho-tro/tim-kiem',
      en: '/help-center/search',
    },
    '/help-center/support': {
      vi: '/ho-tro/lien-he',
      en: '/help-center/support',
    },
    '/help-center/support/success': {
      vi: '/ho-tro/lien-he/thanh-cong',
      en: '/help-center/support/success',
    },

    // eSIM Supported Devices
    '/esim-supported-devices': {
      vi: '/thiet-bi-ho-tro-esim',
      en: '/esim-supported-devices',
    },

    // Profile
    '/profile': {
      vi: '/ho-so',
      en: '/profile',
    },

    // Payment
    '/payment/result': {
      vi: '/thanh-toan/ket-qua',
      en: '/payment/result',
    },

    // KYC Guide
    '/kyc-guide': {
      vi: '/kyc-guide',
      en: '/kyc-guide',
    },

    // Refer a Friend
    '/refer-a-friend': {
      vi: '/gioi-thieu-ban-be',
      en: '/refer-a-friend',
    },

    // Terms of Service
    '/terms-of-service': {
      vi: '/dieu-khoan-dich-vu',
      en: '/terms-of-service',
    },

    // Legal policies (refund, delivery, terms, privacy)
    '/legal/[slug]': {
      vi: '/phap-ly/[slug]',
      en: '/legal/[slug]',
    },
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathnames = keyof typeof routing.pathnames;
