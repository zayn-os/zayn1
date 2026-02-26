# دليل الثيمات (Themes) - الجزء الثاني: مثال تطبيقي (PUBG Theme) 🎮

هذا الدليل يوضح كيفية حقن ثيم متكامل للعبة PUBG Mobile، يشمل الألوان، الأنماط، الأصوات المخصصة، والأنيميشن.

## 1. حقنة الثيم (Theme Injection Payload)

يمكنك نسخ هذا الكود ولصقه في نافذة الـ Oracle (Developer Console) لتطبيق الثيم فوراً.

```json
{
  "themes": [
    {
      "id": "theme_pubg_survival",
      "name": "PUBG Survival",
      "colors": {
        "--color-life-bg": "#1c1c1c",
        "--color-life-black": "#2b2b2b",
        "--color-life-paper": "#3a3a3a",
        "--color-life-text": "#e5e7eb",
        "--color-life-muted": "#9ca3af",
        "--color-life-gold": "#f59e0b",
        "--color-life-easy": "#10b981",
        "--color-life-hard": "#ef4444"
      },
      "soundPack": "pubg",
      "animationStyle": "fast",
      "customCss": "body[data-theme='theme_pubg_survival'] { font-family: 'Impact', sans-serif; } body[data-theme='theme_pubg_survival'] button { border-radius: 2px; text-transform: uppercase; border: 1px solid #f59e0b; box-shadow: 0 0 5px rgba(245, 158, 11, 0.5); } body[data-theme='theme_pubg_survival'] button:active { transform: scale(0.95); box-shadow: inset 0 0 10px rgba(0,0,0,0.5); } body[data-theme='theme_pubg_survival'] .bg-life-gold { background-color: #f59e0b; color: #1c1c1c; font-weight: 900; }",
      "customSounds": {
        "click": "https://actions.google.com/sounds/v1/weapons/gun_cocking.ogg",
        "success": "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
        "level-up": "https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg",
        "crit": "https://actions.google.com/sounds/v1/weapons/explosion_large.ogg"
      }
    }
  ]
}
```

## 2. كيفية الحصول على الأصوات المخصصة
إذا أردت استخدام أصواتك الخاصة، اتبع الخطوات التالية:
1. قم بتحميل الصوت من YouTube أو أي منصة أخرى (بصيغة MP3 أو OGG).
2. قم برفع الصوت على منصة استضافة ملفات مباشرة (مثل GitHub، أو AWS S3، أو أي خدمة توفر رابطاً مباشراً للملف).
3. انسخ الرابط المباشر (Direct Link) وضعه في كائن `customSounds` داخل الـ JSON.

## 3. مثال متقدم: ثيم الفانتازيا (Fantasy Theme) ⚔️
هذا المثال يوضح كيفية تغيير الأيقونات والرموز التعبيرية لتناسب ثيم RPG كلاسيكي.

```json
{
  "themes": [
    {
      "id": "theme_fantasy_rpg",
      "name": "Elder Scrolls",
      "colors": {
        "--color-life-bg": "#2b2118",
        "--color-life-black": "#3d2e22",
        "--color-life-paper": "#5c4b37",
        "--color-life-text": "#f5e6d3",
        "--color-life-muted": "#a89f91",
        "--color-life-gold": "#d4af37",
        "--color-life-easy": "#4caf50",
        "--color-life-hard": "#b71c1c"
      },
      "soundPack": "fantasy",
      "animationStyle": "default",
      "icons": {
        "STR": "⚔️",
        "INT": "📜",
        "DIS": "🛡️",
        "HEA": "🍷",
        "CRT": "🎭",
        "SPR": "✨",
        "REL": "🤝",
        "FIN": "💎",
        "check": "✅",
        "fail": "💀",
        "shield": "🛡️",
        "fire": "🔥"
      },
      "customCss": "body[data-theme='theme_fantasy_rpg'] { font-family: 'Cinzel', serif; } .rounded-xl { border-radius: 4px; border: 2px solid #d4af37; }"
    }
  ]
}
```

## 4. تقسيم محرك الثيمات (Theme Engine Architecture)
نظراً لأن محرك الثيمات أصبح ضخماً ويدعم الأصوات والأنيميشن، تم تقسيمه إلى الأقسام التالية لضمان التوسع المستقبلي:

1. **مدير الثيمات (Theme Manager):** `useThemeManager.ts` - مسؤول عن تطبيق الألوان (CSS Variables) والأنماط المخصصة (`customCss`) والأنيميشن (`animationStyle`).
2. **محرك الصوت (Audio Engine):** `audio.ts` - مسؤول عن تشغيل الأصوات المولدة (Synthesizer) والأصوات المخصصة (`customSounds`) وحزم الأصوات (`soundPack`).
3. **مستودع الثيمات (Theme Data):** `themeData.ts` - يحتوي على الثيمات الافتراضية المدمجة في النظام.
4. **حقن الثيمات (Theme Injector):** `themeHandler.ts` - مسؤول عن استقبال الثيمات الجديدة من الـ Oracle وحفظها في قاعدة البيانات المحلية.

هذا التقسيم يسمح للنظام بتحمل تطورات ضخمة مستقبلاً دون التأثير على الأداء.

---
*تم إعداد هذا الدليل بواسطة نظام Zayn2.*
