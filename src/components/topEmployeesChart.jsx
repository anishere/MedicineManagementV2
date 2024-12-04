/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import XLSX from 'xlsx-js-style'; // Thêm thư viện xlsx-js-style
import { axiosCus } from '../axios/axios'; // Giả sử bạn đã có axiosCus được định nghĩa
import { URLGetInvoice, URLListEmployee, URLListInvouces } from '../../URL/url';
import { ExportOutlined } from '@ant-design/icons';

const TopEmployeesChart = ({ data, employees }) => {
  // Tính tổng doanh thu của từng nhân viên
  const employeeRevenue = useMemo(() => {
    const revenueMap = {};

    // Tính doanh thu cho mỗi nhân viên từ các hóa đơn
    data.forEach(invoice => {
      const maNV = invoice.maNV;
      if (!revenueMap[maNV]) {
        revenueMap[maNV] = 0;
      }
      revenueMap[maNV] += invoice.tongGia; // Tổng doanh thu của nhân viên
    });

    // Tạo một mảng chứa thông tin nhân viên và doanh thu của họ
    const revenueArray = Object.keys(revenueMap).map(maNV => {
      const employee = employees.find(emp => emp.maNV === maNV);
      return {
        maNV,
        tenNV: employee ? employee.tenNV : "Không rõ",
        doanhThu: revenueMap[maNV],
      };
    });

    // Sắp xếp các nhân viên theo doanh thu giảm dần và lấy 5 nhân viên có doanh thu cao nhất
    return revenueArray
      .sort((a, b) => b.doanhThu - a.doanhThu)
      .slice(0, 5);
  }, [data, employees]);

  // Hàm xuất dữ liệu ra file Excel
  const handleExportExcel = () => {
    const formattedData = employeeRevenue.map(item => ({
      'Tên Nhân Viên': item.tenNV,
      'Doanh Thu (VND)': item.doanhThu.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    }));

    // Tạo một worksheet từ dữ liệu
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Định dạng cột
    const wscols = [
      { wch: 25 }, // Cột 'Tên Nhân Viên' có độ rộng 25
      { wch: 25 }, // Cột 'Doanh Thu (VND)' có độ rộng 25
    ];
    ws['!cols'] = wscols;

    // Định dạng tiêu đề cột và đóng khung tất cả các ô
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

        // Căn giữa cho cột 'Tên Nhân Viên'
        if (col === 0) {
          cell.s = { alignment: { horizontal: 'center', vertical: 'center' } };
        }

        // Căn phải cho cột 'Doanh Thu (VND)'
        if (col === 1) {
          cell.s = { alignment: { horizontal: 'right', vertical: 'center' } };
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
    const header = ['Tên Nhân Viên', 'Doanh Thu (VND)'];
    header.forEach((headerName, idx) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: idx });
      let cell = ws[cellAddress];

      // Nếu ô không tồn tại, khởi tạo ô mới
      if (!cell) {
        cell = { t: 's', v: headerName };
        ws[cellAddress] = cell;
      }

      // Định dạng tiêu đề: in đậm và căn giữa
      cell.s = { 
        alignment: { horizontal: 'center', vertical: 'center' },
        font: { bold: true }
      };
    });

    // Tạo một workbook và thêm worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Top 5 Nhân Viên');

    // Xuất file Excel
    XLSX.writeFile(wb, 'Top5NhanVien.xlsx');
  };

  return (
    <div className="card p-3">
      <h4 className="text-center">Top 5 Nhân Viên Có Doanh Thu Cao Nhất</h4>
        {/* Nút xuất Excel */}
        <div className="text-start mt-3 mb-3">
        <button onClick={handleExportExcel} className="btn btn-primary">
          <ExportOutlined />
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={employeeRevenue} margin={{ top: 0, right: 0, left: 15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tenNV" />
          <YAxis tickFormatter={(value) => value.toLocaleString()} />
          <Tooltip formatter={(value) => `${value.toLocaleString()} VND`} />
          <Legend />
          <Bar dataKey="doanhThu" fill="#0088FE" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const Dashboard = () => {
  const [dataHoaDon, setDataHoaDon] = useState([]);
  const [listNhanVien, setListNhanVien] = useState([]);

  // Fetch dữ liệu hóa đơn và nhân viên
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseHoaDon = await axiosCus.get(URLListInvouces); // Thay URL phù hợp
        setDataHoaDon(responseHoaDon.listHoaDon);

        const responseNhanVien = await axiosCus.get(URLListEmployee); // Thay URL phù hợp
        setListNhanVien(responseNhanVien.listNhanVien);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  return <TopEmployeesChart data={dataHoaDon} employees={listNhanVien} />;
};

export default Dashboard;
