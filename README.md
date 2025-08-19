# LinkerJS

`LinkerJS`, **[Axios](https://axios-http.com/)** üzerine inşa edilmiş, zincirleme metotlar (method chaining) ile API isteklerini daha basit ve okunabilir hale getirmek için tasarlanmış modern bir JavaScript/TypeScript kütüphanesidir.

## Kurulum

`LinkerJS` bağımsız bir kütüphane olmadığı için, öncelikle bağımlılığı olan `axios`'u projenize eklemeniz gerekir.

```bash
npm install axios
# veya
yarn add axios
```

## Kullanım

`LinkerJS`'i projenizde kullanmak için aşağıdaki gibi içe aktarın (import edin):

```javascript
import LinkerJS from "./path/to/LinkerJS";
// Kütüphaneyi kendi projenizdeki dosyaya giden yolu buraya yazın.
```

### 1\. Temel Kullanım

Bir `LinkerJS` örneği oluşturarak API isteklerinizi kolayca yapabilirsiniz.

```javascript
// Temel URL belirterek bir örnek oluşturun
const api = new LinkerJS('https://api.example.com/v1');

// Veya statik `create` metodu ile
const api = LinkerJS.create('https://api.example.com/v1');

// Zincirleme metotlar kullanarak bir GET isteği yapın
api.path('/users')
   .query({ limit: 10, offset: 0 })
   .get()
   .then(response => {
       console.log(response);
   })
   .catch(error => {
       console.error(error);
   });
```

### 2\. Zincirleme Metotlar (Method Chaining)

`LinkerJS`, API isteklerinizi adım adım yapılandırmanıza olanak tanıyan bir dizi zincirleme metot sunar. Her metot, nesnenin kendisini döndürdüğü için çağrıları ardı ardına ekleyebilirsiniz.

| Metot | Açıklama |
| :--- | :--- |
| **`baseURL(url: string)`** | İsteklerin temel URL'ini ayarlar. |
| **`path(path: string)`** | İsteğin yolunu (`/users`, `/products` gibi) ayarlar. |
| **`id(id: string \| number)`** | İsteğe bir kaynak kimliği (`/users/123` gibi) ekler. |
| **`query(params: Record<string, any>)`** | İsteğe sorgu parametreleri (`?page=1&limit=10`) ekler. Birden fazla çağrıldığında parametreleri birleştirir. |
| **`page(pageNumber: number)`** | Sayfalama için `page` sorgu parametresini ekler. |
| **`data(payload: any)`** | `POST`, `PUT` gibi istekler için gönderilecek veriyi ayarlar. |
| **`header(headers: Record<string, string>)`** | İstek başlıklarını ayarlar. Mevcut başlıkları koruyarak yenilerini ekler. |
| **`timeout(ms: number)`** | İsteğin zaman aşımı süresini (milisaniye cinsinden) ayarlar. |
| **`withCredentials(flag: boolean)`** | Tarayıcıda çerezlerin (cookies) isteklerle birlikte gönderilip gönderilmeyeceğini belirler. |
| **`reset()`** | `resourceId`, `queryParams` ve `requestData` gibi geçici ayarları sıfırlar. Bu, bir önceki isteğin ayarlarının bir sonraki isteği etkilemesini engellemek için kritik öneme sahiptir. |
| **`addInterceptor(onRequest?: any, onResponse?: any)`** | Axios için istek ve yanıt durdurucuları (interceptors) ekler. |

-----

## Örnek Kullanımlar

### GET İsteği

Belirli bir kullanıcının bilgilerini almak için `id` metoduyla birlikte kullanılır.

```javascript
const api = LinkerJS.create('https://api.example.com/v1');

api.path('/users').id(123).get()
    .then(user => console.log('Kullanıcı:', user))
    .catch(error => console.error(error));
```

-----

### POST İsteği

Yeni bir kaynak oluşturmak için `data` metodu ile birlikte kullanılır.

```javascript
const api = new LinkerJS('https://api.example.com/v1');

const newUser = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet.y@example.com'
};

api.path('/users')
   .data(newUser)
   .post()
   .then(createdUser => {
       console.log('Oluşturulan Kullanıcı:', createdUser);
   })
   .catch(error => console.error(error));
```

-----

### PUT ve DELETE İstekleri

Bir kaynağı güncellemek veya silmek için kullanılır.

```javascript
// Güncelleme (PUT)
const updatedData = { email: 'ahmet.yilmaz@example.com' };

api.path('/users')
   .id(123)
   .data(updatedData)
   .put()
   .then(response => console.log('Güncelleme Başarılı:', response))
   .catch(error => console.error(error));

// Silme (DELETE)
api.reset() // Önceki zincirleme ayarlarını sıfırla
   .path('/users')
   .id(123)
   .delete()
   .then(() => console.log('Kullanıcı başarıyla silindi.'))
   .catch(error => console.error(error));
```

### `reset()` Metodunun Kullanımı

**`reset()`** metodu, özellikle aynı `LinkerJS` örneğiyle birden fazla, bağımsız istek yapmanız gerektiğinde çok kullanışlıdır. Bu metot, bir önceki isteğin `id`, `query` ve `data` gibi geçici ayarlarını temizler, böylece bir sonraki isteğin bu ayarlardan etkilenmesini önler.

Aşağıdaki örnekte, **`reset()`** metodu olmadan ne olabileceğini ve bu metotla nasıl doğru bir şekilde zincirleme istekler yapılacağını görebilirsiniz.

```javascript
const api = LinkerJS.create('https://api.example.com/v1');

// Birinci İstek: Belirli bir kullanıcının bilgilerini alalım.
api.path('/users')
   .id(123)
   .get()
   .then(user => {
       console.log('Kullanıcı 123:', user);
   });

// İkinci İstek: Tüm kullanıcıları listeleyelim.
// DİKKAT: `reset()` kullanılmazsa `/users/123` yoluna tekrar istek yapılır.
api.path('/users')
   .get()
   .then(allUsers => {
       // Bu isteğin beklenen sonucu tüm kullanıcılar listesiyken,
       // reset() olmadığı için hala `/users/123` yoluna istek gidecektir.
       console.log('Tüm Kullanıcılar (Hatalı İstek):', allUsers);
   })
   .catch(error => {
       // Bu, sunucunun `/users/123` yolunda bir liste döndürmediği için 404 gibi bir hata ile sonuçlanabilir.
       console.error("Hata:", error.message);
   });

// Doğru Kullanım: `reset()` metodunu ekleyelim.
api.reset(); // Önceki id ve diğer ayarları temizler.

api.path('/users')
   .get()
   .then(allUsers => {
       // Şimdi doğru bir şekilde `/users` yoluna istek gönderildi.
       console.log('Tüm Kullanıcılar (Doğru İstek):', allUsers);
   });
```


-----

### `addInterceptor()` Metodunun Kullanımı

`addInterceptor` metodu, her istek veya yanıt işlenmeden önce veya sonra çalışacak global fonksiyonlar tanımlamanıza olanak tanır. Bu, kimlik doğrulama tokenı ekleme, yükleme durumunu (loading state) yönetme veya global hata işleme gibi görevler için idealdir.

```javascript
const api = LinkerJS.create('https://api.example.com/v1');

// İstek Interceptor'ı: Her isteğe Authorization başlığı ekler.
const requestInterceptor = (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('İstek gönderiliyor...', config.url);
    return config;
};

// Yanıt Interceptor'ı: Global hataları yönetir ve yükleme durumunu kapatır.
const responseInterceptor = (response) => {
    console.log('Yanıt alındı:', response.status);
    return response;
};

const errorInterceptor = (error) => {
    if (error.response && error.response.status === 401) {
        console.error('Yetkilendirme Hatası! Lütfen tekrar giriş yapın.');
        // Kullanıcıyı oturum açma sayfasına yönlendir vb.
    }
    return Promise.reject(error);
};

// Interceptor'ları LinkerJS örneğine ekleyin.
api.addInterceptor(requestInterceptor, responseInterceptor);
api.addInterceptor(null, errorInterceptor); // Yanıt hatası için ayrı bir interceptor ekleyebilirsiniz.

// Artık yapacağınız tüm istekler bu interceptor'lardan geçecektir.
api.path('/profile').get().then(profile => {
    console.log('Kullanıcı Profili:', profile);
});
```

**Not:** `addInterceptor` metodunu birden fazla kez çağırarak farklı amaçlar için birden fazla interceptor ekleyebilirsiniz. İlk parametre istekler için, ikinci parametre ise başarılı yanıtlar içindir. Hata yanıtları için ise ikinci parametreye bir hata işleyici fonksiyonu verebilirsiniz.


-----

### Dosya Yükleme ve İndirme

`LinkerJS` dosya işlemleri için özel metotlar sunar.

#### `uploadFile` Metodu ile Dosya Yükleme

`LinkerJS` kütüphanesinin en kullanışlı özelliklerinden biri, **tek bir metot çağrısı ile dosya yükleme işlemini kolaylaştırmasıdır.** `uploadFile` metodu, bir `File` nesnesi alır, otomatik olarak bir `FormData` nesnesi oluşturur ve `Content-Type: multipart/form-data` başlığını doğru bir şekilde ayarlar.

##### Temel Kullanım

`uploadFile` metodu, yüklenecek dosyayı ve isteğe bağlı olarak sunucuda kullanılacak alan adını (`fieldName`) parametre olarak alır.

```javascript
const api = LinkerJS.create('https://api.example.com/v1');

// HTML'de bir input elementi olduğunu varsayalım: <input type="file" id="file-input" />
const fileInput = document.getElementById('file-input');

if (fileInput.files.length > 0) {
    const selectedFile = fileInput.files[0];
    const fieldName = 'profileImage'; // Sunucuda dosyayı bekleyen alan adı

    api.path('/users/upload-avatar')
       .uploadFile(selectedFile, fieldName)
       .then(response => {
           console.log('Dosya başarıyla yüklendi:', response);
           // Sunucudan gelen yanıtı işleyebilirsiniz
       })
       .catch(error => {
           console.error('Dosya yükleme hatası:', error.message);
       });
}
```

##### Çoklu Dosya Yükleme

`LinkerJS`, doğrudan çoklu dosya yüklemeyi desteklemese de, bir döngü kullanarak bu işlemi kolayca gerçekleştirebilirsiniz.

```javascript
const api = LinkerJS.create('https://api.example.com/v1');
const fileInput = document.getElementById('multi-file-input'); // <input type="file" multiple />

if (fileInput.files.length > 0) {
    const files = Array.from(fileInput.files);

    const uploadPromises = files.map(file => {
        // Her dosya için ayrı bir istek oluşturun
        return api.path('/files/upload')
                  .uploadFile(file)
                  .then(response => ({
                      fileName: file.name,
                      status: 'Başarılı',
                      data: response
                  }))
                  .catch(error => ({
                      fileName: file.name,
                      status: 'Hata',
                      message: error.message
                  }));
    });

    // Tüm yükleme işlemlerinin bitmesini bekleyin
    Promise.all(uploadPromises)
           .then(results => {
               console.log('Tüm yükleme işlemleri tamamlandı:', results);
           })
           .catch(error => {
               console.error('Toplu yükleme sırasında beklenmedik bir hata oluştu:', error);
           });
}
```


#### Dosya İndirme

`downloadFile` metodu, API'den gelen bir dosyayı otomatik olarak indirir.

```javascript
const api = new LinkerJS('https://api.example.com/v1');

api.path('/reports/2025-08')
   .downloadFile('rapor_2025.pdf')
   .then(() => {
       console.log('Dosya indirme başlatıldı.');
   })
   .catch(error => console.error(error));
```

-----

### Hata Yönetimi

`LinkerJS`, Axios'un hata yönetimini kullanarak, ağ sorunları ve HTTP yanıt hataları için ayrıntılı hata mesajları sağlar.

```javascript
api.get()
   .catch(error => {
       console.error("Hata Yakalandı:", error.message);
       // Çıktı: HATA YAKALANDI: HTTP Hatası 404: {"message":"Not Found"}
       // Veya: HATA YAKALANDI: Sunucuya ulaşılamadı. Ağ hatası olabilir.
   });
```
