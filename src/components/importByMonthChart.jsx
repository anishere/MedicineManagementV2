/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { ExportOutlined } from '@ant-design/icons';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import XLSX from 'xlsx-js-style'; // Thêm thư viện xlsx-js-style

const ImportByMonthChart = ({ data, yearSelected }) => {

  // Hàm xuất dữ liệu ra file Excel
  const handleExportExcel = () => {
    // Định dạng dữ liệu để xuất ra Excel
    const formattedData = data.map(item => ({
      'Tháng': item.name,
      'Tiền Nhập (VND)': item.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    }));

    // Tạo một worksheet từ dữ liệu
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Định dạng cột
    const wscols = [
      { wch: 15 }, // Cột 'Tháng' có độ rộng 15
      { wch: 25 }, // Cột 'Tiền Nhập (VND)' có độ rộng 25
    ];
    ws['!cols'] = wscols;

    // Định dạng các ô trong bảng (bao gồm đóng khung và căn chỉnh)
    const range = XLSX.utils.decode_range(ws['!ref']); // Lấy phạm vi các ô
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        let cell = ws[cellAddress];

        // Nếu ô không tồn tại, khởi tạo ô mới
        if (!cell) {
          cell = { t: 's', v: '' };
          ws[cellAddress] = cell;
        }

        // Căn giữa cho cột 'Tháng'
        if (col === 0) {
          cell.s = { alignment: { horizontal: 'center', vertical: 'center' } }; // Căn giữa cho Tháng
        }

        // Căn phải cho cột 'Tiền Nhập'
        if (col === 1) {
          cell.s = { alignment: { horizontal: 'right', vertical: 'center' } }; // Căn phải cho Tiền Nhập
        }

        // Đóng khung cho tất cả các ô
        cell.s = cell.s || {};
        cell.s.border = {
          top: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        };
      }
    }

    // Định dạng tiêu đề (in đậm, căn giữa)
    const header = ['Tháng', 'Tiền Nhập (VND)'];
    header.forEach((headerName, idx) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: idx });
      let cell = ws[cellAddress];

      // Nếu ô không tồn tại, khởi tạo ô mới
      if (!cell) {
        cell = { t: 's', v: headerName };
        ws[cellAddress] = cell;
      }

      // Định dạng tiêu đề: in đậm và căn giữa
      cell.s = cell.s || {};
      cell.s.font = { bold: true }; // In đậm tiêu đề
      cell.s.alignment = { horizontal: 'center', vertical: 'center' }; // Căn giữa tiêu đề
      cell.s.border = {
        top: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      };
    });

    // Tạo một workbook và thêm worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tiền Nhập Theo Tháng');

    // Xuất file Excel
    XLSX.writeFile(wb, `TienNhapTheoThang_${yearSelected}.xlsx`);
  };

  return (
    <div className="card p-3">
      <h4 className="text-center">Tiền nhập theo tháng</h4>
      {/* Nút xuất Excel */}
      <div className="text-start my-3">
      <button onClick={handleExportExcel} className="btn btn-primary">
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
          <Bar dataKey="total" fill="#8884d8" name="Tiền nhập (VND)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ImportByMonthChart;
