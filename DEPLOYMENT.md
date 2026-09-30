# Promilmetre Vercel Dağıtım Rehberi (Deployment Guide)

Promilmetre uygulamanızı Vercel üzerinde 2 farklı kolay yöntemle yayınlayabilirsiniz.

---

## Yöntem 1: GitHub / GitLab ile Vercel (Önerilen)

1. **Projeyi GitHub'a Yükleyin**:
   - Kodları GitHub hesabınızdaki bir depoya (repository) push edin.
2. **Vercel'e Giriş Yapın**:
   - [vercel.com](https://vercel.com) adresine gidip **Add New... > Project** seçeneğine tıklayın.
   - GitHub deponuzu seçin ve **Import** butonuna basın.
3. **Ayarlar**:
   - **Framework Preset**: `Vite` (otomatik algılanır).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Deploy**:
   - **Deploy** butonuna tıklayın. 1-2 dakika içinde uygulamanız `promilmetre.vercel.app` şeklinde canlıya alınır!

---

## Yöntem 2: Vercel CLI ile Terminalden Doğrudan Yayınlama

Terminalinizde şu iki komutu çalıştırmanız yeterlidir:

```bash
# Vercel CLI'ı kurun (eğer kurulu değilse)
npm i -g vercel

# Proje dizininde dağıtımı başlatın
vercel
```

Sorulan sorulara `Enter` basarak varsayılan değerleri onaylayın. Dağıtım hemen tamamlanacaktır.

Canlı ortam (Production) için:
```bash
vercel --prod
```

---

## ⚠️ Önemli: Firebase Authorized Domains Ayarı (Google Girişi İçin)

Vercel size bir alan adı verdiğinde (örneğin: `https://promilmetre.vercel.app` veya özel alan adınız):

1. [Firebase Console](https://console.firebase.google.com)'a gidin.
2. Projenizi seçin: `gen-lang-client-0336575591`
3. Sol menüden **Authentication > Settings (Ayarlar) > Authorized domains (Yetkilendirilmiş alan adları)** bölümüne gelin.
4. **Add domain** butonuna tıklayarak Vercel alan adınızı (örneğin: `promilmetre.vercel.app`) ekleyin.

Bu işlem Google ile oturum açmanın Vercel üzerindeki sitenizde sorunsuz çalışmasını sağlar.
