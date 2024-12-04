/* eslint-disable react-hooks/rules-of-hooks */
import { Button, Input, Modal, Space, Table } from "antd";
import { useEffect, useRef, useState } from "react";
import { axiosCus } from "../axios/axios";
import { URLDeleDetailByIDInvoice, URLDeleteInvoice, URLDetailsInvoice, URLGetInvoice, URLListCustomer, URLListEmployee, URLListInvouces, URLListMedicine, URLUserByID } from "../../URL/url";
import Highlighter from "react-highlight-words";
import { DeleteOutlined, PrinterOutlined, SearchOutlined } from "@ant-design/icons";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

function invoices() {
    const [listInvoices, setListInvoices] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [idSelected, setIdSelected] = useState('');
    
    const [invoiceData, setInvoiceData] = useState();
    const [invoiceDetails, setInvoiceDetails] = useState();
    const [listMedicine, setListMedicine] = useState();

    const [filterDate, setFilterDate] = useState({ day: "", month: "", year: "" });

    // State lưu thông tin khách hàng
    const [customerInfo, setCustomerInfo] = useState({ tenKH: '', sdtKH: '' });

    // visible
    const [visible, setVisible] = useState();

    useEffect(() => {
        const fetchEmployees = async () => {
            const userID = localStorage.getItem("userID");

            try {
                const response = await axiosCus.get(`${URLUserByID}${userID}`);
                setVisible(JSON.parse(response.user[0].visibleFunction));
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        
        fetchEmployees(); 
    }, []);

    const fetchData = async () => {
        try {
            const res = await axiosCus.get(URLListMedicine);
            setListMedicine(res.listMedicine);

            const [resInvoices, resCustomers, resEmployees] = await Promise.all([
                axiosCus.get(URLListInvouces),
                axiosCus.get(URLListCustomer),
                axiosCus.get(URLListEmployee)
            ]);

            const customerDict = {};
            resCustomers.listKhachHang.forEach(customer => {
                customerDict[customer.maKH] = {
                    tenKH: customer.tenKH,
                    sdt: customer.sdt
                };
            });

            const employeeDict = {};
            resEmployees.listNhanVien.forEach(employee => {
                employeeDict[employee.maNV] = employee.tenNV;
            });

            const updatedInvoices = resInvoices.listHoaDon.map(invoice => ({
                ...invoice,
                tenKH: customerDict[invoice.maKH]?.tenKH || 'Không rõ',
                sdtKH: customerDict[invoice.maKH]?.sdt || 'Không rõ',
                tenNV: employeeDict[invoice.maNV] || 'Không rõ',
            }));

            updatedInvoices.sort((a, b) => {
                const dateA = a.maHD.split('-')[0]; // Lấy phần ngày tháng năm từ maHD
                const dateB = b.maHD.split('-')[0];
                
                // So sánh ngày tháng theo thứ tự giảm dần (mới nhất trước)
                return dateB.localeCompare(dateA);
            });
              
              setListInvoices(updatedInvoices);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isUpdate]);      
    
    const getIDInvoice = (invoiceID) => {
        setIdSelected(invoiceID);

        const selectedInvoice = listInvoices.find(invoice => invoice.maHD === invoiceID);
        if (selectedInvoice) {
            setCustomerInfo({
                tenKH: selectedInvoice.tenKH,
                sdtKH: selectedInvoice.sdtKH
            });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(`${URLGetInvoice}${idSelected}`);
                const selectedInvoice = res.listHoaDon[0];
                setInvoiceData(selectedInvoice);
    
                const selectedInvoiceFromList = listInvoices.find(invoice => invoice.maHD === selectedInvoice.maHD);
                const employeeName = selectedInvoiceFromList ? selectedInvoiceFromList.tenNV : 'Không rõ';
                selectedInvoice.tenNV = employeeName;
    
                const resDetailsInvoice = await axiosCus.get(`${URLDetailsInvoice}${idSelected}`);
                const invoiceDetails = resDetailsInvoice.listThuocTrongHD.map(detail => {
                    const medicine = listMedicine.find(med => med.maThuoc === detail.maThuoc);
                    return {
                        ...detail,
                        tenThuoc: medicine ? medicine.tenThuoc : 'Không rõ',
                        giaBan: medicine ? medicine.giaBan : 0,
                        thanhTien: medicine ? detail.soLuongBan * medicine.giaBan : 0
                    };
                });
                setInvoiceDetails(invoiceDetails);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        if (idSelected) {
            fetchData();
        }
    }, [idSelected, listMedicine, listInvoices]);    
    
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const columns = [
        {
            title: 'Mã phiếu thu',
            dataIndex: 'maHD',
            key: 'maHD',
            ...getColumnSearchProps('maHD'),
        },
        {
            title: 'Tên khách hàng',
            dataIndex: 'tenKH',
            key: 'tenKH',
            ...getColumnSearchProps('tenKH'),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'sdtKH',
            key: 'sdtKH',
            ...getColumnSearchProps('sdtKH'),
        },
        {
            title: 'Tên nhân viên',
            dataIndex: 'tenNV',
            key: 'tenNV',
            ...getColumnSearchProps('tenNV'),
        },
        {
            title: 'Ngày lập',
            dataIndex: 'ngayBan',
            key: 'ngayBan',
            ...getColumnSearchProps('ngayBan'),
            render: (text) => {
                // Chuyển đổi thành đối tượng Date và định dạng theo kiểu 'dd/mm/yyyy'
                const date = new Date(text);
                return date.toLocaleDateString('vi-VN');  // "vi-VN" để hiển thị ngày theo định dạng Việt Nam
            }
        },
        {
            title: 'Tổng giá',
            dataIndex: 'tongGia',
            key: 'tongGia',
            ...getColumnSearchProps('tongGia'),
            render: (text) => {
                // Định dạng giá trị thành tiền tệ VNĐ
                return text ? `${text.toLocaleString('vi-VN')}` : 'Chưa có giá';
            }
        }
    ];       

    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const generatePDF = () => {
        if (!invoiceData || !invoiceDetails) {
            alert('Không có phiếu thu để in.');
            return;
        }
    
        const docDefinition = {
            content: [
                {
                    text: 'PHIẾU THU BÁN THUỐC',
                    fontSize: 16,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 20],
                },
                {
                    text: `Khách hàng: ${customerInfo.tenKH}`,
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Số điện thoại: ${customerInfo.sdtKH}`,
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Ngày lập: ${new Date(invoiceData.ngayBan).toLocaleDateString()}`,
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Nhân viên thực hiện: ${invoiceData.tenNV || 'Không rõ'}`,
                    margin: [0, 0, 0, 20],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Tên thuốc', 'Số lượng', 'Đơn giá', 'Thành tiền'],
                            ...invoiceDetails.map(detail => [
                                detail.tenThuoc, 
                                detail.soLuongBan, 
                                `${detail.giaBan.toLocaleString()} VND`, 
                                `${detail.thanhTien.toLocaleString()} VND`
                            ])
                        ],
                    },
                    margin: [0, 20, 0, 0],
                },
                {
                    text: `Giá trước giảm: ${invoiceData.giaTruocGiam.toLocaleString()} VND`, // NEW
                    bold: true,
                    alignment: 'right',
                    margin: [0, 20, 0, 10]
                },
                {
                    text: `Giảm giá: ${invoiceData.giamGia}% (-${((invoiceData.giaTruocGiam * invoiceData.giamGia) / 100).toLocaleString()} VND)`, // NEW
                    bold: true,
                    alignment: 'right',
                    margin: [0, 0, 0, 10]
                },
                {
                    text: `Tổng giá sau giảm: ${invoiceData.tongGia.toLocaleString()} VND`, // NEW
                    bold: true,
                    alignment: 'right',
                    margin: [0, 0, 0, 10]
                }
            ],
        };
    
        pdfMake.createPdf(docDefinition).download(`phieu_thu_${new Date().getTime()}.pdf`);
    };

    const handleDeleteInvoice = () => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa tất cả các thuốc trong phiếu thu này?',
            okText: 'Xác nhận',
            cancelText: 'Hủy bỏ',
            onOk: () => {
                const fetchData = async () => {
                    try {
                        await axiosCus.delete(`${URLDeleDetailByIDInvoice}${idSelected}`);
                        await axiosCus.delete(`${URLDeleteInvoice}${idSelected}`);
                        setIsUpdate(!isUpdate);
                        setInvoiceData(null);
                        setInvoiceDetails(null);
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                };
                fetchData();
            },
            onCancel() {
                console.log('Hủy xóa phiếu thu');
            }
        });
    };

    //filter
    const handleFilter = () => {
        const { day, month, year } = filterDate;
        const filteredInvoices = listInvoices.filter(invoice => {
            const invoiceDate = new Date(invoice.ngayBan);
            const isMatchDay = day ? invoiceDate.getDate() === day : true;
            const isMatchMonth = month ? invoiceDate.getMonth() + 1 === month : true;
            const isMatchYear = year ? invoiceDate.getFullYear() === year : true;
    
            return isMatchDay && isMatchMonth && isMatchYear;
        });
        setListInvoices(filteredInvoices);
    };
    
    const handleResetFilter = () => {
        setFilterDate({ day: "", month: "", year: "" });
        // Reset lại dữ liệu ban đầu, ví dụ như gọi lại API để lấy lại tất cả các phiếu thu
        fetchData();
    };
    
    
    return (
    <>
        <div className="w-100">
            <div className="wrap-invoices d-flex">
                <Table
                    className="table-medicine table-invoices"
                    columns={columns}
                    dataSource={listInvoices}
                    rowKey="maHD"
                    pagination={{ pageSize: 10 }} 
                    onRow={(record) => ({
                        onClick: () => {
                            getIDInvoice(record.maHD);
                        },
                        onMouseEnter: (e) => {
                            e.currentTarget.style.cursor = 'pointer'; 
                        },
                    })}
                />

                <div className="sec-infoMedicine sec-invoices p-1">
                    <h3 className="mb-3">THÔNG TIN PHIẾU THU</h3>
                    {invoiceData && (
                        <>
                            <p><strong>Khách hàng:</strong> {customerInfo.tenKH}</p>
                            <p><strong>Số điện thoại:</strong> {customerInfo.sdtKH}</p>
                            <p><strong>Nhân viên thực hiện:</strong> {invoiceData.tenNV}</p>
                            {invoiceDetails && invoiceDetails.length > 0 ? (
                                <>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Tên thuốc</th>
                                                <th>Số lượng</th>
                                                <th>Đơn giá</th>
                                                <th>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceDetails.map((detail, index) => (
                                                <tr key={index}>
                                                    <td>{detail.tenThuoc}</td>
                                                    <td>{detail.soLuongBan}</td>
                                                    <td>{detail.giaBan.toLocaleString()} VND</td>
                                                    <td>{detail.thanhTien.toLocaleString()} VND</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <h5>Giá trước giảm: {invoiceData.giaTruocGiam.toLocaleString()} VND</h5>
                                    <h5>Giảm giá: {invoiceData.giamGia}% (-{((invoiceData.giaTruocGiam * invoiceData.giamGia) / 100).toLocaleString()} VND)</h5>
                                    <h5 className="text-primary">Tổng giá sau giảm: {invoiceData.tongGia.toLocaleString()} VND</h5>
                                </>
                            ) : (
                                <p className="text-center">Chọn 1 phiếu thu để xem thông tin chi tiết.</p>
                            )}
                            <div className="text-end">
                                <Button className="me-1" onClick={generatePDF} type="primary" style={{ marginTop: '20px' }}>
                                    In <PrinterOutlined />
                                </Button>
                                {visible && visible.QuanLiThuoc.children.HoaDon.actions.xoa &&
                                <Button onClick={handleDeleteInvoice}  danger style={{ marginTop: '20px' }}>
                                    Xóa <DeleteOutlined />
                                </Button>
                                }
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="filter-section">
                <h5>Lọc phiếu thu</h5>
                <div className="row">
                    <div className="col-md-4">
                        <label>Ngày</label>
                        <Input
                            type="number"
                            value={filterDate.day || ""}
                            onChange={(e) => setFilterDate({ ...filterDate, day: parseInt(e.target.value) })}
                            placeholder="Ngày"
                        />
                    </div>
                    <div className="col-md-4">
                        <label>Tháng</label>
                        <Input
                            type="number"
                            value={filterDate.month || ""}
                            onChange={(e) => setFilterDate({ ...filterDate, month: parseInt(e.target.value) })}
                            placeholder="Tháng"
                        />
                    </div>
                    <div className="col-md-4">
                        <label>Năm</label>
                        <Input
                            type="number"
                            value={filterDate.year || ""}
                            onChange={(e) => setFilterDate({ ...filterDate, year: parseInt(e.target.value) })}
                            placeholder="Năm"
                        />
                    </div>
                </div>
                <div className="mt-3">
                    <Button onClick={handleFilter} type="primary">Áp Dụng Lọc</Button>
                    <Button onClick={handleResetFilter} style={{ marginLeft: "10px" }}>Reset Lọc</Button>
                </div>
            </div>
        </div>
    </>
    );
}

export default invoices;
