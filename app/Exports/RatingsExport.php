<?php

namespace App\Exports;

use App\Models\Rating;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Class RatingsExport
 * 
 * Class untuk mengekspor data rating/ulasan ke format Excel
 * Mendukung filtering berdasarkan penjual dan rating minimum
 */
class RatingsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $penjualId;
    protected $minRating;

    public function __construct($penjualId = null, $minRating = null)
    {
        $this->penjualId = $penjualId;
        $this->minRating = $minRating;
    }

    /**
     *  Mengambil collection data rating yang akan diekspor
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = Rating::with(['user', 'menu', 'penjual', 'order']);

        // Filter by penjual
        if ($this->penjualId) {
            $query->where('penjual_id', $this->penjualId);
        }

        // Filter by minimum rating
        if ($this->minRating) {
            $query->where('rating', '>=', $this->minRating);
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
            'Nama Pelanggan',
            'Email Pelanggan',
            'Nama Menu',
            'Nama Kantin',
            'Rating',
            'Ulasan',
            'Nomor Order',
            'Tanggal Rating',
        ];
    }

    /**
     * Memetakan data rating ke format yang akan ditampilkan di Excel
     */
    public function map($rating): array
    {
        return [
            $rating->id,
            $rating->user->name ?? '-',
            $rating->user->email ?? '-',
            $rating->menu->name ?? '-',
            $rating->penjual->kantin_name ?? '-',
            number_format($rating->rating, 1) . ' / 5.0',
            $rating->review ?? '-',
            $rating->order->order_number ?? '-',
            $rating->created_at->format('d/m/Y H:i'),
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
     * Mendefinisikan judul sheet Excel
     */
    public function title(): string
    {
        return 'Data Ratings';
    }
}