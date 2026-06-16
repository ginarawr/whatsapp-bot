require('dotenv').config();
const {
  Client,
  LocalAuth
} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');


const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/snap/bin/chromium',
        headless: true,
        protocolTimeout: 120000,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    }
});


const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

function formatRupiah(nominal) {
    return Number(nominal)
        .toLocaleString('id-ID');
}

client.on('qr', (qr) => {
    console.log('QR diterima');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log(
        `Bot siap! ${new Date().toLocaleString()}`
    );
});

client.on('auth_failure', msg => {
    console.log('AUTH FAILURE:', msg);
});

client.on('disconnected', reason => {
    console.log('DISCONNECTED:', reason);
});

client.on('message_create', async (message) => {

    try {

        const text = message.body.trim();

        // ==========================
// RESPON UMUM UNTUK SEMUA ORANG
// ==========================

if (
    text.toLowerCase() === 'gin' ||
    text.toLowerCase() === 'gina'
) {

    await client.sendMessage('iya?');

    return;
}
if (
    text.toLowerCase() === 'p' ||
    text.toLowerCase() === 'pp'
) {

    await client.sendMessage('apa?');

    return;
}
if (
    text.toLowerCase() === "assalamu'alaikum" ||
    text.toLowerCase() === "assalamu'alaikum gin" ||
    text.toLowerCase() === "assalamu'alaikum gina" ||
    text.toLowerCase() === 'assalamualaikum' ||
    text.toLowerCase() === 'assalamualaikum gin' ||
    text.toLowerCase() === 'assalamualaikum gina' ||
    text.toLowerCase() === "assalamu'alaikum wr wb" ||
    text.toLowerCase() === 'assalamualaikum wr wb' ||
    text.toLowerCase() === 'assalamualaikum warahmatullahi wabarakatuh'
) {

    await client.sendMessage("iya, wa'alaikumussalam wr wb");

    return;
}

// ==========================
// FINANCE TRACKER HANYA UNTUK PESAN SENDIRI
// ==========================

if (!message.fromMe) {
    return;
}

console.log('====================');
console.log(
    `[${new Date().toLocaleString()}]`,
    text
);
console.log('fromMe:', message.fromMe);
console.log('====================');

        // ==========================
        // TUTORIAL
        // ==========================
        if (text.toLowerCase() === 'tutorial') {

            await client.sendMessage(
`📚 Cara Menggunakan Bot

➕ Tambah Pemasukan

masuk
100000
beasiswa
semester 6

➖ Tambah Pengeluaran

keluar
15000
makan
ayam geprek

💰 Cek Saldo

saldo

📊 Laporan

laporan

📂 Daftar Kategori

kategori

📂 Detail Kategori

kategori makan

📝 Tambah Tugas

tugas
Bab 4
Revisi PSD
20/06/2026
rendah

📋 Daftar Tugas

list tugas

🔍 Detail Tugas

detail 1

Gunakan perintah "tutorial" untuk melihat panduan ini lagi.`
            );

            return;
        }

        // ==========================
        // SALDO
        // ==========================
        if (text.toLowerCase() === 'saldo') {

            const response =
                await axios.get(
                    APPS_SCRIPT_URL
                );

            await client.sendMessage(
                `💰 Saldo Saat Ini\n\nRp${formatRupiah(response.data.saldo)}`
            );

            return;
        }

        // ==========================
        // LAPORAN
        // ==========================
        if (text.toLowerCase() === 'laporan') {

            const response =
                await axios.get(
                    APPS_SCRIPT_URL
                );

            await client.sendMessage(
`📊 Laporan Keuangan

Pemasukan  : Rp${formatRupiah(response.data.pemasukan)}
Pengeluaran: Rp${formatRupiah(response.data.pengeluaran)}
Saldo      : Rp${formatRupiah(response.data.saldo)}`
            );

            return;
        }

        // ==========================
// LIST TUGAS
// ==========================

if (
    text.toLowerCase() ===
    'list tugas'
) {

    const response =
        await axios.get(
            `${APPS_SCRIPT_URL}?action=listTugas`
        );

    const data =
        response.data;

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        await client.sendMessage(
            '📋 Tidak ada tugas aktif'
        );

        return;
    }

    let pesan =
`📋 Daftar Tugas Aktif

`;

    data.forEach(
        (item, index) => {

            let ikon = '🟢';

            if (
                item.prioritas ===
                'tinggi'
            ) {
                ikon = '🔴';
            }

            if (
                item.prioritas ===
                'sedang'
            ) {
                ikon = '🟡';
            }

            pesan +=
`${index + 1}. ${item.namaTugas}
📅 ${item.deadline}
${ikon} ${item.prioritas}

`;
        }
    );

    pesan +=
`Total tugas aktif: ${data.length}`;

    await client.sendMessage(
        pesan
    );

    return;
}

// ==========================
// DETAIL TUGAS
// ==========================

if (
    text.toLowerCase()
        .startsWith('detail ')
) {

    const nomor =
        text
            .replace(
                'detail ',
                ''
            )
            .trim();

    const response =
        await axios.get(
`${APPS_SCRIPT_URL}?action=detailTugas&nomor=${nomor}`
        );

    const tugas =
        response.data;

    if (!tugas) {

        await client.sendMessage(
            'Tugas tidak ditemukan'
        );

        return;
    }

    let ikon = '🟢';

    if (
        tugas.prioritas ===
        'tinggi'
    ) {
        ikon = '🔴';
    }

    if (
        tugas.prioritas ===
        'sedang'
    ) {
        ikon = '🟡';
    }

    await client.sendMessage(
`📋 ${tugas.namaTugas}

📝 ${tugas.deskripsi}

📅 ${tugas.deadline}
${ikon} ${tugas.prioritas}
📌 ${tugas.status}`
    );

    return;
}

        // ==========================
        // DAFTAR KATEGORI
        // ==========================
        if (text.toLowerCase() === 'kategori') {

            await client.sendMessage(
`📂 Daftar Kategori

Pemasukan:
• beasiswa
• shopeefood
• freelance
• hutang
• hadiah

Pengeluaran:
• makan
• cafe
• jajan
• kos
• bensin

Gunakan:

kategori makan`
            );

            return;
        }

        // ==========================
        // DETAIL KATEGORI
        // ==========================
        if (
            text.toLowerCase()
                .startsWith('kategori ')
        ) {

            const kategori =
                text
                    .substring(9)
                    .trim();

            const url =
`${APPS_SCRIPT_URL}?kategori=${encodeURIComponent(kategori)}`;

            console.log(
                'URL kategori:',
                url
            );

            const response =
                await axios.get(url);

            const data =
                response.data;

            if (
                !Array.isArray(data) ||
                data.length === 0
            ) {

                await client.sendMessage(
                    `Kategori "${kategori}" tidak ditemukan`
                );

                return;
            }

            let total = 0;

            let pesan =
`📂 Kategori: ${kategori}

`;

            data.forEach(
                (item, index) => {

                    total += item.nominal;

                    pesan +=
`${index + 1}. Rp${formatRupiah(item.nominal)}
${item.keterangan}

`;
                }
            );

            pesan +=
`Total transaksi: ${data.length}
Total nominal: Rp${formatRupiah(total)}`;

            await client.sendMessage(
                pesan
            );

            return;
        }

        // ==========================
        // TRANSAKSI 4 BARIS
        // ==========================
        const lines =
            text.split('\n');

        console.log(
            'Jumlah baris:',
            lines.length
        );

        console.log(lines);

        // ==========================
// TAMBAH TUGAS
// ==========================

if (lines.length === 5) {

    const command =
        lines[0]
            .trim()
            .toLowerCase();

    if (
        command === 'tugas'
    ) {

        const namaTugas =
            lines[1].trim();

        const deskripsi =
            lines[2].trim();

        const deadline =
            lines[3].trim();

        const prioritas =
            lines[4].trim();

        await axios.post(
            APPS_SCRIPT_URL,
            {
                tipe: 'tugas',
                namaTugas,
                deskripsi,
                deadline,
                prioritas
            }
        );

        await client.sendMessage(
`✅ Tugas Ditambahkan

📋 ${namaTugas}

📝 ${deskripsi}

📅 ${deadline}
📌 ${prioritas}`
        );

        return;
    }
}

// ==========================
// MULAI TUGAS
// ==========================

if (
    text.toLowerCase()
        .startsWith('mulai ')
) {

    const nomor =
        text
            .replace(
                'mulai ',
                ''
            )
            .trim();

    const response =
        await axios.post(
            APPS_SCRIPT_URL,
            {
                tipe: 'updateTugas',
                nomor,
                field: 'status',
                nilaiBaru: 'dikerjakan'
            }
        );

    if (
        response.data.success
    ) {

        await client.sendMessage(
            `✅ Tugas ${nomor} sekarang sedang dikerjakan`
        );

    } else {

        await client.sendMessage(
            '❌ Gagal mengubah status tugas'
        );
    }

    return;
}

// ==========================
// SELESAI TUGAS
// ==========================

if (
    text.toLowerCase()
        .startsWith('selesai ')
) {

    const nomor =
        text
            .replace(
                'selesai ',
                ''
            )
            .trim();

    const response =
        await axios.post(
            APPS_SCRIPT_URL,
            {
                tipe: 'updateTugas',
                nomor,
                field: 'status',
                nilaiBaru: 'selesai'
            }
        );

    if (
        response.data.success
    ) {

        await client.sendMessage(
            `✅ Tugas ${nomor} selesai`
        );

    } else {

        await client.sendMessage(
            '❌ Gagal mengubah status tugas'
        );
    }

    return;
}

    if (
    lines.length === 2 &&
    lines[0]
        .toLowerCase()
        .startsWith('deadline ')
) {

    const nomor =
        lines[0]
            .replace(
                'deadline ',
                ''
            )
            .trim();

    const deadline =
        lines[1]
            .trim();

    const response =
        await axios.post(
            APPS_SCRIPT_URL,
            {
                tipe: 'updateTugas',
                nomor,
                field: 'deadline',
                nilaiBaru: deadline
            }
        );

    await client.sendMessage(
        `📅 Deadline tugas ${nomor} diperbarui menjadi ${deadline}`
    );

    return;
}

if (
    lines.length === 2 &&
    lines[0]
        .toLowerCase()
        .startsWith('prioritas ')
) {

    const nomor =
        lines[0]
            .replace(
                'prioritas ',
                ''
            )
            .trim();

    const prioritas =
        lines[1]
            .trim()
            .toLowerCase();

    const response =
        await axios.post(
            APPS_SCRIPT_URL,
            {
                tipe: 'updateTugas',
                nomor,
                field: 'prioritas',
                nilaiBaru: prioritas
            }
        );

    await client.sendMessage(
        `📌 Prioritas tugas ${nomor} menjadi ${prioritas}`
    );

    return;
}

if (
    lines.length === 2 &&
    lines[0]
        .toLowerCase()
        .startsWith('deskripsi ')
) {

    const nomor =
        lines[0]
            .replace(
                'deskripsi ',
                ''
            )
            .trim();

    const deskripsi =
        lines[1]
            .trim();

    const response =
        await axios.post(
            APPS_SCRIPT_URL,
            {
                tipe: 'updateTugas',
                nomor,
                field: 'deskripsi',
                nilaiBaru: deskripsi
            }
        );

    await client.sendMessage(
        `📝 Deskripsi tugas ${nomor} berhasil diperbarui`
    );

    return;
}

        if (lines.length === 4) {

            const jenis =
                lines[0]
                    .trim()
                    .toLowerCase();

            const nominal =
            Number(
                lines[1]
                    .replace(/rp/gi, '')
                    .replace(/\./g, '')
                    .replace(/,/g, '')
                    .trim()
            );

            const kategori =
                lines[2].trim();

            const keterangan =
                lines[3].trim();

            if (
                (jenis === 'masuk' ||
                 jenis === 'keluar') &&
                !isNaN(nominal)
            ) {

                console.log(
                    'Mengirim ke Apps Script...'
                );

                const response =
                    await axios.post(
                        APPS_SCRIPT_URL,
                        {
                            tipe: 'transaksi',
                            jenis,
                            nominal,
                            kategori,
                            keterangan
                        }
                    );

                console.log(response.data);

if (!response.data.success) {

    await client.sendMessage(
        '❌ Gagal menyimpan transaksi'
    );

    return;
}

await client.sendMessage(
`✅ Transaksi Tersimpan

Jenis      : ${jenis}
Nominal    : Rp${formatRupiah(nominal)}
Kategori   : ${kategori}
Keterangan : ${keterangan}`
);

                return;
            }
        }

    } catch (error) {

        console.error(
            'ERROR:',
            error.message
        );

        await client.sendMessage(
            '❌ Terjadi kesalahan.'
        );
    }
});

client.initialize();