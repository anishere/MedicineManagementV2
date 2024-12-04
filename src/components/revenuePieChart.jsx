/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F']; // Màu cho các phần của biểu đồ
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      <tspan>{`${payload.percentage}%`}</tspan> {/* Tỉ lệ phần trăm */}
      <tspan x={x} y={y + 15}>{`${payload.value.toLocaleString()} VND`}</tspan> {/* Giá trị VND */}
    </text>
  );
};

const RevenuePieChart = ({ data }) => {
  return (
    <div className="text-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Phần chú thích */}
      <div className="legend mt-3">
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 15, height: 15, backgroundColor: COLORS[0], marginRight: 8 }}></div>
            <span>Chi nhánh hiện tại</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 15, height: 15, backgroundColor: COLORS[1], marginRight: 8 }}></div>
            <span>Các chi nhánh khác</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenuePieChart;
