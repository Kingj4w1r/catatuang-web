import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const ADMIN_EMAIL = 'ivandhikai.dspf@gmail.com'

export async function POST(req: NextRequest) {
  try {
    const { transaksiId, transaksiNama, transaksiJumlah, transaksiTanggal, transaksiTipe } = await req.json()

    if (!transaksiId || !transaksiNama) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Buat token konfirmasi (base64 dari id + timestamp)
    const token = Buffer.from(`${transaksiId}::${Date.now()}`).toString('base64url')

    // URL konfirmasi — pakai NEXT_PUBLIC_BASE_URL atau fallback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const konfirmasiUrl = `${baseUrl}/konfirmasi-hapus?token=${token}&id=${transaksiId}`

    const { error } = await resend.emails.send({
      from: 'CatatUang <onboarding@resend.dev>',
      to: ADMIN_EMAIL,
      subject: '⚠️ Permintaan Hapus Riwayat Transaksi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #121212; color: #ffffff; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="width: 56px; height: 56px; background: #1ed760; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; color: #000; margin-bottom: 12px;">C</div>
            <h1 style="color: #ffffff; font-size: 20px; margin: 0;">CatatUang</h1>
            <p style="color: #b3b3b3; font-size: 14px; margin: 4px 0 0;">Permintaan Verifikasi Penghapusan</p>
          </div>

          <div style="background: #181818; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #b3b3b3; font-size: 12px; text-transform: uppercase; letter-spacing: 1.4px; margin: 0 0 12px;">Detail Transaksi</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #b3b3b3; font-size: 14px; padding: 6px 0;">Nama</td>
                <td style="color: #ffffff; font-size: 14px; font-weight: bold; text-align: right;">${transaksiNama}</td>
              </tr>
              <tr>
                <td style="color: #b3b3b3; font-size: 14px; padding: 6px 0;">Jumlah</td>
                <td style="color: ${transaksiTipe === 'PEMASUKAN' ? '#1ed760' : '#f3727f'}; font-size: 14px; font-weight: bold; text-align: right;">
                  ${transaksiTipe === 'PEMASUKAN' ? '+' : '-'}${transaksiJumlah}
                </td>
              </tr>
              <tr>
                <td style="color: #b3b3b3; font-size: 14px; padding: 6px 0;">Tanggal</td>
                <td style="color: #ffffff; font-size: 14px; text-align: right;">${transaksiTanggal}</td>
              </tr>
              <tr>
                <td style="color: #b3b3b3; font-size: 14px; padding: 6px 0;">Tipe</td>
                <td style="color: #ffffff; font-size: 14px; text-align: right;">${transaksiTipe === 'PEMASUKAN' ? 'Pemasukan' : 'Pengeluaran'}</td>
              </tr>
            </table>
          </div>

          <p style="color: #b3b3b3; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Admin meminta penghapusan transaksi di atas. Klik tombol berikut untuk <strong style="color: #ffffff;">mengonfirmasi penghapusan</strong>.
          </p>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${konfirmasiUrl}"
               style="display: inline-block; background: #1ed760; color: #000000; font-size: 14px;
                      font-weight: bold; text-decoration: none; padding: 14px 36px;
                      border-radius: 500px; text-transform: uppercase; letter-spacing: 2px;">
              KONFIRMASI HAPUS
            </a>
          </div>

          <p style="color: #b3b3b3; font-size: 12px; text-align: center; margin: 0;">
            Link berlaku 24 jam. Abaikan email ini jika kamu tidak memintanya.
          </p>

          <div style="border-top: 1px solid #272727; margin-top: 24px; padding-top: 16px; text-align: center;">
            <p style="color: #535353; font-size: 11px; margin: 0;">CatatUang v3.0 · Aplikasi Keuangan Pribadi</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Gagal kirim email' }, { status: 500 })
    }

    // Simpan token ke environment (karena localStorage tidak tersedia di server,
    // kita encode info ke dalam URL langsung)
    return NextResponse.json({ ok: true, token })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
