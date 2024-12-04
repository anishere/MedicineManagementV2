/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { axiosCus } from '../axios/axios';
import { ChiNhanh, URLGetInvoiceFromServer, URLListCungCap, URLListInvouces, URLListMedicine } from '../../URL/url';
import dayjs from 'dayjs';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import các component biểu đồ
import RevenueByDateChart from './revenueByDateChart';
import RevenueByMonthChart from './revenueByMonthChart';
import RevenuePieChart from './revenuePieChart';
import MedicineExpiryChart from './medicineExpiryChart';
import ImportByMonthChart from './importByMonthChart';
import ProfitByMonthChart from './profitByMonthChart';
//nhan vien
import RevenueComparisonChart from './revenueComparisonChart';
//top doanh thu
import TopEmployeesChart from './topEmployeesChart';



const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [invoiceData, setInvoiceData] = useState([]);
  const maNV = localStorage.getItem("maNV");

  // State cho các biểu đồ và năm/tháng được chọn
  const [revenueDataByDate, setRevenueDataByDate] = useState([]);
  const [selectedRevenueYear, setSelectedRevenueYear] = useState(dayjs().year());
  const [selectedRevenueMonth, setSelectedRevenueMonth] = useState(dayjs().month() + 1);
  const [availableRevenueYears, setAvailableRevenueYears] = useState([]);
  const [availableRevenueMonths, setAvailableRevenueMonths] = useState([]);
  const [dataByMonth, setDataByMonth] = useState([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState(dayjs().year());
  const [availableMonthYears, setAvailableMonthYears] = useState([]);
  const [importDataByMonth, setImportDataByMonth] = useState([]);
  const [selectedImportYear, setSelectedImportYear] = useState(dayjs().year());
  const [availableImportYears, setAvailableImportYears] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [listMedicine, setListMedicine] = useState([]);
  const [profitDataByMonth, setProfitDataByMonth] = useState([]);
  const [selectedYearForByMonth, setSelectedYearForByMonth] = useState();
  
  // State cho năm và dữ liệu lợi nhuận theo tháng
  const [selectedProfitYear, setSelectedProfitYear] = useState(dayjs().year());
  const [availableProfitYears, setAvailableProfitYears] = useState([]);
  
  useEffect(() => {
    // Cập nhật năm khả dụng cho lợi nhuận từ các năm doanh thu và tiền nhập
    const profitYears = new Set([...availableMonthYears, ...availableImportYears]);
    setAvailableProfitYears(Array.from(profitYears).sort((a, b) => a - b));
  }, [availableMonthYears, availableImportYears]);

  useEffect(() => {
    // Fetch dữ liệu doanh thu theo ngày
    const fetchRevenueData = async () => {
      try {
        const res = await axiosCus.get(URLListInvouces);
        const invoices = res.listHoaDon;
        const revenueByDate = {};
        const revenueYears = new Set();
        const revenueMonths = new Set();

        setInvoiceData(invoices);

        invoices.forEach(invoice => {
          const date = dayjs(invoice.ngayBan).format('YYYY-MM-DD');
          const month = dayjs(invoice.ngayBan).month() + 1;
          const year = dayjs(invoice.ngayBan).year();
          const total = invoice.tongGia;

          revenueYears.add(year);
          if (year === selectedRevenueYear) {
            revenueMonths.add(month);
            if (month === selectedRevenueMonth) {
              revenueByDate[date] = (revenueByDate[date] || 0) + total;
            }
          }
        });

        const sortedMonths = Array.from(revenueMonths).sort((a, b) => a - b);

        // Nếu tháng hiện tại không có dữ liệu, chọn tháng đầu tiên có dữ liệu
        if (!sortedMonths.includes(selectedRevenueMonth) && sortedMonths.length > 0) {
          setSelectedRevenueMonth(sortedMonths[0]);
        }

        const chartDataByDate = Object.keys(revenueByDate)
          .map(date => ({ name: date, total: revenueByDate[date] }))
          .sort((a, b) => new Date(a.name) - new Date(b.name));

        setRevenueDataByDate(chartDataByDate);
        setAvailableRevenueYears(Array.from(revenueYears).sort((a, b) => a - b));
        setAvailableRevenueMonths(sortedMonths);
      } catch (error) {
        console.error("Error fetching revenue data:", error.message);
      }
    };

    // Fetch dữ liệu doanh thu theo tháng
    const fetchMonthlyRevenueData = async () => {
      try {
        const res = await axiosCus.get(URLListInvouces);
        const invoices = res.listHoaDon;
        const revenueByMonth = {};
        const monthYears = new Set();

        invoices.forEach(invoice => {
          const month = dayjs(invoice.ngayBan).month() + 1;
          const year = dayjs(invoice.ngayBan).year();
          const total = invoice.tongGia;

          monthYears.add(year);
          if (year === selectedMonthYear) {
            revenueByMonth[month] = (revenueByMonth[month] || 0) + total;
          }
        });

        const chartDataByMonth = Object.keys(revenueByMonth)
          .map(month => ({ name: `Tháng ${month}`, total: revenueByMonth[month] }))
          .sort((a, b) => parseInt(a.name.split(" ")[1]) - parseInt(b.name.split(" ")[1]));

        setDataByMonth(chartDataByMonth);
        setAvailableMonthYears(Array.from(monthYears).sort((a, b) => a - b));
      } catch (error) {
        setError(error.message);
      }
    };

    // Fetch dữ liệu tiền nhập theo tháng
    const fetchImportData = async () => {
      try {
        const response = await axiosCus.get(URLListCungCap);
        const cungCapData = response.listCungCap;
        const importByMonth = {};
        const importYears = new Set();

        cungCapData.forEach(item => {
          const month = dayjs(item.ngayCungCap).month() + 1;
          const year = dayjs(item.ngayCungCap).year();
          const giaNhap = item.giaNhap || 0;

          importYears.add(year);
          if (year === selectedImportYear) {
            importByMonth[month] = (importByMonth[month] || 0) + giaNhap * item.soLuongThuocNhap;
          }
        });

        const chartDataByMonth = Object.keys(importByMonth)
          .map(month => ({ name: `Tháng ${month}`, total: importByMonth[month] }))
          .sort((a, b) => parseInt(a.name.split(" ")[1]) - parseInt(b.name.split(" ")[1]));

        setImportDataByMonth(chartDataByMonth);
        setAvailableImportYears(Array.from(importYears).sort((a, b) => a - b));
      } catch (error) {
        console.error("Error fetching import data:", error.message);
      }
    };

    // Fetch dữ liệu doanh thu
    const fetchRevenueStatistics = async () => {
      try {
        const response = await axiosCus.get(`${URLGetInvoiceFromServer}${ChiNhanh}`);
        const data = response;

        const revenueInfo = [
          { name: 'Doanh thu chi nhánh', value: data.branchRevenue, percentage: data.branchPercentage.toFixed(2) },
          { name: 'Các chi nhánh khác', value: data.totalRevenue - data.branchRevenue, percentage: (100 - data.branchPercentage).toFixed(2) },
        ];

        setRevenueData(revenueInfo);
        setTotalRevenue(data.totalRevenue);
      } catch (error) {
        console.error("Error fetching revenue statistics:", error);
      }
    };

    // Fetch dữ liệu thuốc hết hạn
    const fetchMedicineData = async () => {
      try {
        const response = await axiosCus.get(URLListMedicine);
        setListMedicine(response.listMedicine);
      } catch (error) {
        console.error("Error fetching medicine data:", error);
      }
    };

    fetchRevenueData();
    fetchMonthlyRevenueData();
    fetchImportData();
    fetchRevenueStatistics();
    fetchMedicineData();
  }, [selectedRevenueYear, selectedRevenueMonth, selectedMonthYear, selectedImportYear]);

  // Cập nhật dữ liệu lợi nhuận theo năm
  useEffect(() => {
    const calculateProfitData = () => {
      const profitByMonth = dataByMonth.map((revenueItem, index) => {
        const importItem = importDataByMonth[index] || { total: 0 };
        return {
          name: revenueItem.name,
          revenue: revenueItem.total,
          importCost: importItem.total,
          profit: revenueItem.total - importItem.total,
        };
      });
      setProfitDataByMonth(profitByMonth);
    };

    calculateProfitData();
  }, [dataByMonth, importDataByMonth, selectedProfitYear]);

  return (
    <div className="container mt-4">
      {/* Biểu đồ doanh thu theo ngày */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Doanh thu theo ngày</h3>
        <div className="d-flex align-items-center">
          <label htmlFor="revenueYearSelect" className="me-2">Chọn năm:</label>
          <select
            id="revenueYearSelect"
            value={selectedRevenueYear}
            onChange={(e) => setSelectedRevenueYear(parseInt(e.target.value))}
            className="form-select me-2"
            style={{ width: '100px' }}
          >
            {availableRevenueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <label htmlFor="revenueMonthSelect" className="me-2">Chọn tháng:</label>
          <select
            id="revenueMonthSelect"
            value={selectedRevenueMonth}
            onChange={(e) => setSelectedRevenueMonth(parseInt(e.target.value))}
            className="form-select"
            style={{ width: '116px' }}
          >
            {availableRevenueMonths.map(month => (
              <option key={month} value={month}>{`Tháng ${month}`}</option>
            ))}
          </select>
        </div>
      </div>
      <RevenueByDateChart data={revenueDataByDate} />

      {/* Biểu đồ doanh thu theo tháng */}
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h3 className="mb-0">Doanh thu theo tháng</h3>
        <div className="d-flex align-items-center">
          <label htmlFor="monthYearSelect" className="me-2">Chọn năm:</label>
          <select
            id="monthYearSelect"
            value={selectedMonthYear}
            onChange={(e) => setSelectedMonthYear(parseInt(e.target.value))}
            className="form-select"
            style={{ width: '100px' }}
          >
            {availableMonthYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      <RevenueByMonthChart yearSelected={selectedMonthYear} data={dataByMonth} />

      <div className='row'>
        <div className='col-md-6 '>
          {/* Biểu đồ tỉ lệ doanh thu của chi nhánh */}
          <h3 className="mt-md-4">Tỉ lệ doanh thu của chi nhánh</h3>
          <RevenuePieChart data={revenueData} />
          <div className="text-center mt-3">
            <h5>Tổng doanh thu: {totalRevenue.toLocaleString()} VND</h5>
          </div>
        </div>

        <div className='col-md-6 '>
          {/* Biểu đồ thuốc hết hạn */}
          <h3 className="mt-4">Thuốc hết hạn và còn hạn</h3>
          <MedicineExpiryChart listMedicine={listMedicine} />
        </div>
      </div>

      {/* Biểu đồ tiền nhập theo tháng */}
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h3 className="mb-0">Tiền nhập theo tháng</h3>
        <div className="d-flex align-items-center">
          <label htmlFor="importYearSelect" className="me-2">Chọn năm:</label>
          <select
            id="importYearSelect"
            value={selectedImportYear}
            onChange={(e) => setSelectedImportYear(parseInt(e.target.value))}
            className="form-select"
            style={{ width: '100px' }}
          >
            {availableImportYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      <ImportByMonthChart yearSelected={selectedImportYear} data={importDataByMonth} />

      {/* Biểu đồ lợi nhuận theo tháng */}
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h3 className="mb-0">Lợi nhuận theo tháng</h3>
        <div className="d-flex align-items-center">
          <label htmlFor="profitYearSelect" className="me-2">Chọn năm:</label>
          <select
            id="profitYearSelect"
            value={selectedProfitYear}
            onChange={(e) => setSelectedProfitYear(parseInt(e.target.value))}
            className="form-select"
            style={{ width: '100px' }}
          >
            {availableProfitYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      <ProfitByMonthChart data={profitDataByMonth} />

      <div className="mt-4">
        <RevenueComparisonChart data={invoiceData} maNV={maNV} />
      </div>
      
      <div className="mt-4" >
        <TopEmployeesChart data={invoiceData} />
      </div>
    </div>
  );
};

export default Dashboard;
