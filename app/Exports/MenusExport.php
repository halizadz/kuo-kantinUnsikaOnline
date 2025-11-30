<?php

namespace App\Exports;

use App\Models\Menu;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Class MenusExport
 * 
 * Class untuk mengekspor data menu ke format Excel
 * Mengimplementasi beberapa interface dari Laravel Excel untuk kustomisasi export
 */

class MenusExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $penjualId;
    protected $isAvailable;
    protected $category;

    public function __construct($penjualId = null, $isAvailable = null, $category = null)
    {
        $this->penjualId = $penjualId;
        $this->isAvailable = $isAvailable;
        $this->category = $category;
    }

    /**
     *  Mengambil collection data menu yang akan diekspor
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = Menu::with('penjual');

        // Filter by penjual
        if ($this->penjualId) {
            $query->where('penjual_id', $this->penjualId);
        }

        // Filter by availability
        if ($this->isAvailable !== null) {
            $query->where('is_available', $this->isAvailable);
        }

        // Filter by category
        if ($this->category && $this->category !== 'all') {
            $query->where('category', $this->category);
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
            'Nama Menu',
            'Deskripsi',
            'Harga',
            'Kategori',
            'Waktu Persiapan (menit)',
            'Rating',
            'Jumlah Rating',
            'Nama Kantin',
            'Pemilik',
            'Status Ketersediaan',
            'Populer',
            'Tanggal Dibuat',
        ];
    }

    /**
     * Memetakan data menu ke format yang akan ditampilkan di Excel
     */
    public function map($menu): array
    {
        $categoryMap = [
            'main' => 'Makanan Utama',
            'snack' => 'Snack',
            'drink' => 'Minuman',
            'dessert' => 'Dessert'
        ];

        return [
            $menu->id,
            $menu->name,
            $menu->description ?? '-',
            'Rp ' . number_format($menu->price, 0, ',', '.'),
            $categoryMap[$menu->category] ?? $menu->category ?? '-',
            $menu->prep_time . ' menit',
            $menu->rating ? number_format($menu->rating, 1) : '-',
            $menu->rating_count ?? 0,
            $menu->penjual->kantin_name ?? '-',
            $menu->penjual->name ?? '-',
            $menu->is_available ? 'Tersedia' : 'Habis',
            $menu->is_popular ? 'Ya' : 'Tidak',
            $menu->created_at->format('d/m/Y H:i'),
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
        return 'Data Menu';
    }
}