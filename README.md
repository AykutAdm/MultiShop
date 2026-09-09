<div align="center">

# 🛒 MultiShop

**.NET tabanlı, mikroservis mimarisiyle geliştirilmiş uçtan uca e-ticaret platformu**

Her servis kendi veri yönetiminden sorumludur ve ihtiyaçlarına göre bağımsız veri depolama yaklaşımı kullanır. Merkezi bir API Gateway üzerinden
OAuth 2.0 ile korunur.

<br/>

![.NET](https://img.shields.io/badge/.NET-6.0%20%7C%208.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white)
![Microservices](https://img.shields.io/badge/Architecture-Microservices-FF6B35?style=for-the-badge)

<br/>

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=flat-square&logo=microsoftsqlserver&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=flat-square&logo=rabbitmq&logoColor=white)
![Ocelot](https://img.shields.io/badge/Ocelot-Gateway-6DB33F?style=flat-square)
![IdentityServer4](https://img.shields.io/badge/IdentityServer4-OAuth_2.0-0078D4?style=flat-square)
![SignalR](https://img.shields.io/badge/SignalR-Realtime-512BD4?style=flat-square)

</div>

---

## 📑 İçindekiler

| | |
|---|---|
| [Proje Hakkında](#-proje-hakkında) | [Mimari Desenler](#-mimari-desenler) |
| [Sistem Mimarisi](#-sistem-mimarisi) | [Gerçek Zamanlı ve Mesajlaşma](#-gerçek-zamanlı-ve-mesajlaşma) |
| [Mikroservisler](#-mikroservisler) | [Frontend Katmanı](#-frontend-katmanı) |
| [Veri Katmanı](#-veri-katmanı--polyglot-persistence) | [Teknoloji Yığını](#-teknoloji-yığını) |
| [Kimlik Doğrulama](#-kimlik-doğrulama-ve-yetkilendirme) | [Proje Yapısı](#-proje-yapısı) |

---

## 🎯 Proje Hakkında

MultiShop, monolitik bir e-ticaret uygulamasının mikroservislere bölündüğünde nasıl görüneceğini
uçtan uca gösteren bir referans projedir. Amaç yalnızca "servisleri parçalamak" değil, her servisin
**kendi probleminin gerektirdiği mimariyi ve veri deposunu** seçmesini göstermektir.

Bu yüzden proje içinde tek bir mimari kalıp yoktur:

- Sipariş servisi karmaşık iş akışı içerdiği için **CQRS + MediatR** ile Clean Architecture kullanır.
- Kargo servisi klasik CRUD ağırlıklı olduğu için **N-Tier (katmanlı)** mimariyle yazılmıştır.
- Katalog servisi şemasız ve okuma yoğun olduğu için **MongoDB** üzerinde çalışır.
- Sepet servisi geçici ve hızlı erişim gerektirdiği için **Redis**'te yaşar.
- İndirim servisi basit ve performans odaklı sorgular içerdiği için **Dapper** kullanır.

---

## 🏗 Sistem Mimarisi

Tüm istemci trafiği tek bir kapıdan (Ocelot Gateway) geçer. Gateway, isteği ilgili servise
yönlendirmeden önce JWT'yi doğrular ve rota bazında **scope** kontrolü yapar.

```mermaid
flowchart TB
    subgraph CLIENT["🖥️  İSTEMCİ KATMANI"]
        WEBUI["<b>MultiShop.WebUI</b><br/>ASP.NET Core MVC<br/>Mağaza · Admin · Kullanıcı Paneli<br/><code>:7249</code>"]
    end

    subgraph SECURITY["🔐  KİMLİK KATMANI"]
        IDS["<b>IdentityServer</b><br/>IdentityServer4 · ASP.NET Identity<br/>OAuth 2.0 Token Sağlayıcı<br/><code>:5001</code>"]
    end

    subgraph GATEWAY["🚪  GEÇİT KATMANI"]
        OCELOT["<b>Ocelot API Gateway</b><br/>Routing · JWT Doğrulama · Scope Yetkilendirme<br/><code>:5000</code>"]
    end

    subgraph SERVICES["⚙️  MİKROSERVİS KATMANI"]
        direction LR
        CATALOG["<b>Catalog</b><br/><code>:7070</code>"]
        DISCOUNT["<b>Discount</b><br/><code>:7071</code>"]
        ORDER["<b>Order</b><br/><code>:7072</code>"]
        CARGO["<b>Cargo</b><br/><code>:7073</code>"]
        BASKET["<b>Basket</b><br/><code>:7074</code>"]
        COMMENT["<b>Comment</b><br/><code>:7075</code>"]
        PAYMENT["<b>Payment</b><br/><code>:7076</code>"]
        IMAGES["<b>Images</b><br/><code>:7077</code>"]
        MESSAGE["<b>Message</b><br/><code>:7078</code>"]
    end

    subgraph REALTIME["📡  DESTEK SERVİSLERİ"]
        SIGNALR["<b>SignalR Hub</b><br/>Canlı Sayaçlar<br/><code>:7050</code>"]
        RABBIT["<b>RabbitMQ API</b><br/>Kuyruk İşlemleri<br/><code>:7118</code>"]
    end

    subgraph DATA["🗄️  VERİ KATMANI"]
        direction LR
        MONGO[("MongoDB<br/>Katalog")]
        REDIS[("Redis<br/>Sepet")]
        MSSQL[("SQL Server<br/>Sipariş · Kargo<br/>Yorum · İndirim")]
        POSTGRE[("PostgreSQL<br/>Mesaj")]
        IDDB[("SQL Server<br/>Kimlik")]
    end

    WEBUI -->|"1 · Token talebi"| IDS
    IDS -.->|"2 · access_token"| WEBUI
    WEBUI ==>|"3 · Bearer token ile istek"| OCELOT
    OCELOT -.->|"Token doğrulama"| IDS
    WEBUI -->|"WebSocket"| SIGNALR

    OCELOT ==> CATALOG & DISCOUNT & ORDER & CARGO & BASKET
    OCELOT ==> COMMENT & PAYMENT & IMAGES & MESSAGE

    CATALOG --> MONGO
    BASKET --> REDIS
    ORDER & CARGO & COMMENT & DISCOUNT --> MSSQL
    MESSAGE --> POSTGRE
    IDS --> IDDB
    SIGNALR -.->|"Yorum sayısı"| COMMENT

    classDef client fill:#FFD333,stroke:#B8952A,stroke-width:2px,color:#0B0D10
    classDef security fill:#4E86E8,stroke:#2E5FB8,stroke-width:2px,color:#FFFFFF
    classDef gateway fill:#57C9A4,stroke:#2E9375,stroke-width:2px,color:#0B0D10
    classDef service fill:#2A313B,stroke:#7BA7F5,stroke-width:1.5px,color:#E9ECF1
    classDef realtime fill:#2A313B,stroke:#B98CF0,stroke-width:1.5px,color:#E9ECF1
    classDef store fill:#1A1F27,stroke:#98A1AF,stroke-width:1.5px,color:#E9ECF1

    class WEBUI client
    class IDS security
    class OCELOT gateway
    class CATALOG,DISCOUNT,ORDER,CARGO,BASKET,COMMENT,PAYMENT,IMAGES,MESSAGE service
    class SIGNALR,RABBIT realtime
    class MONGO,REDIS,MSSQL,POSTGRE,IDDB store
```

---

## 🧩 Mikroservisler

Dokuz iş servisi ve iki destek servisi bulunur. Her biri bağımsız olarak derlenir, çalışır ve
kendi veri deposuna sahiptir — servisler arasında doğrudan veritabanı paylaşımı yoktur.

| Servis | Port | Mimari Deseni | Veri Deposu | ORM / Erişim | .NET |
|:---|:---:|:---|:---|:---|:---:|
| 🏷️ **Catalog** | `7070` | Service + AutoMapper | MongoDB | MongoDB.Driver | 6.0 |
| 🎟️ **Discount** | `7071` | Service + Micro-ORM | SQL Server | **Dapper** | 6.0 |
| 📦 **Order** | `7072` | **CQRS + MediatR** / Clean Arch. | SQL Server | EF Core | 6.0 |
| 🚚 **Cargo** | `7073` | **N-Tier** (5 katman) | SQL Server | EF Core + Repository | 6.0 |
| 🛒 **Basket** | `7074` | Service | **Redis** | StackExchange.Redis | 6.0 |
| 💬 **Comment** | `7075` | Service | SQL Server | EF Core | 8.0 |
| 💳 **Payment** | `7076` | Service | — | — | 8.0 |
| 🖼️ **Images** | `7077` | Service | Dosya sistemi | — | 8.0 |
| ✉️ **Message** | `7078` | Service + AutoMapper | **PostgreSQL** | EF Core + Npgsql | 8.0 |
| 📡 **SignalR** | `7050` | Hub | — | — | 8.0 |
| 🐇 **RabbitMQ** | `7118` | Producer / Consumer | — | RabbitMQ.Client | 8.0 |

### Servis Detayları

<details>
<summary><b>🏷️ Catalog — Ürün Kataloğu (MongoDB)</b></summary>

<br/>

Mağazanın tüm vitrin verisini tutar. Şema esnekliği ve okuma performansı gerektirdiği için
ilişkisel değil **doküman veritabanı** seçilmiştir.

**11 koleksiyon:** `Products`, `Categories`, `ProductDetails`, `ProductImages`, `Brands`,
`Features`, `FeatureSliders`, `SpecialOffers`, `OfferDiscounts`, `Abouts`, `Contacts`

**12 controller** ile tam CRUD sağlar. Entity ↔ DTO dönüşümleri **AutoMapper** profilleriyle yapılır.

Ayrıca bir `StatisticsController` üzerinden admin paneline toplu metrik sunar:
`GetProductCount`, `GetCategoryCount`, `GetBrandCount`, `GetProductAvgPrice`,
`GetMaxPriceProductName`, `GetMinPriceProductName`

```
MultiShop.Catalog/
├── Controllers/     → 12 API controller
├── Entities/        → MongoDB doküman modelleri
├── Dtos/            → Result / Create / Update / GetById
├── Mapping/         → AutoMapper profilleri
├── Services/        → İş mantığı
└── Settings/        → DatabaseSettings (connection + koleksiyon adları)
```

</details>

<details>
<summary><b>📦 Order — Sipariş Yönetimi (CQRS + MediatR + Clean Architecture)</b></summary>

<br/>

Projedeki en olgun mimariye sahip servis. Okuma ve yazma sorumlulukları **CQRS** ile ayrılmış,
katmanlar **Clean Architecture** prensiplerine göre düzenlenmiştir. Toplam **16 handler** içerir.

```
Services/Order/
├── Core/
│   ├── MultiShop.Order.Domain/          → Entity'ler (bağımlılıksız çekirdek)
│   └── MultiShop.Order.Application/     → CQRS + MediatR
│       ├── Features/CQRS/               → Address & OrderDetail
│       │   ├── Commands/  Queries/
│       │   ├── Handlers/  Results/
│       └── Features/Mediator/           → Ordering (IRequest / IRequestHandler)
├── Infrastructure/
│   └── MultiShop.Order.Persistence/     → EF Core, DbContext, Repository
└── Presentation/
    └── MultiShop.Order.WebApi/          → Controllers (yalnızca MediatR'a delege eder)
```

İki farklı CQRS yaklaşımı bilinçli olarak bir arada gösterilmiştir: `Features/CQRS` klasöründe
el yazımı handler'lar, `Features/Mediator` klasöründe ise MediatR'ın `IRequest` altyapısı.

</details>

<details>
<summary><b>🚚 Cargo — Kargo Takibi (N-Tier / Katmanlı Mimari)</b></summary>

<br/>

CRUD ağırlıklı bir domain olduğu için klasik **beş katmanlı** mimari tercih edilmiştir.
Her katman ayrı bir `.csproj` projesidir.

```
Services/Cargo/
├── MultiShop.Cargo.EntityLayer/       → Domain entity'leri
├── MultiShop.Cargo.DataAccessLayer/   → Abstract / Concrete / EntityFramework / Repositories
├── MultiShop.Cargo.BusinessLayer/     → Abstract / Concrete / ValidationRules / Extensions
├── MultiShop.Cargo.DtoLayer/          → Veri transfer nesneleri
└── MultiShop.Cargo.WebApi/            → API uç noktaları
```

**Controller'lar:** `CargoCompanies`, `CargoCustomers`, `CargoDetails`, `CargoOperations`

Generic Repository deseni ve `ServiceCollection` extension'ları ile bağımlılık kaydı merkezileştirilmiştir.

</details>

<details>
<summary><b>🛒 Basket — Sepet (Redis)</b></summary>

<br/>

Sepet verisi geçicidir ve çok hızlı okunup yazılması gerekir. Bu yüzden ilişkisel veritabanı yerine
**Redis** üzerinde, kullanıcı kimliğine göre anahtarlanmış olarak tutulur.

```
MultiShop.Basket/
├── Controllers/BasketsController.cs
├── Services/
│   ├── RedisService.cs        → Bağlantı yönetimi (StackExchange.Redis)
│   ├── BasketService.cs       → Sepet okuma / yazma / silme
│   └── LoginService.cs        → Token'dan kullanıcı kimliği çözümleme
├── Dtos/  → BasketItemDto, BasketTotalDto
└── Settings/RedisSettings.cs
```

Sepet, JWT içindeki `sub` claim'i ile ilişkilendirilir — yani her kullanıcı yalnızca kendi sepetini görür.

</details>

<details>
<summary><b>🎟️ Discount — İndirim Kuponları (Dapper)</b></summary>

<br/>

Basit ve okuma yoğun sorgular içerdiği için tam ORM yerine **Dapper** micro-ORM kullanılmıştır.
EF Core yalnızca migration üretmek için bulundurulur; çalışma zamanında sorgular ham SQL ile döner.

Kupon kodu doğrulama akışı sepet toplamına indirim oranını uygular ve sonucu WebUI'ye döndürür.

</details>

<details>
<summary><b>✉️ Message — Mesajlaşma (PostgreSQL)</b></summary>

<br/>

Kullanıcı ile yönetim arasındaki mesajlaşmayı yönetir. Projedeki tek **PostgreSQL** servisidir —
farklı bir ilişkisel veritabanının aynı mimaride nasıl yaşayabileceğini göstermek için seçilmiştir.

**Controller'lar:** `UserMessage` (gelen/giden kutusu), `UserMessageStatistics` (okunmamış sayacı)

</details>

<details>
<summary><b>💬 Comment · 💳 Payment · 🖼️ Images</b></summary>

<br/>

**Comment** — Ürün yorumlarını SQL Server üzerinde EF Core ile yönetir. `CommentStatistics`
controller'ı toplam yorum sayısını döner; bu değer SignalR üzerinden admin paneline canlı yansıtılır.

**Payment** — Ödeme adımının iskeletini barındırır. Şu an veri deposu kullanmaz.

**Images** — Ürün görsellerinin sunumundan sorumludur, dosya sistemi üzerinde çalışır.

</details>

---

## 🗄 Veri Katmanı — Polyglot Persistence

Projenin en belirgin mimari kararı: **her servis kendi problemine uygun veri deposunu seçer.**
Tek bir merkezi veritabanı yoktur, servisler birbirinin verisine doğrudan erişemez.

```mermaid
flowchart LR
    subgraph DOC["📄 Doküman"]
        C["Catalog"] --> M[("MongoDB<br/><code>:27017</code><br/>MultiShopCatalogDb")]
    end

    subgraph MEM["⚡ Bellek İçi"]
        B["Basket"] --> R[("Redis<br/><code>:6379</code>")]
    end

    subgraph REL["🗃️ İlişkisel — SQL Server"]
        O["Order"] --> S1[("<code>:1440</code><br/>OrderDb")]
        CA["Cargo"] --> S2[("<code>:1441</code><br/>CargoDb")]
        CM["Comment"] --> S3[("<code>:1442</code><br/>CommentDb")]
        D["Discount"] --> S4[("SQLEXPRESS<br/>DiscountDb")]
        I["Identity"] --> S5[("IdentityDb")]
    end

    subgraph PG["🐘 İlişkisel — PostgreSQL"]
        MS["Message"] --> P[("PostgreSQL<br/><code>:5432</code><br/>MessageDb")]
    end

    classDef svc fill:#2A313B,stroke:#7BA7F5,stroke-width:1.5px,color:#E9ECF1
    classDef db fill:#1A1F27,stroke:#FFD333,stroke-width:1.5px,color:#E9ECF1
    class C,B,O,CA,CM,D,I,MS svc
    class M,R,S1,S2,S3,S4,S5,P db
```

| Veri Deposu | Kullanan Servis | Neden Seçildi |
|:---|:---|:---|
| **MongoDB** | Catalog | Şemasız ürün verisi, okuma yoğun vitrin sorguları |
| **Redis** | Basket | Geçici veri, milisaniyelik erişim, TTL desteği |
| **SQL Server** | Order, Cargo, Comment, Discount, Identity | İlişkisel bütünlük, transaction ihtiyacı |
| **PostgreSQL** | Message | Farklı bir RDBMS'in aynı mimaride birlikte çalışabilirliği |

> **Not:** Order, Cargo ve Comment servisleri farklı portlarda (`1440`, `1441`, `1442`) ayrı SQL Server
> örneklerine bağlanır — yani mantıksal ayrım fiziksel ayrımla da desteklenmiştir.

---

## 🔐 Kimlik Doğrulama ve Yetkilendirme

Kimlik doğrulama **IdentityServer4** ile OAuth 2.0 üzerinden yapılır. İki farklı grant type,
iki farklı kullanıcı senaryosuna hizmet eder.

### Token Akışı

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 Kullanıcı
    participant W as 🖥️ WebUI
    participant I as 🔐 IdentityServer
    participant G as 🚪 Ocelot Gateway
    participant S as ⚙️ Mikroservis

    rect rgba(255,211,51,0.08)
    note over U,I: Giriş yapan kullanıcı — ResourceOwnerPassword
    U->>W: Kullanıcı adı + parola
    W->>I: POST /connect/token<br/>(grant_type=password)
    I->>I: ASP.NET Identity ile doğrula
    I-->>W: access_token + refresh_token
    W->>W: Token'ı HttpOnly cookie'ye yaz
    end

    rect rgba(123,167,245,0.10)
    note over W,S: Korumalı kaynağa erişim
    U->>W: Ürünleri listele
    W->>W: ResourceOwnerPasswordTokenHandler<br/>Bearer header ekler
    W->>G: GET /services/catalog/products
    G->>I: Token imzasını doğrula
    I-->>G: ✔ Geçerli
    G->>G: Rota scope'unu kontrol et<br/>(CatalogFullPermission)
    G->>S: İsteği downstream'e ilet
    S-->>G: 200 OK + veri
    G-->>W: Yanıt
    W-->>U: Sayfayı render et
    end

    rect rgba(220,75,69,0.10)
    note over W,I: Token süresi dolduysa
    G-->>W: 401 Unauthorized
    W->>I: refresh_token ile yenile
    I-->>W: Yeni access_token
    W->>G: İsteği tekrarla
    end
```

### İstemci Tanımları

| Client | Grant Type | Senaryo | Yetki Kapsamı |
|:---|:---|:---|:---|
| `MultiShopVisitorId` | **ClientCredentials** | Giriş yapmamış ziyaretçi | Katalog okuma, yorum, görsel |
| `MultiShopManagerId` | **ResourceOwnerPassword** | Mağaza yöneticisi | Tüm servisler |
| `MultiShopAdminId` | **ResourceOwnerPassword** | Sistem yöneticisi | Tüm servisler (`AccessTokenLifetime` 600 sn) |

Ziyaretçi trafiği `ClientCredentialTokenHandler`, giriş yapmış kullanıcı trafiği ise
`ResourceOwnerPasswordTokenHandler` adlı iki `DelegatingHandler` tarafından otomatik olarak
token ile zenginleştirilir. Controller'larda elle token yönetimi yapılmaz.

### API Kaynakları ve Scope'lar

Her mikroservis için ayrı bir `ApiResource` ve ona bağlı scope tanımlıdır:

```
ResourceCatalog  → CatalogFullPermission, CatalogReadPermission
ResourceDiscount → DiscountFullPermission     ResourceOrder   → OrderFullPermisson
ResourceCargo    → CargoFullPermission        ResourceBasket  → BasketFullPermission
ResourceComment  → CommentFullPermission      ResourcePayment → PaymentFullPermission
ResourceImage    → ImageFullPermission        ResourceMessage → MessageFullPermission
ResourceOcelot   → OcelotFullPermission
```

---

## 🚪 API Gateway

**Ocelot 25.0** tabanlı geçit, dış dünyaya tek bir adres sunar (`http://localhost:5000`) ve
istekleri servis portlarına yönlendirir. Her rota bağımsız olarak JWT ile korunur ve
kendi scope'unu talep eder.

| Upstream (dışarıya açık) | Downstream (iç servis) | Gerekli Scope |
|:---|:---:|:---|
| `/services/catalog/{everything}` | `localhost:7070` | `CatalogFullPermission` |
| `/services/discount/{everything}` | `localhost:7071` | `DiscountFullPermission` |
| `/services/order/{everything}` | `localhost:7072` | `OrderFullPermisson` |
| `/services/cargo/{everything}` | `localhost:7073` | `CargoFullPermission` |
| `/services/basket/{everything}` | `localhost:7074` | `BasketFullPermission` |
| `/services/comment/{everything}` | `localhost:7075` | `CommentFullPermission` |
| `/services/payment/{everything}` | `localhost:7076` | `PaymentFullPermission` |
| `/services/images/{everything}` | `localhost:7077` | `ImageFullPermission` |
| `/services/message/{everything}` | `localhost:7078` | `MessageFullPermission` |

Tüm rotalar `GET`, `POST`, `PUT`, `DELETE` metotlarını kabul eder ve
`OcelotAuthenticationScheme` adlı JWT şeması ile doğrulanır.

---

## 🎨 Mimari Desenler

Proje bilinçli olarak **birden fazla mimari yaklaşımı** bir arada barındırır.

```mermaid
flowchart TB
    subgraph A["📦 Order · CQRS + Clean Architecture"]
        direction TB
        A1["Controller"] --> A2["MediatR<br/>ISender"]
        A2 --> A3["Command Handler<br/><i>yazma</i>"]
        A2 --> A4["Query Handler<br/><i>okuma</i>"]
        A3 --> A5["Repository"]
        A4 --> A5
        A5 --> A6[("EF Core")]
    end

    subgraph B["🚚 Cargo · N-Tier"]
        direction TB
        B1["WebApi"] --> B2["BusinessLayer<br/><i>Abstract / Concrete</i>"]
        B2 --> B3["DataAccessLayer<br/><i>Generic Repository</i>"]
        B3 --> B4["EntityLayer"]
        B4 --> B5[("EF Core")]
    end

    subgraph C["🏷️ Catalog · Service + Mapper"]
        direction TB
        C1["Controller"] --> C2["Service"]
        C2 --> C3["AutoMapper<br/><i>Entity ↔ DTO</i>"]
        C3 --> C4[("MongoDB Driver")]
    end

    classDef box fill:#1A1F27,stroke:#7BA7F5,stroke-width:1.5px,color:#E9ECF1
    class A1,A2,A3,A4,A5,A6,B1,B2,B3,B4,B5,C1,C2,C3,C4 box
```

| Desen | Uygulandığı Yer |
|:---|:---|
| **CQRS** | Order — komut ve sorgu sorumluluklarının ayrılması |
| **Mediator** | Order — MediatR ile controller/handler gevşek bağlantısı |
| **Clean Architecture** | Order — Domain, Application, Infrastructure, Presentation |
| **N-Tier** | Cargo — beş ayrı proje olarak katmanlama |
| **Repository** | Cargo, Order — veri erişiminin soyutlanması |
| **DTO** | Tüm servisler — entity'lerin dışarı sızmaması |
| **API Gateway** | Ocelot — tek giriş noktası, çapraz kesen ilgiler |
| **Polyglot Persistence** | Servis başına uygun veri deposu |
| **Delegating Handler** | WebUI — token enjeksiyonunun merkezileştirilmesi |
| **View Component** | WebUI — parçalı ve yeniden kullanılabilir arayüz blokları |

---

## 📡 Gerçek Zamanlı ve Mesajlaşma

### SignalR

Admin paneli, yorum sayısı gibi metrikleri sayfa yenilemeden görür. `SignalRHub`, bağlı tüm
istemcilere `ReceiveCommentCount` olayını yayınlar.

```mermaid
sequenceDiagram
    participant M as 👤 Müşteri
    participant CS as 💬 Comment Servisi
    participant H as 📡 SignalR Hub
    participant A as 🖥️ Admin Paneli

    M->>CS: Yeni yorum gönder
    CS->>H: Toplam yorum sayısını sorgula
    H-->>A: ReceiveCommentCount (WebSocket)
    A->>A: Sayacı anında güncelle
```

### RabbitMQ

RabbitMQ, projede producer/consumer yapısını deneyimlemek amacıyla eklenmiş bağımsız bir entegrasyon örneğidir. Ana mikroservis akışının bir parçası değildir.

---

## 🖥 Frontend Katmanı

`MultiShop.WebUI`, üç ayrı deneyimi tek bir ASP.NET Core MVC uygulamasında barındırır.

```mermaid
flowchart LR
    subgraph UI["MultiShop.WebUI"]
        direction TB
        STORE["🛍️ <b>Mağaza</b><br/>Vitrin · Ürün · Sepet · Ödeme"]
        ADMIN["⚙️ <b>Admin Alanı</b><br/>16 controller · 42 view"]
        USER["👤 <b>Kullanıcı Alanı</b><br/>Siparişler · Mesajlar · Profil"]
    end

    subgraph LAYER["Servis İstemci Katmanı"]
        HTTP["29 adet Typed HttpClient"]
        HANDLER["2 adet DelegatingHandler<br/>otomatik token enjeksiyonu"]
    end

    STORE & ADMIN & USER --> HTTP
    HTTP --> HANDLER
    HANDLER ==>|"Bearer token"| GW["🚪 Ocelot Gateway"]

    classDef ui fill:#FFD333,stroke:#B8952A,stroke-width:2px,color:#0B0D10
    classDef mid fill:#1A1F27,stroke:#7BA7F5,stroke-width:1.5px,color:#E9ECF1
    class STORE,ADMIN,USER ui
    class HTTP,HANDLER,GW mid
```

**Öne çıkan özellikler**

- 🌍 **Çok dilli destek** — `tr`, `en`, `de`, `fr`, `it` (varsayılan Türkçe), `IViewLocalizer` ile
- 🎨 **Premium koyu tema** — mağaza, admin ve kullanıcı paneli için ortak tasarım dili
- 🧩 **View Component mimarisi** — her arayüz bloğu bağımsız olarak veri çeker ve render edilir
- 🍪 **Çift cookie şeması** — `MultiShopJwt` (API token) ve `MultiShopCookie` (oturum)
- 📊 **Canlı istatistik paneli** — Catalog, Discount, Message ve Identity servislerinden toplu metrik

---

## 🛠 Teknoloji Yığını

<table>
<tr><td valign="top" width="50%">

**Backend**
- .NET 6.0 / .NET 8.0
- ASP.NET Core Web API
- ASP.NET Core MVC
- Entity Framework Core
- Dapper
- AutoMapper
- MediatR

</td><td valign="top" width="50%">

**Altyapı**
- Ocelot API Gateway
- IdentityServer4 (OAuth 2.0)
- MongoDB · Redis
- SQL Server · PostgreSQL
- RabbitMQ
- SignalR
- Swagger / OpenAPI

</td></tr>
</table>

---

## 📁 Proje Yapısı

```
MultiShop/
│
├── ApiGateway/
│   └── MultiShop.OcelotGateway/         # Ocelot yapılandırması ve JWT doğrulama
│
├── IdentityServer/
│   └── MultiShop.IdentityServer/        # IdentityServer4 + ASP.NET Identity
│       ├── Config.cs                    # Client, ApiResource ve Scope tanımları
│       ├── Controllers/                 # Login, Register, Users, Statistics
│       └── Tools/                       # JWT üretimi ve yardımcı sınıflar
│
├── Services/
│   ├── Basket/       MultiShop.Basket            # Redis
│   ├── Cargo/        (5 katmanlı proje)          # N-Tier
│   ├── Catalog/      MultiShop.Catalog           # MongoDB
│   ├── Comment/      MultiShop.Comment           # SQL Server
│   ├── Discount/     MultiShop.Discount          # Dapper
│   ├── Images/       MultiShop.Images
│   ├── Message/      MultiShop.Message           # PostgreSQL
│   ├── Order/        Core · Infrastructure · Presentation   # CQRS
│   ├── Payment/      MultiShop.Payment
│   ├── RabbitMQ/     MultiShop.RabbitMQ
│   └── SignalR/      MultiShop.SignalR
│
├── Frontends/
│   ├── MultiShop.DtoLayer/              # Servisler arası paylaşılan DTO'lar
│   └── MultiShop.WebUI/
│       ├── Areas/Admin/                 # Yönetim paneli
│       ├── Areas/User/                  # Kullanıcı paneli
│       ├── Controllers/                 # Mağaza controller'ları
│       ├── Handlers/                    # Token DelegatingHandler'ları
│       ├── Services/                    # 29 typed HttpClient istemcisi
│       ├── ViewComponents/              # Parçalı arayüz bileşenleri
│       └── Resources/                   # Çok dilli kaynak dosyaları
│
└── MultiShop.sln
```

---

### 📸 Ekran Görüntüleri

<div align="center">

**Mağaza — Ana Sayfa**

<img src="docs/images/anasayfa.png" alt="MultiShop ana sayfa" width="900"/>

<br/><br/>

</div>

<table>
<tr>
<td width="50%" align="center">
<b>Yönetim Paneli</b><br/><br/>
<img src="docs/images/admin-panel.png" alt="Admin paneli" width="100%"/>
</td>
<td width="50%" align="center">
<b>Kullanıcı Paneli</b><br/><br/>
<img src="docs/images/kullanici-panel.png" alt="Kullanıcı paneli" width="100%"/>
</td>
</tr>
</table>


<div align="center">
  
Bu proje işinize yaradıysa ⭐ vermeyi unutmayın

</div>
