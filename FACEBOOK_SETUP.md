# Facebook Lead Ads sozlash yo'riqnomasi

## 1. Meta Business Suite da Lead Form yaratish

1. [Meta Business Suite](https://business.facebook.com) ga kiring
2. Kerakli sahifani tanlang
3. "Ads" bo'limiga o'ting
4. "Lead generation" kampaniyasini yarating
5. Yangi Lead Form yarating va kerakli maydonlarni qo'shing:
   - Full Name (majburiy)
   - Email (majburiy)
   - Phone Number (ixtiyoriy)

## 2. Facebook App sozlamalari

1. [Meta for Developers](https://developers.facebook.com) ga kiring
2. "My Apps" dan yaratilgan app ni tanlang (ID: 1308744633608752)
3. App Settings > Basic settings da quyidagi ma'lumotlarni tekshiring:
   - App ID
   - App Secret
   - Privacy Policy URL (kerak bo'lsa)

4. Products > Lead Ads ni yoqing:
   - "leads_retrieval" va "leads_retrieval" permissionlarini qo'shing
   - Webhook endpointini ulang: `https://your-domain.com/api/webhook/facebook`
   - Verify token sifatida `.env` dagi `FACEBOOK_VERIFY_TOKEN` ni kiriting

## 3. Permissions va Roles

1. App ro'yxatdan o'tkazilganligini tekshiring
2. Quyidagi permissionlarni qo'shing:
   - `pages_manage_ads`
   - `pages_show_list`
   - `leads_retrieval`
   - `pages_read_engagement`

## 4. Webhook tekshirish

Webhook to'g'ri ishlayotganini tekshirish uchun:

1. Facebook Developer platformasida "Webhook" bo'limiga o'ting
2. "Test" tugmasini bosing
3. Sample payloadni yuborish orqali webhook ni test qiling

## 5. Lead Form ID ni olish

Lead formni yaratganingizdan so'ng:
1. Form ID ni nusxalab oling (bu backend da kerak bo'ladi)
2. Test lead yaratib ko'ring
3. Backend logs da lead qabul qilinganini tekshiring

## Xatolar bo'lsa

1. App Access Token yangilash kerak bo'lishi mumkin
2. Permissions to'liq berilmaganligini tekshiring
3. Webhook endpoint URL to'g'ri ekanligini tekshiring
4. SSL sertifikat borligiga ishonch hosil qiling (production da)
