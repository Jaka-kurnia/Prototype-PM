Bertindaklah sebagai Senior UI/UX Designer dan Frontend Engineer yang menguasai Atlassian Design System (Jira).

Saya memiliki kode Vanilla JS + HTML + CSS yang logikanya sudah berjalan sesuai kebutuhan, namun tampilannya perlu dirombak total agar terlihat profesional, bersih (*clean*), ergonomis, dan setara aplikasi enterprise SaaS modern seperti Jira.

### ATURAN UTAMA (STRICT CONSTRAINTS):
1. **DILARANG MENGUBAH LOGIKA JAVASCRIPT**:
   - Jangan ubah nama variabel, fungsi, alur logika, manipulasi array/objek, atau API call yang ada.
   - Jangan menghapus atau mengganti nama `id`, `class`, atau atribut data (`data-*`) yang digunakan sebagai selector DOM event listener atau query selector JS.
   - Jika butuh selector styling baru, tambahkan class baru khusus CSS tanpa merusak target elemen JS yang lama.

2. **STANDAR DESAIN JIRA (UI/UX Enterprise):**
   - **Tipografi:** Gunakan font stack modern sans-serif (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`), dengan skala hierarki ukuran dan ketebalan (*font-weight*) yang jelas.
   - **Palet Warna:** Terapkan skema warna netral profesional ala Atlassian:
     - Background netral/abu-abu sangat muda (misal `#F4F5F7` atau `#FAFBFC`).
     - Kartu/kontainer putih solid (`#FFFFFF`) dengan border halus (`#DFE1E6` atau `#EBECF0`) dan shadow sangat lembut (*subtle elevation*).
     - Warna primer/aksen biru profesional (misal `#0052CC` atau `#0747A6`).
     - Teks utama kontras tinggi (`#172B4D`) dan teks sekunder/deskripsi (`#6B778C`).
   - **Layout & Spacing:** Terapkan grid/flexbox berbasis sistem 8-point (`8px`, `16px`, `24px`), padding konsisten, serta whitespace yang rapi agar informasi padat namun tetap mudah dibaca (*high data density without clutter*).
   - **Komponen & Mikro-Interaksi:** 
     - Tombol memiliki status hover, active, dan focus ring yang rapi (aksesibilitas WCAG).
     - Badge/tag/pill status dengan warna latar lembut dan teks kontras.
     - Form input dengan border tipis, outline fokus halus, dan label yang tegas.
     - Scrollbar minimalis dan border radius konsisten (biasanya `3px` hingga `6px` untuk gaya enterprise).

3. **STRUKTUR OUTPUT:**
   - Berikan kode **HTML** hasil penyesuaian markup/class styling (tanpa mengubah ID/atribut fungsional).
   - Berikan kode **CSS** lengkap yang terstruktur (gunakan CSS Variables untuk warna, spacing, dan radius).
   - Jika ada bagian kecil pada JS yang mutlak harus tahu penambahan elemen visual pembungkus (*wrapper*), jelaskan secara spesifik tanpa mengacak-acak logika aslinya.

