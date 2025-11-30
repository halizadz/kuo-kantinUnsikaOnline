<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Class UsersExport
 * 
 * Class untuk mengekspor data users ke format Excel
 * Mendukung filtering berdasarkan role dan pencarian
 */
class UsersExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $role;
    protected $search;

    public function __construct($role = null, $search = null)
    {
        $this->role = $role;
        $this->search = $search;
    }

    /**
     *  Mengambil collection data users yang akan diekspor
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = User::query();

        // Filter by role
        if ($this->role && $this->role !== 'all') {
            $query->where('role', $this->role);
        }

        // Filter by search
        if ($this->search) {
            $query->where(function($q) {
                $q->where('name', 'like', "%{$this->search}%")
                  ->orWhere('email', 'like', "%{$this->search}%")
                  ->orWhere('kantin_name', 'like', "%{$this->search}%")
                  ->orWhere('nim', 'like', "%{$this->search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     *  Mendefinisikan header kolom untuk Excel
     * 
     */
    public function headings(): array
    {
        return [
            'ID',
            'Nama',
            'Email',
            'Telepon',
            'Role',
            'NIM',
            'Nama Kantin',
            'Lokasi Kantin',
            'Status Approval',
            'Status Aktif',
            'Tanggal Daftar',
        ];
    }

    /**
     * Memetakan data user ke format yang akan ditampilkan di Excel
     */
    public function map($user): array
    {
        return [
            $user->id,
            $user->name,
            $user->email,
            $user->phone ?? '-',
            ucfirst($user->role),
            $user->nim ?? '-',
            $user->kantin_name ?? '-',
            $user->location ?? '-',
            $user->is_approved ? 'Approved' : 'Pending',
            $user->is_active ? 'Aktif' : 'Non-Aktif',
            $user->created_at->format('d/m/Y H:i'),
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
        return 'Data Users';
    }
}