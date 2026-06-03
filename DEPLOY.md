# Deploy GymUp

## 1. Buat database Supabase

1. Buka Supabase dan buat project baru.
2. Buka SQL Editor.
3. Jalankan isi file `supabase/schema.sql`.
4. Buka Authentication > Providers.
5. Pastikan Anonymous Sign-ins aktif.

## 2. Siapkan environment

Copy `.env.example` menjadi `.env.local`, lalu isi:

```bash
VITE_SUPABASE_URL=isi_project_url_supabase
VITE_SUPABASE_ANON_KEY=isi_anon_key_supabase
VITE_ENABLE_REMOTE_SYNC=true
```

Untuk Vercel, isi value yang sama di Project Settings > Environment Variables.

## 3. Deploy ke Vercel

Build command:

```bash
pnpm build
```

Output directory:

```bash
dist
```

## Catatan data

- App tetap local-first dan tetap bisa dipakai tanpa Supabase.
- Jika env Supabase diisi, data `exercises`, `workouts`, dan `sessions` otomatis tersinkron ke database.
- Sesi aktif tidak disinkronkan karena dianggap state sementara di device.
