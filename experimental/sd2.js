/* =====================================================================
   sd2.js — Stage Director V2 (Aurora) — نسخة تجريبية مستقلة
   ---------------------------------------------------------------------
   الملف ده مش بيعرّف أي دالة بديلة للعبة. كل اللي محتاجه من اللعبة بيدخل
   من SD2.bind({...}) وبيرمي خطأ واضح لو ناقص حاجة مطلوبة.

   نقاط الربط (كلها أسطر قليلة في index.html بتاع النسخة التجريبية):

   0. أول الملف: <script src="sd2.js"></script> وبعده SD2.bind({...}) (تحت).
      و SAVE_KEY = 'neon_sd2_save' في النسخة التجريبية فقط.
   1. Director.update(): خليه يشغّل تحديثات التهديد وإصلاح القاعدة زي ما هي، وغلّف
      مصادر الظهور القديمة (spawnOne / التعويض / التوقيت / الأحداث الجماعية) بـ:
        if (SD2.isActive()) SD2.tick(); else { ...المنطق القديم... }
   2. أول spawnEnemy(type,...):   SD2.guardSpawn(type);
   3. كود تقسيم الـ Splitter:      const c = SD2.spawnChild(childType, () => spawnEnemy(childType,color,lane,t0), parent);
   4. لما الـ Guardian يتولد:      SD2.onGuardianSpawn(e);
   5. killEnemy() جوه if(!e.rewarded) بعد addCoins:  SD2.onKill(e, coins);
   6. منطق خصم S.baseHP لما عدو يوصل:  SD2.onBreach(e, dmg);
���q�^