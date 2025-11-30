<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Class OrdersExport
 * 
 * Class untuk mengekspor data pesanan/order ke format Excel
 * Mendukung filtering berdasarkan status, penjual, dan rentang tanggal
 */
class OrdersExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $status;
    protected $penjualId;
    protected $dateFrom;
    protected $dateTo;

    public function __construct($status = null, $penjualId = null, $dateFrom = null, $dateTo = null)
    {
        $this->status = $status;
        $this->penjualId = $penjualId;
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }

    /**
     * Mengambil collection data order yang akan diekspor
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = Order::with(['user', 'penjual', 'orderItems.menu']);

        // Filter by status
        if ($this->status && $this->status !== 'all') {
            $query->where('status', $this->status);
        }

        // Filter by penjual
        if ($this->penjualId) {
            $query->where('penjual_id', $this->penjualId);
        }

        // Filter by date range
        if ($this->dateFrom) {
            $query->whereDate('created_at', '>=', $this->dateFrom);
        }
        if ($this->dateTo) {
            $query->whereDate('created_at', '<=', $this->dateTo);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Mendefinisikan header kolom untuk Excel
     */
    public function headings(): array
    {
        return [
            'ID',
            'Nomor Order',
            'Pelanggan',
            'Email Pelanggan',
            'Nama Kantin',
            'Total Harga',
            'Status',
            'Opsi Pengiriman',
            'Alamat Pengiriman',
            'Catatan',
            'Jumlah Item',
            'Rating',
            'Tanggal Pesanan',
            'Tanggal Update',
        ];
    }

    /**
     * Memetakan data order ke format yang akan ditampilkan di Excel
     */
    public function map($order): array
    {
        $statusMap = [
            'pending' => 'Menunggu Konfirmasi',
            'processing' => 'Sedang Diproses',
            'ready' => 'Siap',
            'on_delivery' => 'Sedang Diantar',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
        ];

        return [
            $order->id,
            $order->order_number,
            $order->user->name ?? '-',
            $order->user->email ?? '-',
            $order->penjual->kantin_name ?? '-',
            'Rp ' . number_format($order->total_price, 0, ',', '.'),
            $statusMap[$order->status] ?? $order->status,
            $order->delivery_option === 'delivery' ? 'Diantar' : 'Ambil Sendiri',
            $order->delivery_address ?? '-',
            $order->notes ?? '-',
            $order->orderItems->count(),
            $order->average_rating ? number_format($order->average_rating, 1) : '-',
            $order->created_at->format('d/m/Y H:i'),
            $order->updated_at->format('d/m/Y H:i'),
        ];
    }

    /**
     * Mengatur style untuk worksheet Excel
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row (header)
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '8B0000'],
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                ],
            ],
        ];
    }

    /**
     *  Mendefinisikan judul sheet Excel
     */
    public function title(): string
    {
        return 'Data Orders';
    }
}