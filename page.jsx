"use client";
import React, { useEffect, useState } from 'react';
import { getProductsByStartLimit, getNewProducts } from '@/services/productServices';
import { getOrdersByPageSize } from '@/services/orderServices';
import { getAllUsers } from '@/services/userServices';

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch newest products for "Sản phẩm mới" section
        let productsData = [];
        try {
          const newProductsRes = await getNewProducts(5);
          if (Array.isArray(newProductsRes)) {
            productsData = newProductsRes;
          } else if (newProductsRes?.data && Array.isArray(newProductsRes.data)) {
            productsData = newProductsRes.data;
          }
        } catch (err) {
          console.error('Error fetching new products:', err);
        }

        // Fetch total products count from server
        let totalProductsCount = productsData.length || 0;
        try {
          const productsStartLimitRes = await getProductsByStartLimit(0, 1);
          if (productsStartLimitRes?.data?.pagination?.total !== undefined) {
            totalProductsCount = productsStartLimitRes.data.pagination.total;
          } else if (productsStartLimitRes?.pagination?.total !== undefined) {
            totalProductsCount = productsStartLimitRes.pagination.total;
          }
          // Fallback if productsData was still empty
          if (productsData.length === 0) {
            if (Array.isArray(productsStartLimitRes?.data?.data)) {
              productsData = productsStartLimitRes.data.data;
            } else if (Array.isArray(productsStartLimitRes?.data)) {
              productsData = productsStartLimitRes.data;
            }
          }
        } catch (err) {
          console.error('Error fetching products by start limit:', err);
        }

        setProducts(productsData.slice(0, 5));

        // Fetch orders - try multiple endpoints
        let ordersData = [];
        try {
          const ordersRes = await getOrdersByPageSize(1, 100);
          if (Array.isArray(ordersRes)) {
            ordersData = ordersRes;
          } else if (ordersRes?.data && Array.isArray(ordersRes.data)) {
            ordersData = ordersRes.data;
          } else if (ordersRes?.data?.data && Array.isArray(ordersRes.data.data)) {
            ordersData = ordersRes.data.data;
          }
        } catch (err) {
          console.error('Error fetching orders:', err);
        }
        
        setOrders(ordersData.slice(0, 2));

        // Fetch users
        const usersRes = await getAllUsers();
        let usersData = [];
        if (Array.isArray(usersRes)) {
          usersData = usersRes;
        } else if (usersRes?.data && Array.isArray(usersRes.data)) {
          usersData = usersRes.data;
        }
        setUsers(usersData);

        // Calculate stats
        const totalOrders = ordersData.length || 0;
        
        // Calculate total revenue from all orders
        let totalRevenue = 0;
        ordersData.forEach(order => {
          const orderTotal = Number(order.total_amount ?? order.total ?? order.totalPrice ?? 0);
          if (!isNaN(orderTotal)) {
            totalRevenue += orderTotal;
          }
        });

        setStats({
          totalProducts: totalProductsCount,
          totalOrders: totalOrders,
          totalRevenue: totalRevenue,
        });
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    const num = Number(value);
    if (isNaN(num)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(num).replace('₫', '₫').trim();
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .slice(-1)[0]
      ?.charAt(0)
      ?.toUpperCase() || 'A';
  };

  return (
    <div className="p-8 pb-16 flex flex-col min-h-full max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 tracking-tight mb-2">Tổng quan hệ thống</h1>
          <p className="text-rose-900/60 font-medium text-sm">Chào mừng trở lại! Dưới đây là thống kê mới nhất của Bakery.</p>
        </div>
        <div className="flex items-center gap-2 text-rose-500 font-bold text-sm bg-white px-5 py-2.5 rounded-2xl border-2 border-pink-50 shadow-sm shadow-pink-100/50">
          <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {currentDate}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-r from-pink-400 to-rose-400 rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-pink-200 text-white flex items-center h-40 group hover:-translate-y-1 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex-1 z-10">
            <p className="text-pink-100 font-bold uppercase tracking-wider mb-2 text-xs">Tổng Sản Phẩm</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-5xl font-black">{stats.totalProducts}</h2>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white shadow-inner z-10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-400 to-pink-500 rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-rose-200 text-white flex items-center h-40 group hover:-translate-y-1 transition-all">
          <div className="absolute bottom-0 right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl -mb-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex-1 z-10">
            <p className="text-rose-100 font-bold uppercase tracking-wider mb-2 text-xs">Đơn Hàng</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-5xl font-black">{stats.totalOrders}</h2>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white shadow-inner z-10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-300 to-rose-300 rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-pink-100 text-rose-900 flex items-center h-40 group hover:-translate-y-1 transition-all">
          <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex-1 z-10">
            <p className="text-rose-800/70 font-bold uppercase tracking-wider mb-2 text-xs">Doanh Thu</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl font-black tracking-tight">{formatCurrency(stats.totalRevenue).replace(' ₫', '')}</h2>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center border border-white/50 text-rose-700 shadow-inner z-10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Products */}
        <div className="bg-white rounded-3xl shadow-md shadow-pink-100/50 border border-pink-50 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-pink-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-pink-500 shadow-inner">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </div>
              <h3 className="text-rose-900 font-bold text-lg">Sản phẩm mới</h3>
            </div>
            <button className="text-sm font-bold text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-4 py-2 rounded-full transition-colors">Xem tất cả &rarr;</button>
          </div>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-pink-400 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-4 px-6 w-20">MÃ SP</th>
                  <th className="py-4 px-6">TÊN SẢN PHẨM</th>
                  <th className="py-4 px-6 text-right">GIÁ BÁN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50/50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-rose-50/40 transition-colors rounded-2xl">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-rose-300">#{p.id}</td>
                    <td className="py-4 px-6 font-bold text-rose-900">{p.product_name || p.name || 'Sản phẩm'}</td>
                    <td className="py-4 px-6 text-right font-black text-pink-600">{formatCurrency(p.price ?? p.sale_price ?? 0)}</td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-4 px-6 text-center text-gray-400">Không có sản phẩm</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-3xl shadow-md shadow-pink-100/50 border border-pink-50 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-pink-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-rose-500 shadow-inner">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h3 className="text-rose-900 font-bold text-lg">Đơn hàng gần đây</h3>
            </div>
            <button className="text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4 py-2 rounded-full transition-colors">Xem tất cả &rarr;</button>
          </div>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-pink-400 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-4 px-6">KHÁCH HÀNG</th>
                  <th className="py-4 px-6 text-center">TRẠNG THÁI</th>
                  <th className="py-4 px-6 text-right">TỔNG TIỀN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50/50">
                {orders.map((o) => {
                  const statusColor = o.status === 'completed' 
                    ? 'text-rose-700 bg-rose-50/80 border-rose-200'
                    : o.status === 'pending'
                    ? 'text-pink-700 bg-pink-50/80 border-pink-200'
                    : 'text-yellow-700 bg-yellow-50/80 border-yellow-200';
                  
                  const statusText = o.status === 'completed' 
                    ? 'Hoàn thành'
                    : o.status === 'pending'
                    ? 'Chờ xử lý'
                    : 'Đang xử lý';

                  return (
                    <tr key={o.id} className="hover:bg-rose-50/40 transition-colors rounded-2xl">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-black shrink-0 border border-pink-200">
                            {getInitials(o.user?.name || o.customer_name || 'User')}
                          </div>
                          <div>
                            <p className="font-bold text-rose-900 text-sm">{o.user?.name || o.customer_name || 'User'}</p>
                            <p className="text-[11px] text-rose-400 font-mono mt-0.5 font-semibold">#O-{o.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-rose-600">{formatCurrency(o.total_amount ?? o.total ?? o.totalPrice ?? 0)}</td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-4 px-6 text-center text-gray-400">Không có đơn hàng</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
