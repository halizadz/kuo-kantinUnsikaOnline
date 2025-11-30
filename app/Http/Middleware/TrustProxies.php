<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

/**
 * Class TrustProxies
 * 
 * Middleware untuk menangani request yang datang melalui proxy atau load balancer.
 * Extends dari middleware bawaan Laravel.
 * 
 * Ketika aplikasi berada di belakang proxy/load balancer (seperti Nginx, Cloudflare, AWS ELB),
 * informasi asli client (IP address, protocol, host) akan di-forward melalui headers khusus.
 * 
 * Tanpa middleware ini:
 * - $request->ip() akan return IP proxy, bukan IP client asli
 * - $request->secure() mungkin salah detect HTTPS
 * - URL generation mungkin salah (http vs https)
 * 
 * Middleware ini memastikan Laravel membaca informasi dari headers yang benar.
 */
class TrustProxies extends Middleware
{
    /**
     * IP address proxy yang dipercaya
     * 
     * Konfigurasi ini menentukan proxy mana yang boleh forward headers.
     */
    protected $proxies = '*'; // Trust all proxies in production

    /**
     * Headers yang berisi informasi forwarded dari proxy
     * 
     * @var int
     */
    protected $headers =
        Request::HEADER_X_FORWARDED_FOR |      // Client IP
        Request::HEADER_X_FORWARDED_HOST |     // Original host
        Request::HEADER_X_FORWARDED_PORT |     // Original port
        Request::HEADER_X_FORWARDED_PROTO |    // Original protocol (http/https)
        Request::HEADER_X_FORWARDED_AWS_ELB;   // AWS ELB specific headers
}