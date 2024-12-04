/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// RevenueByMonthChart.js
import { ExportOutlined } from '@ant-design/icons';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import XLSX from 'xlsx-js-style'; // Thêm thư viện xlsx-js-style

const RevenueByMonthChart = ({ data, yearSelected }) => {

  // Hàm xuất dữ liệu ra Excel
  const handleExportToExcel = () => {

    // Tạo tiêu đề tháng-năm
    const monthYearTitle = yearSelected;

    // Chuyển đổi dữ liệu thành bảng tính với cột "Tháng" và "Doanh thu (VND)"
    const formattedData = data.map(item => ({
      'Tháng': item.name,
      'Doanh thu (VND)': item.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    }));

    // Chuyển đổi dữ liệu thành sheet
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Định dạng lại cột để hiển thị như tiền tệ cho cột "Doanh thu (VND)"
    const columnWidths = [
      { wch: 15 }, // Cột "Tháng"
      { wch: 25 }, // Cột "Doanh thu (VND)"
    ];
    ws['!cols'] = columnWidths;

    // Đặt tiêu đề cho các cột (A1 và B1) và đóng khung
    ws['A1'] = {
      v: 'Tháng',
      s: {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        },
      },
    };
    ws['B1'] = {
      v: 'Doanh thu (VND)',
      s: {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        },
      },
    };

    // Định dạng phần dữ liệu bên dưới
    formattedData.forEach((item, index) => {
      const rowIndex = index + 2; // Dòng bắt đầu từ A2, B2

      ws[`A${rowIndex}`] = {
        v: item['Tháng'],
        s: {
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          },
        },
      };

      ws[`B${rowIndex}`] = {
        v: item['Doanh thu (VND)'],
        s: {
          alignment: { horizontal: 'right', vertical: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          },
        },
      };
    });

    // Tạo workbook mới và thêm sheet vào
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Doanh thu theo tháng');

    // Xuất file Excel
    XLSX.writeFile(wb, `Doanh_Thu_Theo_Thang_${monthYearTitle}.xlsx`);
  };

  return (
    <div className="card p-3">
      <h4 className="text-center">Doanh thu theo tháng</h4>
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-success mb-3" onClick={handleExportToExcel}><ExportOutlined /></button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            tickFormatter={(value) => value.toLocaleString()} // Định dạng giá trị trên trục Y
          />
          <Tooltip
            formatter={(value) => value.toLocaleString()} // Định dạng giá trị trên tooltip
            labelFormatter={(label) => `${label}`}
          />
          <Legend />
          <Bar dataKey="total" fill="#82ca9d" name="Doanh thu (VND)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueByMonthChart;
