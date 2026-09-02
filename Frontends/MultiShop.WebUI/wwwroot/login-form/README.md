# login-form

Koyu tema giriş / kayıt formu. Bağımsız bir pakettir — jQuery, Bootstrap veya
Tailwind gerektirmez, sadece bir CSS ve bir JS dosyasından oluşur.

```
login-form/
├── css/login-form.css   ← tema
├── js/login-form.js     ← partikül animasyonu + şifre göster/gizle
├── demo/login.html      ← kopyala-yapıştır giriş şablonu
├── demo/register.html   ← kopyala-yapıştır kayıt şablonu
└── README.md
```

## Başka bir projede kullanma

1. `login-form` klasörünü olduğu gibi projenin statik dosya dizinine kopyalayın
   (ASP.NET Core'da `wwwroot/`, Node/Vite'ta `public/`, düz HTML'de proje kökü).
2. Sayfanıza şu iki satırı ekleyin:

```html
<link rel="stylesheet" href="/login-form/css/login-form.css">
<script src="/login-form/js/login-form.js"></script>
```

3. `<body>` etiketine `lf-page` sınıfını verin ve `demo/login.html` içeriğini
   şablon olarak kullanın.

Bütün sınıf adları `lf-` önekiyle başlar, mevcut CSS'inizle çakışmaz.

## Renkleri değiştirme

Tek yer: `login-form.css` dosyasının başındaki `:root` bloğu.

| Değişken             | İşi                                    |
|----------------------|----------------------------------------|
| `--lf-bg`            | Sayfa ve input zemini                  |
| `--lf-surface`       | Kart zemini                            |
| `--lf-border`        | Kenarlık ve aksan çizgileri            |
| `--lf-text`          | Ana metin + birincil buton zemini      |
| `--lf-on-accent`     | Birincil buton yazı rengi              |
| `--lf-text-soft`     | Açıklama metni                         |
| `--lf-danger`        | Hata metni                             |
| `--lf-radius`        | Kart köşe yuvarlaklığı                 |
| `--lf-card-width`    | Kart genişliği (varsayılan `24rem`)    |

Örneğin lacivert bir tema için sayfanızda şunu yazmanız yeterli:

```html
<style>
  :root {
    --lf-bg: #0b1020;
    --lf-surface: #131a2e;
    --lf-border: #23304f;
  }
</style>
```

> Not: `.lf-separator span` içindeki `background: #1b1b1e` değeri, yarı saydam
> kart zemininin üzerine oturduğu için sabit yazılmıştır. Kart rengini
> değiştirirseniz bu satırı da güncelleyin.

## Yapı taşları

| Sınıf                        | Ne işe yarar                                          |
|------------------------------|-------------------------------------------------------|
| `body.lf-page`               | Koyu zemin, tipografi                                 |
| `.lf-vignette`               | Merkezden dışa açılan hafif ışık                      |
| `.lf-lines`                  | Animasyonlu aksan çizgileri (içine 3 `.lf-hline` + 3 `.lf-vline`, **sıra önemli** — konumlar `nth-child` ile veriliyor) |
| `canvas.lf-particles`        | Yükselen partikül animasyonu                          |
| `.lf-header`                 | Sabit üst bar                                         |
| `.lf-wrapper`                | Kartı ortalayan kapsayıcı                             |
| `.lf-card`                   | Kart (`.lf-card--wide` = geniş varyant, kayıt formu için) |
| `.lf-card-header` / `.lf-card-body` / `.lf-card-footer` | Kart bölümleri      |
| `.lf-field` + `.lf-label` + `.lf-input-wrap` + `.lf-input` | Bir form alanı    |
| `.lf-row`                    | İki alanı yan yana koyar (mobilde alt alta iner)      |
| `.lf-input--toggle` + `.lf-toggle` | Göz ikonlu şifre alanı                          |
| `.lf-input--bare`            | Soldaki ikon boşluğunu kaldırır                       |
| `.lf-meta` + `.lf-check`     | "Beni hatırla" satırı                                 |
| `.lf-btn`                    | Birincil buton (`--outline`, `--ghost` varyantları)   |
| `.lf-btn-grid`               | İki butonu yan yana                                   |
| `.lf-separator`              | Ortasında yazı olan ayırıcı çizgi                     |
| `.lf-alert`                  | Hata / uyarı kutusu                                   |

## Şifre göster/gizle

Butona `data-lf-toggle` verin, değeri hedef input'un `id`'si olsun:

```html
<input class="lf-input lf-input--toggle" id="password" type="password">
<button type="button" class="lf-toggle" data-lf-toggle="password"
        data-lf-label-show="Şifreyi göster" data-lf-label-hide="Şifreyi gizle">
    <svg class="lf-icon-show">...</svg>
    <svg class="lf-icon-hide">...</svg>
</button>
```

Aynı sayfada istediğiniz kadar olabilir. Formu sonradan JS ile eklediyseniz
`LoginForm.init()` çağırarak yeni elemanları bağlayabilirsiniz.

## ASP.NET Core (Razor) notu

`asp-for` tag helper'ı `class`, `type`, `placeholder` gibi öznitelikleri ezmez;
şu şekilde doğrudan kullanabilirsiniz:

```html
<input asp-for="Password" id="Password" type="password"
       class="lf-input lf-input--toggle" placeholder="••••••••">
```

Hata kutusu için `ModelState`'i dolaşın:

```html
@if (!ViewData.ModelState.IsValid)
{
    <div class="lf-alert" role="alert">
        <ul>
        @foreach (var error in ViewData.ModelState.Values.SelectMany(v => v.Errors))
        {
            <li>@error.ErrorMessage</li>
        }
        </ul>
    </div>
}
```

`.field-validation-error` ve `.input-validation-error` sınıfları da temalıdır,
jQuery unobtrusive validation kullanıyorsanız ekstra bir şey yapmanız gerekmez.

## Erişilebilirlik

- Bütün input'ların `<label for>` bağlantısı var.
- Şifre butonları `aria-pressed` ve `aria-label` günceller.
- `prefers-reduced-motion: reduce` açıkken partiküller ve çizgi/kart
  animasyonları devre dışı kalır.

## Tarayıcı desteği

Modern tarayıcılar. `backdrop-filter` desteklemeyen tarayıcılarda kart bulanık
görünmez ama düzen bozulmaz.
