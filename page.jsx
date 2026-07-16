"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPostByIdOrSlug, getActivePosts } from "@/services/postServices";

// ── SVG Icons Tối Giản ──
const Icons = {
  Calendar: () => <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Clock: () => <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ArrowLeft: () => <svg className="w-4 h-4 flex-shrink-0 transition-transform group-hover:-translate-x-1 duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Share: () => <svg className="w-4 h-4 text-gray-500 hover:text-rose-600 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
  Sparkles: () => <svg className="w-4 h-4 text-amber-500 fill-amber-400 flex-shrink-0" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
};

// ── Helper định dạng dữ liệu chi tiết ──
const formatDetailData = (data) => {
  const titleLower = (data.title || "").toLowerCase();
  let category = "Công thức làm bánh";
  if (titleLower.includes("top 5") || titleLower.includes("châu âu") || titleLower.includes("minimalist")) category = "Góc ẩm thực";
  else if (titleLower.includes("thương hiệu") || titleLower.includes("sweet bakery") || titleLower.includes("hành trình")) category = "Về Sweet Bakery";
  else if (titleLower.includes("bột mì") || titleLower.includes("bảo quản")) category = "Mẹo vặt làm bánh";

  let dateStr = "08/07/2026";
  if (data.created_at) {
    const d = new Date(data.created_at);
    if (!isNaN(d.getTime())) dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  return {
    id: data.id,
    slug: data.slug || data.id,
    title: data.title || "Bài viết không tiêu đề",
    category,
    author: data.id % 2 === 0 ? "Sweet Bakery Team" : "Nguyễn Ngọc Minh Thư",
    authorRole: data.id % 2 === 0 ? "Food Curators & Editors" : "Chef & Founder Sweet Bakery",
    date: dateStr,
    readTime: `${Math.floor(data.id * 1.5 + 3)} phút đọc`,
    image: data.thumbnail || "/images/posts/mousse_chanh_day.png",
    excerpt: data.description || "Khám phá những bí quyết và kiến thức ẩm thực tuyệt vời cùng Sweet Bakery...",
    content: data.content || "<p>Nội dung đang được cập nhật...</p>"
  };
};

// ── Component con: Thẻ bài viết liên quan ──
const RelatedCard = ({ rel }) => (
  <Link href={`/posts/${rel.slug}`} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-rose-100 flex flex-col justify-between group block">
    <div>
      <div className="aspect-[16/10] overflow-hidden bg-pink-50">
        <img src={rel.image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-5 space-y-2">
        <h4 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-rose-600 transition-colors line-clamp-2">{rel.title}</h4>
        <p className="text-gray-500 text-xs line-clamp-2">{rel.excerpt}</p>
      </div>
    </div>
    <div className="px-5 pb-4 text-[11px] font-extrabold text-rose-600">Đọc tiếp →</div>
  </Link>
);

// ── Trang Chi Tiết Bài Viết (`/posts/[slug]`) ──
export default function PostDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([getPostByIdOrSlug(slug), getActivePosts()])
      .then(([detailRes, listRes]) => {
        const detailData = detailRes.data?.data || detailRes.data;
        if (detailData) setPost(formatDetailData(detailData));

        const listData = listRes.data?.data || listRes.data || [];
        setRelatedPosts(
          listData
            .filter(p => p.slug !== slug && p.id !== Number(slug))
            .slice(0, 3)
            .map(p => ({ id: p.id, slug: p.slug || p.id, title: p.title, image: p.thumbnail || "/images/posts/european_tea_pastries.png", excerpt: p.description }))
        );
      })
      .catch(err => console.error("Lỗi tải chi tiết bài viết:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FFF5F7]">
      <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin mb-4" />
      <p className="text-base font-bold text-rose-900">Đang tải toàn bộ nội dung bài viết...</p>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FFF5F7] text-center space-y-4">
      <span className="text-5xl block">⚠️</span>
      <h1 className="text-2xl font-black text-rose-900">Không tìm thấy bài viết!</h1>
      <p className="text-gray-600 text-sm">Bài viết bạn tìm kiếm có thể đã được chuyển đi hoặc không tồn tại.</p>
      <Link href="/posts" className="px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl shadow-md hover:bg-rose-700 transition-colors text-sm">← Quay lại danh sách bài viết</Link>
    </div>
  );

  return (
    <div className="min-h-screen py-10 px-4 md:px-8" style={{ background: "#FFF5F7" }}>
      <article className="max-w-4xl mx-auto bg-white rounded-[32px] p-6 sm:p-12 md:p-16 shadow-xl border border-rose-100/80 space-y-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-100 pb-6">
          <Link href="/posts" className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-rose-600 hover:text-rose-800 transition-colors group">
            <Icons.ArrowLeft /> Quay lại danh sách bài viết
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <Link href="/" className="hover:text-rose-600">Trang chủ</Link>
            <span>/</span>
            <Link href="/posts" className="hover:text-rose-600">Góc bài viết</Link>
            <span>/</span>
            <span className="text-rose-600 font-bold truncate max-w-[150px] sm:max-w-[240px]">{post.title}</span>
          </div>
        </div>

        {/* Article Meta Header */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-bold">
            <span className="px-4 py-1.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm flex items-center gap-1.5 uppercase tracking-wider text-[11px]"><Icons.Sparkles /> {post.category}</span>
            <span className="text-gray-500 flex items-center gap-1.5 bg-pink-50/80 px-3 py-1.5 rounded-xl"><Icons.Calendar /> {post.date}</span>
            <span className="text-gray-500 flex items-center gap-1.5 bg-pink-50/80 px-3 py-1.5 rounded-xl"><Icons.Clock /> {post.readTime}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-rose-950 leading-snug tracking-tight">{post.title}</h1>

          {/* Author Card Info Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-pink-400 to-rose-600 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md border-2 border-white">{post.author.charAt(0)}</div>
              <div><p className="font-extrabold text-sm sm:text-base text-gray-900">{post.author}</p><p className="text-xs sm:text-sm text-rose-500 font-semibold">{post.authorRole}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium hidden sm:inline">Chia sẻ bài viết:</span>
              <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-rose-50 hover:border-rose-200 transition-colors"><Icons.Share /></div>
            </div>
          </div>
        </div>

        {/* Hero Cover Image */}
        <div className="rounded-3xl overflow-hidden shadow-lg border border-rose-100 bg-pink-50 max-h-[500px] flex items-center justify-center">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover object-center max-h-[500px]" />
        </div>

        {/* Excerpt Highlight */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-pink-50 to-rose-50/50 border-l-4 border-rose-500 text-rose-950 font-semibold text-base sm:text-lg leading-relaxed shadow-inner italic">
          "{post.excerpt}"
        </div>

        {/* Rich Content Body */}
        <div className="prose max-w-none text-gray-800 text-base sm:text-lg leading-relaxed space-y-6 pt-4 font-normal" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Footer Tags & Author Bio */}
        <div className="pt-8 border-t border-rose-100 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tags:</span>
              <span className="px-3.5 py-1.5 rounded-2xl bg-pink-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer">#SweetBakery</span>
              <span className="px-3.5 py-1.5 rounded-2xl bg-pink-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer">#BánhNgọt</span>
              <span className="px-3.5 py-1.5 rounded-2xl bg-pink-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer">#CôngThứcẨmThực</span>
            </div>
            <Link href="/products" className="px-6 py-3 rounded-2xl text-white font-extrabold text-xs sm:text-sm shadow-md transition-transform active:scale-95 flex items-center gap-2" style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
              🍰 Khám phá quầy bánh của tiệm ngay
            </Link>
          </div>

          <div className="bg-pink-50/60 rounded-3xl p-6 sm:p-8 border border-pink-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-pink-400 to-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0 border-2 border-white">{post.author.charAt(0)}</div>
            <div className="text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <h4 className="font-extrabold text-gray-900 text-base sm:text-lg">{post.author}</h4>
                <span className="text-xs font-bold text-rose-600 bg-rose-100 px-3 py-0.5 rounded-full w-fit mx-auto sm:mx-0">{post.authorRole}</span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Đam mê sáng tạo những món bánh ngọt chuẩn vị và chia sẻ những kiến thức làm bánh tử tế nhất đến cộng đồng người yêu ẩm thực.
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <div className="max-w-4xl mx-auto mt-12 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-extrabold text-rose-900">📑 Có thể bạn quan tâm</h3>
            <Link href="/posts" className="text-xs font-bold text-rose-600 hover:underline">Xem tất cả bài viết →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map(rel => <RelatedCard key={rel.id} rel={rel} />)}
          </div>
        </div>
      )}
    </div>
  );
}
