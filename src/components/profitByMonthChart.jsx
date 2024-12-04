/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { ExportOutlined } from '@ant-design/icons';
import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import XLSX from 'xlsx-js-style'; // Thêm thư viện xlsx-js-style

const ProfitByMonthChart = ({ data }) => {
  
  // Hàm xuất dữ liệu ra file Excel
  const handleExportExcel = () => {
    // Định dạng dữ liệu để xuất ra Excel
    const formattedData = data.map(item => ({
      'Tháng': item.name,
      'Doanh Thu (VND)': item.revenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
      'Tiền Nhập (VND)': item.importCost.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
      'Lợi Nhuận (VND)': item.profit.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    }));
  
    // Tạo một worksheet từ dữ liệu
    const ws = XLSX.utils.json_to_sheet(formattedData);
  
    // Định dạng cột
    const wscols = [
      { wch: 15 }, // Cột 'Tháng' có độ rộng 15
      { wch: 25 }, // Cột 'Doanh Thu' có độ rộng 25
      { wch: 25 }, // Cột 'Tiền Nhập' có độ rộng 25
      { wch: 25 }, // Cột 'Lợi Nhuận' có độ rộng 25
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
          cell.s = { alignment: { horizontal: 'center', vertical: 'center' } }; // Căn giữa cho 'Tháng'
        }
  
        // Căn phải cho các cột tiền (Doanh Thu, Tiền Nhập, Lợi Nhuận)
        if (col === 1 || col === 2 || col === 3) {
          cell.s = { alignment: { horizontal: 'right', vertical: 'center' } }; // Căn phải cho các cột tiền
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
  
    // Định dạng tiêu đề cột (in đậm và căn giữa)
    const header = ['Tháng', 'Doanh Thu (VND)', 'Tiền Nhập (VND)', 'Lợi Nhuận (VND)'];
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
      cell.s.font = { bold: true }; // In đậm
      cell.s.alignment = { horizontal: 'center', vertical: 'center' }; // Căn giữa
    });
  
    // Tạo một workbook và thêm worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lợi Nhuận Theo Tháng');
  
    // Xuất file Excel
    XLSX.writeFile(wb, 'LoiNhuanTheoThang.xlsx');
  };  

  return (
    <div className="card p-3">
      <h4 className="text-center">Lợi nhuận theo tháng</h4>

      {/* Nút xuất Excel */}
      <div className="text-start mt-3">
        <button onClick={handleExportExcel} className="btn btn-primary">
          <ExportOutlined />
        </button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => value.toLocaleString()} />
          <Tooltip formatter={(value) => value.toLocaleString()} />
          <Legend />
          <Bar dataKey="profit" barSize={20} fill="#413ea0" name="Lợi nhuận (VND)" />
          <Line type="monotone" dataKey="revenue" stroke="#ff7300" name="Doanh thu (VND)" />
          <Line type="monotone" dataKey="importCost" stroke="#8884d8" name="Tiền nhập (VND)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitByMonthChart;
