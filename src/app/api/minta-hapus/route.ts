import { NextRequest, NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID!
const BASE_URL           = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export async function POST(req: NextRequest) {
  try {
    const {
      transaksiId,
      transaksiNama,
      transaksiJumlah,
      transaksiTanggal,
      transaksiTipe,
    } = await req.json()

    if (!transaksiId || !transaksiNama) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Token konfirmasi — base64url dari "id::timestamp"
    const token        = Buffer.from(`${transaksiId}::${Date.now()}`).toString('base64url')
    const konfirmasiUrl = `${BASE_URL}/konfirmasi-hapus?token=${token}&id=${transaksiId}&nama=${encodeURIComponent(transaksiNama)}`

    const tipe  = transaksiTipe === 'PEMASUKAN' ? '💚 Pemasukan' : '🔴 Pengeluaran'
    const emoji = transaksiTipe === 'PEMASUKAN' ? '+' : '-'

    const text = [
      `🗑 *Permintaan Hapus Transaksi*`,
      ``,
      `📋 *Detail:*`,
      `• Nama: *${transaksiNama}*`,
      `• Jumlah: *${emoji}${transaksiJumlah}*`,
      `• Tanggal: ${transaksiTanggal}`,
      `• Tipe: ${tipe}`,
      ``,
      `Klik tombol di bawah untuk mengonfirmasi penghapusan.`,
      `⏱ Link berlaku 24 jam.`,
    ].join('\n')

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:    TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              {
                text: '✅ KONFIRMASI HAPUS',
                url: konfirmasiUrl,
              },
              {
                text: '❌ BATALKAN',
                callback_data: 'batal',
              },
            ]],
          },
        }),
      }
    )

    const telegramData = await telegramRes.json()

    if (!telegramData.ok) {
      console.error('Telegram error:', telegramData)
      return NextResponse.json({ error: 'Gagal kirim notifikasi Telegram' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, token })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
