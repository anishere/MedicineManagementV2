/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// MedicineExpiryChart.js
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import XLSX from 'xlsx-js-style'; // Thêm thư viện xlsx-js-style
import { ExportOutlined } from '@ant-design/icons';

const COLORS = ['#FF8042', '#FFBB28', '#00C49F']; // Màu cho thuốc hết hạn, gần hết hạn và còn hạn
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const MedicineExpiryChart = ({ listMedicine }) => {
  const [chartData, setChartData] = useState([]);

  // Hàm xuất danh sách thuốc ra Excel
  const handleExportMedicineStatus = () => {
    const currentDate = dayjs(); // Ngày hiện tại
    const soonExpireDate = currentDate.add(30, 'day'); // Gần hết hạn: trong vòng 30 ngày

    // Phân loại thuốc
    const expiredMedicines = listMedicine.filter(medicine =>
      dayjs(medicine.ngayHetHan).isBefore(currentDate)
    );
    const soonExpiredMedicines = listMedicine.filter(medicine =>
      dayjs(medicine.ngayHetHan).isAfter(currentDate) &&
      dayjs(medicine.ngayHetHan).isBefore(soonExpireDate)
    );
    const validMedicines = listMedicine.filter(medicine =>
      dayjs(medicine.ngayHetHan).isAfter(soonExpireDate)
    );

    const formatMedicineData = (medicines) =>
      medicines.map(item => ({
        'Mã Thuốc': item.maThuoc,
        'Tên Thuốc': item.tenThuoc,
        'Giá Bán': item.giaBan.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
        'Ngày Sản Xuất': dayjs(item.ngaySanXuat).format('DD/MM/YYYY'),
        'Ngày Hết Hạn': dayjs(item.ngayHetHan).format('DD/MM/YYYY'),
        'Số Lượng': item.soLuongThuocCon,
        'Công Dụng': item.congDung,
        'Đơn Vị Tính': item.dvt,
        'Xuất Xứ': item.xuatXu,
        'Khu Vực Lưu Trữ': item.khuVucLuuTru,
      }));

    const applyStylesToSheet = (ws) => {
      const range = XLSX.utils.decode_range(ws['!ref']);
      const headerStyle = { alignment: { horizontal: 'center', vertical: 'center' }, font: { bold: true } };

      for (let col = range.s.c; col <= range.e.c; col++) {
        const colRef = XLSX.utils.encode_col(col);
        ws[colRef + '1'].s = headerStyle; // Tiêu đề căn giữa, đậm
      }

      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = ws[cellRef];

          if (cell) {
            if (cellRef.includes('C')) { // "Giá Bán" ở cột 3
              cell.s = { alignment: { horizontal: 'right' } }; // Căn phải
            } else {
              cell.s = { alignment: { horizontal: 'center' } }; // Các cột khác căn giữa
            }
            cell.s = { ...cell.s, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } }; // Đóng khung
          }
        }
      }

      ws['!cols'] = [
        { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 18 },
        { wch: 18 }, { wch: 10 }, { wch: 25 }, { wch: 12 },
        { wch: 12 }, { wch: 15 }
      ]; // Đặt độ rộng cột
    };

    const wb = XLSX.utils.book_new();

    if (expiredMedicines.length > 0) {
      const wsExpired = XLSX.utils.json_to_sheet(formatMedicineData(expiredMedicines));
      applyStylesToSheet(wsExpired);
      XLSX.utils.book_append_sheet(wb, wsExpired, 'Thuốc hết hạn');
    }

    if (soonExpiredMedicines.length > 0) {
      const wsSoonExpired = XLSX.utils.json_to_sheet(formatMedicineData(soonExpiredMedicines));
      applyStylesToSheet(wsSoonExpired);
      XLSX.utils.book_append_sheet(wb, wsSoonExpired, 'Thuốc gần hết hạn');
    }

    if (validMedicines.length > 0) {
      const wsValid = XLSX.utils.json_to_sheet(formatMedicineData(validMedicines));
      applyStylesToSheet(wsValid);
      XLSX.utils.book_append_sheet(wb, wsValid, 'Thuốc còn hạn');
    }

    XLSX.writeFile(wb, `Danh_Sach_Thuoc_${currentDate.format('DDMMYYYY')}.xlsx`);
  };

  useEffect(() => {
    const currentDate = dayjs();

    // Phân loại thuốc để cập nhật biểu đồ
    const expiredCount = listMedicine.filter(medicine => dayjs(medicine.ngayHetHan).isBefore(currentDate)).length;
    const soonExpireCount = listMedicine.filter(medicine => 
      dayjs(medicine.ngayHetHan).isAfter(currentDate) && 
      dayjs(medicine.ngayHetHan).diff(currentDate, 'month') < 1
    ).length;
    const validCount = listMedicine.length - expiredCount - soonExpireCount;

    // Cập nhật dữ liệu cho biểu đồ
    const data = [
      { name: 'Thuốc hết hạn', value: expiredCount },
      { name: 'Thuốc gần hết hạn', value: soonExpireCount },
      { name: 'Thuốc còn hạn', value: validCount },
    ];

    setChartData(data);
  }, [listMedicine]);

  return (
    <div className="text-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
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
            <span>Thuốc hết hạn</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 15, height: 15, backgroundColor: COLORS[1], marginRight: 8 }}></div>
            <span>Thuốc gần hết hạn</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 15, height: 15, backgroundColor: COLORS[2], marginRight: 8 }}></div>
            <span>Thuốc còn hạn</span>
          </div>
        </div>
      </div>

      {/* Nút xuất ra Excel */}
      <p className='text-end col-md-10'>
        <button className="btn btn-success mt-3" onClick={handleExportMedicineStatus}>
          <ExportOutlined />
        </button>
      </p>   
    </div>
  );
};

export default MedicineExpiryChart;
