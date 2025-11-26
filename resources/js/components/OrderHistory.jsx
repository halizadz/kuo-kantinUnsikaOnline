import React, { useState, useEffect } from "react";
import {
    Clock,
    CheckCircle,
    Truck,
    Package,
    XCircle,
    MapPin,
    Store,
    Calendar,
    Filter,
    Search,
    Star,
    Download,
    Eye,
    RefreshCw,
} from "lucide-react";

const OrderHistory = ({ user, API_BASE }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingOrder, setRatingOrder] = useState(null);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [submittingRating, setSubmittingRating] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        if (user) {
            loadUserOrders();
        }
    }, [user]);

    const loadUserOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/user/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const data = await response.json();
            if (data.success) {
                setOrders(data.data.data || []);
            }
        } catch (error) {
            console.error("Error loading orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return <Clock size={20} className="status-icon pending" />;
            case "processing":
                return <Package size={20} className="status-icon processing" />;
            case "ready":
                return <CheckCircle size={20} className="status-icon ready" />;
            case "on_delivery":
                return <Truck size={20} className="status-icon delivery" />;
            case "completed":
                return (
                    <CheckCircle size={20} className="status-icon completed" />
                );
            case "cancelled":
                return <XCircle size={20} className="status-icon cancelled" />;
            default:
                return <Clock size={20} className="status-icon" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "status-warning";
            case "processing":
                return "status-info";
            case "ready":
                return "status-success";
            case "on_delivery":
                return "status-primary";
            case "completed":
                return "status-completed";
            case "cancelled":
                return "status-error";
            default:
                return "status-default";
        }
    };

    const getStatusText = (status, deliveryOption) => {
        const statusMap = {
            pending: "Menunggu Konfirmasi",
            processing: "Sedang Diproses",
            ready:
                deliveryOption === "delivery" ? "Siap Diantar" : "Siap Diambil",
            on_delivery: "Sedang Diantar",
            completed: "Selesai",
            cancelled: "Dibatalkan",
        };
        return statusMap[status] || status;
    };

    const filteredOrders = orders.filter((order) => {
        const matchesStatus =
            filterStatus === "all" || order.status === filterStatus;
        const matchesSearch =
            order.order_number
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            order.penjual?.kantin_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const calculateTotal = (items) => {
        return items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    const handleReorder = (order) => {
        // Add items from this order to cart
        const cartItems = order.order_items.map((item) => ({
            id: item.menu.id,
            name: item.menu.name,
            price: item.price,
            image: item.menu.image,
            description: item.menu.description,
            quantity: item.quantity,
            penjual_id: order.penjual_id,
            kantin_name: order.penjual?.kantin_name,
        }));

        // Dispatch event to add to cart
        const event = new CustomEvent("addMultipleToCart", {
            detail: { items: cartItems },
        });
        window.dispatchEvent(event);

        // Show success message
        const toastEvent = new CustomEvent("showToast", {
            detail: {
                message: `${order.order_items.length} item berhasil ditambahkan ke keranjang!`,
                type: "success",
            },
        });
        window.dispatchEvent(toastEvent);
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
    };

    const handleDownloadInvoice = async (order) => {
        try {
            // Create invoice HTML
            const invoiceHTML = generateInvoiceHTML(order);

            // Create a new window for printing
            const printWindow = window.open("", "_blank");
            printWindow.document.write(invoiceHTML);
            printWindow.document.close();

            // Wait for content to load then print
            printWindow.onload = function () {
                printWindow.print();
            };

            // Show success message
            const event = new CustomEvent("showToast", {
                detail: {
                    message: "Invoice siap dicetak!",
                    type: "success",
                },
            });
            window.dispatchEvent(event);
        } catch (error) {
            console.error("Error generating invoice:", error);
            alert("Gagal membuat invoice");
        }
    };

    const generateInvoiceHTML = (order) => {
        const total = order.total_price || calculateTotal(order.order_items);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${order.order_number}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .invoice-header {
                        text-align: center;
                        margin-bottom: 40px;
                        border-bottom: 2px solid #8B0000;
                        padding-bottom: 20px;
                    }
                    .invoice-header h1 {
                        color: #8B0000;
                        margin: 0;
                    }
                    .invoice-info {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                    }
                    .info-section {
                        flex: 1;
                    }
                    .info-section h3 {
                        color: #8B0000;
                        margin-bottom: 10px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    th, td {
                        padding: 12px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        background-color: #8B0000;
                        color: white;
                    }
                    .total-section {
                        text-align: right;
                        font-size: 18px;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #666;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                    }
                    @media print {
                        body { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-header">
                    <h1>INVOICE</h1>
                    <p>Kantin Kampus Digital</p>
                </div>
                
                <div class="invoice-info">
                    <div class="info-section">
                        <h3>Informasi Pesanan</h3>
                        <p><strong>Nomor:</strong> ${order.order_number}</p>
                        <p><strong>Tanggal:</strong> ${formatDate(
                            order.created_at
                        )}</p>
                        <p><strong>Status:</strong> ${getStatusText(
                            order.status,
                            order.delivery_option
                        )}</p>
                    </div>
                    
                    <div class="info-section">
                        <h3>Informasi Pelanggan</h3>
                        <p><strong>Nama:</strong> ${user.name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        ${
                            order.delivery_option === "delivery"
                                ? `<p><strong>Alamat:</strong> ${order.delivery_address}</p>`
                                : ""
                        }
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Kantin</h3>
                    <p><strong>${
                        order.penjual?.kantin_name || "Kantin"
                    }</strong></p>
                    <p>${order.penjual?.location || ""}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Harga</th>
                            <th>Qty</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.order_items
                            .map(
                                (item) => `
                            <tr>
                                <td>${item.menu?.name}</td>
                                <td>Rp ${Number(
                                    item.price
                                ).toLocaleString()}</td>
                                <td>${item.quantity}</td>
                                <td>Rp ${(
                                    Number(item.price) * item.quantity
                                ).toLocaleString()}</td>
                            </tr>
                        `
                            )
                            .join("")}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <p>Total: Rp ${Number(total).toLocaleString()}</p>
                </div>
                
                ${
                    order.notes
                        ? `
                    <div class="info-section">
                        <h3>Catatan</h3>
                        <p>${order.notes}</p>
                    </div>
                `
                        : ""
                }
                
                <div class="footer">
                    <p>Terima kasih telah memesan di Kantin Kampus Digital!</p>
                    <p>Dicetak pada: ${new Date().toLocaleDateString(
                        "id-ID"
                    )}</p>
                </div>
            </body>
            </html>
        `;
    };

    const handleOpenRating = (order) => {
        setRatingOrder(order);
        setRating(0);
        setReview("");
        setHoverRating(0);
        setShowRatingModal(true);
    };

    const handleSubmitRating = async () => {
        if (rating === 0) {
            const event = new CustomEvent("showToast", {
                detail: {
                    message: "Silakan pilih rating terlebih dahulu",
                    type: "error",
                },
            });
            window.dispatchEvent(event);
            return;
        }

        setSubmittingRating(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `${API_BASE}/orders/${ratingOrder.id}/rating`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        rating: rating,
                        review: review,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                // Update order in state
                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === ratingOrder.id
                            ? {
                                  ...order,
                                  is_rated: true,
                                  average_rating: rating,
                              }
                            : order
                    )
                );

                // Show success message
                const event = new CustomEvent("showToast", {
                    detail: {
                        message: "Terima kasih atas penilaian Anda!",
                        type: "success",
                    },
                });
                window.dispatchEvent(event);

                setShowRatingModal(false);
            } else {
                const event = new CustomEvent("showToast", {
                    detail: {
                        message: data.message || "Gagal mengirim rating",
                        type: "error",
                    },
                });
                window.dispatchEvent(event);
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            const event = new CustomEvent("showToast", {
                detail: {
                    message: "Gagal mengirim rating",
                    type: "error",
                },
            });
            window.dispatchEvent(event);
        } finally {
            setSubmittingRating(false);
        }
    };

    const handleCancelOrder = async (order) => {
        if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `${API_BASE}/orders/${order.id}/cancel`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                // Update order status
                setOrders((prev) =>
                    prev.map((o) =>
                        o.id === order.id ? { ...o, status: "cancelled" } : o
                    )
                );

                const event = new CustomEvent("showToast", {
                    detail: {
                        message: "Pesanan berhasil dibatalkan",
                        type: "success",
                    },
                });
                window.dispatchEvent(event);
            } else {
                alert(data.message || "Gagal membatalkan pesanan");
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            alert("Gagal membatalkan pesanan");
        }
    };

    const handleConfirmPickup = async (order) => {
        if (!confirm("Konfirmasi bahwa Anda telah mengambil pesanan?")) {
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `${API_BASE}/orders/${order.id}/confirm-pickup`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                // Update order status
                setOrders((prev) =>
                    prev.map((o) =>
                        o.id === order.id ? { ...o, status: "completed" } : o
                    )
                );

                const event = new CustomEvent("showToast", {
                    detail: {
                        message: "Pesanan dikonfirmasi. Selamat menikmati!",
                        type: "success",
                    },
                });
                window.dispatchEvent(event);
            } else {
                alert(data.message || "Gagal mengkonfirmasi pengambilan");
            }
        } catch (error) {
            console.error("Error confirming pickup:", error);
            alert("Gagal mengkonfirmasi pengambilan");
        }
    };

    // Fungsi bintang rating
    const StarRating = ({
        rating,
        onRatingChange,
        hoverRating,
        onHoverChange,
    }) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`star-btn ${
                            star <= (hoverRating || rating) ? "active" : ""
                        }`}
                        onClick={() => onRatingChange(star)}
                        onMouseEnter={() => onHoverChange(star)}
                        onMouseLeave={() => onHoverChange(0)}
                    >
                        <Star
                            size={32}
                            fill={
                                star <= (hoverRating || rating)
                                    ? "currentColor"
                                    : "none"
                            }
                        />
                    </button>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="order-history loading">
                <div className="loading-spinner"></div>
                <p>Memuat riwayat pesanan...</p>
            </div>
        );
    }

    return (
        <div className="order-history">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <div className="header-content">
                        <h1 className="gradient-text">Riwayat Pesanan</h1>
                        <p>Lihat dan kelola semua pesanan Anda</p>
                    </div>

                    <button
                        className="btn btn-secondary"
                        onClick={loadUserOrders}
                        disabled={loading}
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="order-filters">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Cari nomor pesanan atau nama kantin..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${
                                filterStatus === "all" ? "active" : ""
                            }`}
                            onClick={() => setFilterStatus("all")}
                        >
                            Semua
                        </button>
                        <button
                            className={`filter-tab ${
                                filterStatus === "pending" ? "active" : ""
                            }`}
                            onClick={() => setFilterStatus("pending")}
                        >
                            Pending
                        </button>
                        <button
                            className={`filter-tab ${
                                filterStatus === "processing" ? "active" : ""
                            }`}
                            onClick={() => setFilterStatus("processing")}
                        >
                            Diproses
                        </button>
                        <button
                            className={`filter-tab ${
                                filterStatus === "ready" ? "active" : ""
                            }`}
                            onClick={() => setFilterStatus("ready")}
                        >
                            Siap
                        </button>
                        <button
                            className={`filter-tab ${
                                filterStatus === "completed" ? "active" : ""
                            }`}
                            onClick={() => setFilterStatus("completed")}
                        >
                            Selesai
                        </button>
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-icon">
                            <Package size={64} />
                        </div>
                        <h3>
                            {searchTerm || filterStatus !== "all"
                                ? "Tidak ada pesanan yang sesuai"
                                : "Belum ada pesanan"}
                        </h3>
                        <p>
                            {searchTerm
                                ? "Coba gunakan kata kunci lain"
                                : filterStatus !== "all"
                                ? `Tidak ada pesanan dengan status ${filterStatus}`
                                : "Mulai pesan makanan favorit Anda dari kantin kampus"}
                        </p>
                        {(searchTerm || filterStatus !== "all") && (
                            <button
                                className="btn btn-primary mt-3"
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterStatus("all");
                                }}
                            >
                                Tampilkan Semua Pesanan
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="orders-container">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <div className="order-number">
                                            <h4>#{order.order_number}</h4>
                                            <span
                                                className={`order-status ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {getStatusIcon(order.status)}
                                                {getStatusText(
                                                    order.status,
                                                    order.delivery_option
                                                )}
                                            </span>
                                        </div>

                                        <div className="order-meta">
                                            <div className="meta-item">
                                                <Calendar size={16} />
                                                <span>
                                                    {formatDate(
                                                        order.created_at
                                                    )}
                                                </span>
                                            </div>
                                            <div className="meta-item">
                                                <Store size={16} />
                                                <span>
                                                    {order.penjual
                                                        ?.kantin_name ||
                                                        "Kantin"}
                                                </span>
                                            </div>
                                            <div className="meta-item">
                                                <MapPin size={16} />
                                                <span>
                                                    {order.delivery_option ===
                                                    "delivery"
                                                        ? `Diantar`
                                                        : "Ambil Sendiri"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="order-total">
                                        <span className="total-label">
                                            Total
                                        </span>
                                        <span className="total-amount">
                                            Rp{" "}
                                            {Number(
                                                order.total_price ||
                                                    calculateTotal(
                                                        order.order_items || []
                                                    )
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="order-items">
                                    <h5>Item Pesanan:</h5>
                                    <div className="items-list">
                                        {(order.order_items || []).map(
                                            (item) => (
                                                <div
                                                    key={item.id}
                                                    className="order-item"
                                                >
                                                    <img
                                                        src={
                                                            item.menu?.image ||
                                                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60&h=60&fit=crop"
                                                        }
                                                        alt={item.menu?.name}
                                                        className="item-image"
                                                    />
                                                    <div className="item-details">
                                                        <span className="item-name">
                                                            {item.menu?.name}
                                                        </span>
                                                        <span className="item-quantity">
                                                            x{item.quantity}
                                                        </span>
                                                    </div>
                                                    <span className="item-price">
                                                        Rp{" "}
                                                        {Number(
                                                            item.price
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                {order.delivery_option === "delivery" &&
                                    order.delivery_address && (
                                        <div className="delivery-address-section">
                                            <div className="address-header">
                                                <MapPin size={16} />
                                                <strong>
                                                    Alamat Pengantaran:
                                                </strong>
                                            </div>
                                            <p>{order.delivery_address}</p>
                                        </div>
                                    )}

                                {/* Notes */}
                                {order.notes && (
                                    <div className="order-notes">
                                        <strong>Catatan:</strong>
                                        <p>{order.notes}</p>
                                    </div>
                                )}

                                {/* Order Actions */}
                                <div className="order-actions">
                                    {order.status === "completed" && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleReorder(order)}
                                        >
                                            <RefreshCw size={16} />
                                            Pesan Lagi
                                        </button>
                                    )}

                                    {order.status === "pending" && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() =>
                                                handleCancelOrder(order)
                                            }
                                        >
                                            Batalkan Pesanan
                                        </button>
                                    )}

                                    {order.status === "ready" &&
                                        order.delivery_option === "pickup" && (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() =>
                                                    handleConfirmPickup(order)
                                                }
                                            >
                                                Konfirmasi Pengambilan
                                            </button>
                                        )}

                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleViewDetails(order)}
                                    >
                                        <Eye size={16} />
                                        Lihat Detail
                                    </button>

                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() =>
                                            handleDownloadInvoice(order)
                                        }
                                    >
                                        <Download size={16} />
                                        Invoice
                                    </button>
                                </div>

                                {/* Rating Prompt for Completed Orders */}
                                {order.status === "completed" &&
                                    !order.is_rated && (
                                        <div className="rating-prompt">
                                            <div className="rating-prompt-content">
                                                <Star size={20} />
                                                <div>
                                                    <strong>
                                                        Beri Penilaian
                                                    </strong>
                                                    <p>
                                                        Bagaimana pengalaman
                                                        pesanan Anda?
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() =>
                                                    handleOpenRating(order)
                                                }
                                            >
                                                Beri Rating
                                            </button>
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Order Details Modal */}
                {selectedOrder && (
                    <div className="modal-overlay">
                        <div className="modal order-details-modal">
                            <div className="modal-header">
                                <h3>
                                    Detail Pesanan #{selectedOrder.order_number}
                                </h3>
                                <button
                                    className="modal-close"
                                    onClick={() => setSelectedOrder(null)}
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="modal-body">
                                {/* Add detailed order information here */}
                                <p>Fitur detail pesanan akan segera hadir!</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rating Modal */}
                {showRatingModal && (
                    <div className="modal-overlay">
                        <div className="modal rating-modal">
                            <div className="modal-header">
                                <h3>
                                    Beri Rating Pesanan #
                                    {ratingOrder?.order_number}
                                </h3>
                                <button
                                    className="modal-close"
                                    onClick={() => setShowRatingModal(false)}
                                    disabled={submittingRating}
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="rating-section">
                                    <div className="rating-stars">
                                        <StarRating
                                            rating={rating}
                                            onRatingChange={setRating}
                                            hoverRating={hoverRating}
                                            onHoverChange={setHoverRating}
                                        />
                                        <div className="rating-text">
                                            {rating === 0
                                                ? "Pilih rating"
                                                : `${rating}.0 Bintang`}
                                        </div>
                                    </div>

                                    <div className="review-section">
                                        <label htmlFor="review">
                                            Ulasan (opsional)
                                        </label>
                                        <textarea
                                            id="review"
                                            placeholder="Bagaimana pengalaman Anda dengan pesanan ini?"
                                            value={review}
                                            onChange={(e) =>
                                                setReview(e.target.value)
                                            }
                                            rows="4"
                                            disabled={submittingRating}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowRatingModal(false)}
                                    disabled={submittingRating}
                                >
                                    Batal
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubmitRating}
                                    disabled={submittingRating || rating === 0}
                                >
                                    {submittingRating
                                        ? "Mengirim..."
                                        : "Kirim Rating"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
