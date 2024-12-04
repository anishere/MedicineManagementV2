/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// RevenueByDateChart.js
import { ExportOutlined, FileExcelOutlined } from '@ant-design/icons';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import XLSX from 'xlsx-js-style'; // Thêm thư viện xlsx-js-style

const RevenueByDateChart = ({ data }) => {
  const handleExportToExcel = () => {
    // Lấy tháng và năm từ phần tử đầu tiên của data (hoặc bất kỳ phần tử nào có dữ liệu hợp lệ)
    const firstDate = data[0]?.name;
    const monthYear = firstDate ? new Date(firstDate) : new Date();
    const selectedMonth = monthYear.getMonth() + 1;  // Tháng (1-12)
    const selectedYear = monthYear.getFullYear();    // Năm (yyyy)

    // Tạo tiêu đề bảng với tháng và năm
    const monthYearTitle = `${selectedMonth} - ${selectedYear}`;

    // Chuyển đổi dữ liệu thành bảng tính với cột "Ngày bán" và "Doanh thu (VND)"
    const formattedData = data.map(item => ({
      'Ngày bán': item.name,
      'Doanh thu (VND)': item.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    }));

    // Chuyển đổi dữ liệu thành bảng tính với định dạng cụ thể
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Định dạng lại cột để hiển thị như tiền tệ cho cột "Doanh thu (VND)"
    const columnWidths = [
      { wch: 15 }, // Cột "Ngày bán"
      { wch: 25 }, // Cột "Doanh thu (VND)"
    ];
    ws['!cols'] = columnWidths;

    // Đặt tiêu đề cho bảng (gộp các ô từ A1 đến B1)
    ws['A1'] = {
      v: `Doanh thu theo ngày - ${monthYearTitle}`,
      s: {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        },
      },
    };
    ws['B1'] = undefined;  // Xóa nội dung ô B1

    // Gộp các ô từ A1 đến B1
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Gộp A1, B1
    ];

    // Đặt tiêu đề cho các cột dưới tiêu đề bảng (tại A2 và B2)
    ws['A2'] = {
      v: 'Ngày bán',
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
    ws['B2'] = {
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

    // Dữ liệu cho các hàng
    formattedData.forEach((item, index) => {
      const rowIndex = index + 2; // Dòng bắt đầu từ A2, B2

      ws[`A${rowIndex}`] = {
        v: item['Ngày bán'],
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

    // Tạo một sheet mới và append sheet vào workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Doanh Thu Theo Ngày');
    
    // Tạo file Excel và trigger tải xuống
    XLSX.writeFile(wb, `Doanh_Thu_Theo_Ngay_${selectedMonth}_${selectedYear}.xlsx`);
  };

  return (
    <div className="card p-3">
      <h4 className="text-center">Doanh thu theo ngày</h4>
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-success" onClick={handleExportToExcel}>
          <ExportOutlined />
        </button>
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
          <Bar dataKey="total" fill="#8884d8" name="Doanh thu (VND)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueByDateChart;
