/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useMemo } from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const RevenueComparisonChart = ({ data, maNV }) => {
  // Tính tổng doanh thu của cá nhân và chi nhánh
  const { personalRevenue, branchRevenue, otherRevenue } = useMemo(() => {
    // Doanh thu cá nhân của nhân viên hiện tại
    const personalRevenue = data
      .filter((invoice) => invoice.maNV === maNV)
      .reduce((total, invoice) => total + invoice.tongGia, 0);

    // Tổng doanh thu của chi nhánh
    const branchRevenue = data.reduce((total, invoice) => total + invoice.tongGia, 0);

    // Doanh thu của các nhân viên khác (trừ đi doanh thu của cá nhân)
    const otherRevenue = branchRevenue - personalRevenue;

    return { personalRevenue, branchRevenue, otherRevenue };
  }, [data, maNV]);

  // Tính phần trăm và dữ liệu cho biểu đồ
  const chartData = useMemo(() => {
    const personalPercentage = ((personalRevenue / branchRevenue) * 100).toFixed(2);
    const otherPercentage = ((otherRevenue / branchRevenue) * 100).toFixed(2);

    return [
      { name: "Doanh thu cá nhân", value: personalRevenue, percentage: personalPercentage },
      { name: "Doanh thu nhân viên khác", value: otherRevenue, percentage: otherPercentage },
    ];
  }, [personalRevenue, branchRevenue, otherRevenue]);

  const COLORS = ["#0088FE", "#FFBB28"]; // Màu sắc biểu đồ

  return (
    <div className="card p-3">
      <h4 className="text-center">So sánh doanh thu cá nhân và chi nhánh</h4>

      {/* Hiển thị tổng doanh thu của chi nhánh bên ngoài biểu đồ */}
      <div className="text-center mt-3">
        <h5>Tổng doanh thu của chi nhánh: {branchRevenue.toLocaleString()} VND</h5>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percentage }) => `${name}: ${percentage}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, { payload }) =>
              `${value.toLocaleString()} VND (${payload.percentage}%)`
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueComparisonChart;
