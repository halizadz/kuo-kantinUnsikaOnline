<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustHosts as Middleware;

/**
 * Class TrustHosts
 * 
 * Middleware untuk menentukan host mana yang "trusted" (dipercaya).
 * Extends dari middleware bawaan Laravel untuk host validation.
 * 
 * Middleware ini mencegah "Host Header Injection" attack dengan memvalidasi
 * bahwa request berasal dari host yang diizinkan.
 * 
 * Host Header Injection adalah serangan dimana attacker memanipulasi
 * HTTP Host header untuk:
 * - Password reset poisoning
 * - Cache poisoning
 * - SQL injection
 * - SSRF (Server-Side Request Forgery)
 * 
 * Dengan middleware ini, hanya request dari host yang terdaftar yang akan diproses.
 */
class TrustHosts extends Middleware
{
    /**
     * Mendapatkan pattern host yang dipercaya
     * 
     * Method ini mengembalikan array berisi pattern host yang diizinkan.
     */
    public function hosts(): array
    {
        return [
            // Trust domain aplikasi dan semua subdomainnya
            $this->allSubdomainsOfApplicationUrl(),
        ];
    }
}