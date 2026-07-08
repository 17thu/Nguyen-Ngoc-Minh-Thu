"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { brandByPageSize, deleteBrand } from "@/services/brandServices";
import Pagination from "@/components/common/Pagination";
import AdminTable from "@/components/admin/AdminTable";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://127.0.0.1:8000/storage/";
const PLACEHOLDER = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=80&q=80";
const PAGE_SIZE = 8;

const COLUMNS = [
  {
    key: "id",
    label: "ID",
    render: (val) => (
      <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#fda4af" }}>{val}</span>
    ),
  },
  {
    key: "image",
    label: "Logo",
    render: (val, row) => (
      <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "50%", overflow: "hidden", border: "2px solid #fecdd3" }}>
        <img
          src={val ? `${IMAGE_BASE_URL}${val}` : PLACEHOLDER}
          alt={row.name}
          onError={e => { e.target.src = PLACEHOLDER; }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    ),
  },
  {
    key: "name",
    label: "Tên thương hiệu",
    render: (val) => (
      <span style={{ fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap" }}>{val}</span>
    ),
  },
  {
    key: "slug",
    label: "Slug",
    render: (val) => (
      <span style={{ fontSize: "0.75rem", color: "#fb7185" }}>{val}</span>
    ),
  },
  {
    key: "status",
    label: "Trạng thái",
    render: (val) =>
      val === 1 ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.75rem", borderRadius: "9999px", background: "#d1fae5", color: "#059669" }}>
          <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: "#10b981" }} />
          Hiện
        </span>
      ) : (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.75rem", borderRadius: "9999px", background: "#fff1f2", color: "#f43f5e" }}>
          <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: "#fda4af" }} />
          Ẩn
        </span>
      ),
  },
];

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const res = await brandByPageSize({ page, pageSize: PAGE_SIZE, search });
        const payload = res.data;
        const list = payload?.data ?? [];
        setBrands(list);
        setPagination(payload?.pagination ?? null);
      } catch (error) {
        console.error("Lỗi tải thương hiệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [page, search]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (row) => {
    if (confirm(`Bạn có chắc muốn xóa thương hiệu "${row.name}"?`)) {
      try {
        await deleteBrand(row.id);
        alert("Xóa thương hiệu thành công!");
        setBrands(prev => prev.filter(b => b.id !== row.id));
      } catch (error) {
        alert("Lỗi khi xóa: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const total = pagination?.total ?? brands.length;
  const visible = brands.filter(b => b.status === 1).length;
  const hidden = brands.filter(b => b.status !== 1).length;

  return (
    <div className="p-8 space-y-6" style={{ background: "#FFF5F7", minHeight: "100%" }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#9f1239" }}>
            Thương hiệu
          </h1>
          <p className="text-sm mt-1" style={{ color: "#fb7185" }}>
            Quản lý danh sách các thương hiệu và đối tác
          </p>
        </div>
        <Link
          href="/admin/brands/create"
          className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl"
          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}
        >
          Thêm thương hiệu +
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng số lượng", value: total },
          { label: "Đang hoạt động", value: visible },
          { label: "Tạm ngưng", value: hidden },
        ].map(s => (
          <div key={s.label}
            className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center"
            style={{ border: "1px solid #fecdd3" }}
          >
            <p className="text-4xl font-bold mb-1" style={{ color: "#1f2937" }}>
              {loading ? "—" : s.value}
            </p>
            <p className="text-sm" style={{ color: "#fb7185" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #fecdd3" }}>

        <div className="px-6 py-4">
          <p className="font-semibold" style={{ color: "#9f1239" }}>
            {loading ? "Đang tải..." : "Thương hiệu"}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: "#fecdd3", borderTopColor: "#f43f5e" }} />
          </div>
        ) : (
          <AdminTable
            columns={COLUMNS}
            data={brands}
            editHref={(row) => `/admin/brands/${row.id}`}
            onDelete={handleDelete}
          />
        )}

        {/* ── Pagination ── */}
        {!loading && pagination && pagination.pageCount > 1 && (
          <div className="px-6 py-4 flex items-center justify-between"
            style={{ borderTop: "1px solid #fff1f2" }}>
            <p className="text-xs" style={{ color: "#fda4af" }}>
              Trang {pagination.page} / {pagination.pageCount}
            </p>
            <Pagination
              currentPage={pagination.page}
              pageCount={pagination.pageCount}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
