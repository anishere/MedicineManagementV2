/* eslint-disable no-unused-vars */
// Trong SellMedicine.jsx

import React, { useEffect, useState } from "react";
import { axiosCus } from "../axios/axios";
import { URLEmployeID, URLListCustomer, URLListMedicine, URLCreateInvoice, URLAddMedicineToInvoice, URLGetCusByID, ChiNhanh, URLUpdateMedicine, URLListEmployee, URLUserByID, URLAddCustomer } from "../../URL/url";
import { Modal, Button, Table, InputNumber, Select, Input } from "antd";
import MedicineTable from "../components/tableMediforSell";
import CustomerTable from "../components/tableCusforSell";
import { Bounce, toast } from "react-toastify";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import dayjs from "dayjs";

function SellMedicine() {
    const [listMedicine, setListMedicine] = useState([]);
    const [listCustomer, setListCustomer] = useState([]);
    const [listNV, setListNV] = useState([]);
    const [medicineSelected, setMedicineSelected] = useState({
        id: '', 
        quantity: 0,
        name: '',
        price: 0,
        stock: 0,
    });
    const [idCustomer, setIdCustomer] = useState();
    const [customerSelected, setCustomerSelected] = useState({
        maKH: 'KH999',
        tenKH: 'Vãng lai',
        sdt: '9999',
        gt: '000',
        maCN: 'CN001',
    });
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [discountRate, setDiscountRate] = useState(0); // NEW: Giảm giá cho hóa đơn

    const [isUpdate, setIsUpdate] = useState(false);

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
        if(visible) console.log(visible.QuanLiThuoc.children.Ban.actions.lapHoaDon)
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(URLListMedicine); // Lấy dữ liệu từ API
                const medicines = res.listMedicine; // Danh sách thuốc từ API

                // Lọc thuốc còn hạn
                const currentDate = dayjs(); // Ngày hiện tại
                const validMedicines = medicines.filter(medicine =>
                dayjs(medicine.ngayHetHan).isAfter(currentDate) // Chỉ lấy thuốc có ngày hết hạn sau ngày hiện tại
                );

                // Cập nhật lại state với danh sách thuốc còn hạn
                setListMedicine(validMedicines);

                const rescus = await axiosCus.get(URLListCustomer);
                setListCustomer(rescus.listKhachHang);

                const resnv = await axiosCus.get(URLListEmployee);
                setListNV(resnv.listNhanVien);

                if (idCustomer) {
                    const resCusSelected = await axiosCus.get(`${URLGetCusByID}${idCustomer}`);
                    setCustomerSelected(resCusSelected.listKhachHang[0]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [idCustomer , isUpdate]);

    const getCusbyID = (CusID) => setIdCustomer(CusID);

    const getIDMedicine = (medicineID, nameMedicine, priceMedicine, stock) => {
        showModal();
        setMedicineSelected({ id: medicineID, quantity: 0, name: nameMedicine, price: priceMedicine, stock });
    };

    const addMedicineToInvoice = () => {
        if (medicineSelected.quantity > medicineSelected.stock) {
            toast.error('Số lượng thuốc vượt quá số lượng hiện có trong kho!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
            return;
        }

        if (medicineSelected.id && medicineSelected.quantity > 0) {
            const newItem = {
                id: medicineSelected.id,
                name: medicineSelected.name,
                quantity: medicineSelected.quantity,
                price: medicineSelected.price,
                totalPrice: medicineSelected.quantity * medicineSelected.price,
                stock: medicineSelected.stock,
            };
            setInvoiceItems([...invoiceItems, newItem]);
            handleCancel();
        }
    };

    const showModal = () => setIsModalOpen(true);
    const handleOk = () => addMedicineToInvoice();
    const handleCancel = () => setIsModalOpen(false);

    const confirmInvoice = async () => {
        if (!customerSelected || invoiceItems.length === 0) {
            Modal.warning({
                title: 'Thông báo',
                content: 'Vui lòng chọn khách hàng và thêm ít nhất một thuốc.',
                okText: 'Đóng',
            });
            return;
        }
    
        const employeeID = localStorage.getItem('maNV');
    
        try {
            Modal.confirm({
                title: 'Xác nhận hành động',
                content: 'Bạn muốn thực hiện hành động gì cho hóa đơn này?',
                footer: (
                    <div style={{ textAlign: "center" }}>
                        <Button onClick={async () => {
                            try {
                                await handleInvoiceSave(employeeID); // Lưu hóa đơn nếu chỉ xác nhận
                                toast.success('Hóa đơn đã được tạo thành công mà không in');
                                Modal.destroyAll(); // Đóng modal
                            } catch (error) {
                                console.error('Error saving invoice:', error);
                                toast.error('Có lỗi xảy ra khi lưu hóa đơn.'); // Thông báo lỗi
                            }
                        }}>
                            Chỉ xác nhận
                        </Button>
                        <Button className="mx-2" onClick={async () => {
                            try {
                                generatePDF(employeeID); // Tạo và tải PDF trước
                                await handleInvoiceSave(employeeID); // Lưu hóa đơn sau khi in PDF
                                Modal.destroyAll();
                            } catch (error) {
                                console.error('Error printing or saving invoice:', error);
                                toast.error('Có lỗi xảy ra khi in hoặc lưu hóa đơn.');
                            }
                        }}>
                            Xác nhận và in
                        </Button>
                        <Button onClick={() => {
                            toast.info('Bạn đã hủy hành động.');
                            Modal.destroyAll(); // Đóng modal khi chọn hủy
                        }}>
                            Hủy
                        </Button>
                    </div>
                ),
                onCancel() { Modal.destroyAll(); }
            });
        } catch (error) {
            console.error('Error during confirmation:', error);
            toast.error('Lỗi khi xác nhận hóa đơn');
        }
    };        

    const handleInvoiceSave = async (employeeID) => {
        try {
            const totalBeforeDiscount = invoiceItems.reduce((acc, item) => acc + item.totalPrice, 0);
            const discountAmount = (totalBeforeDiscount * discountRate) / 100;
            const totalAfterDiscount = totalBeforeDiscount - discountAmount;

            const invoiceRes = await axiosCus.post(URLCreateInvoice, {
                maNV: employeeID,
                maKH: customerSelected.maKH,
                ngayBan: new Date().toISOString(),
                maCN: ChiNhanh,
                tongGia: totalAfterDiscount,
                giaTruocGiam: totalBeforeDiscount,  // NEW: Tổng giá trước giảm
                giamGia: discountRate                // NEW: Tỷ lệ giảm giá
            });
    
            const maHD = invoiceRes.maHD;
    
            for (const item of invoiceItems) {
                await axiosCus.post(URLAddMedicineToInvoice, {
                    MaHD: maHD,
                    MaThuoc: item.id,
                    SoLuongBan: item.quantity,
                    MaCN: ChiNhanh
                });
    
                const medicineInfo = listMedicine.find(med => med.maThuoc === item.id);
                if (!medicineInfo) {
                    console.error(`Không tìm thấy thuốc với mã ${item.id}`);
                    continue;
                }
    
                const updatedStock = item.stock - item.quantity;
                const updatedMedicineData = {
                    ...medicineInfo,
                    soLuongThuocCon: updatedStock
                };
                await axiosCus.put(`${URLUpdateMedicine}${item.id}`, updatedMedicineData);
                setIsUpdate(!isUpdate);
            }
    
            setInvoiceItems([]);
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    };       

    const removeItemFromInvoice = (id) => {
        setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    };

    const columns = [
        { title: 'Tên thuốc', dataIndex: 'name', key: 'name' },
        { title: 'Đơn giá', dataIndex: 'price', key: 'price', render: (text) => `${text.toLocaleString()} VND` },
        { title: 'Số Lượng', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Thành tiền', dataIndex: 'totalPrice', key: 'totalPrice', render: (text) => `${text.toLocaleString()} VND` },
        {
            title: 'Hành động', key: 'action',
            render: (text, record) => (
                <Button type="link" onClick={() => removeItemFromInvoice(record.id)}>
                    Xóa
                </Button>
            ),
        },
    ];

    const totalBeforeDiscount = invoiceItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const discountAmount = (totalBeforeDiscount * discountRate) / 100;
    const totalAfterDiscount = totalBeforeDiscount - discountAmount;

    pdfMake.vfs = pdfFonts.pdfMake.vfs;
   
    const generatePDF = (employeeID) => {
        const employee = listNV.find((nv) => nv.maNV === employeeID);
        const employeeName = employee ? employee.tenNV : 'Không xác định';
    
        if (!customerSelected || invoiceItems.length === 0) {
            alert('Không có hóa đơn để in.');
            return;
        }
    
        const docDefinition = {
            content: [
                {
                    text: 'HÓA ĐƠN BÁN THUỐC',
                    fontSize: 16,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 20],
                },
                {
                    text: `Khách hàng: ${customerSelected.tenKH}`,
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Số điện thoại: ${customerSelected.sdt}`,
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Ngày lập: ${new Date().toLocaleDateString()}`,
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Nhân viên thực hiện: ${employeeName}`,
                    margin: [0, 0, 0, 20],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Tên thuốc', 'Số lượng', 'Đơn giá', 'Thành tiền'],
                            ...invoiceItems.map(item => [
                                item.name,
                                item.quantity,
                                `${item.price.toLocaleString()} VND`,
                                `${item.totalPrice.toLocaleString()} VND`
                            ])
                        ],
                    },
                    margin: [0, 20, 0, 0],
                },
                {
                    text: `Giá trước giảm: ${totalBeforeDiscount.toLocaleString()} VND`, // NEW
                    bold: true,
                    alignment: 'right',
                    margin: [0, 20, 0, 10]
                },
                {
                    text: `Giảm giá: ${discountRate}% (-${discountAmount.toLocaleString()} VND)`, // NEW
                    bold: true,
                    alignment: 'right',
                    margin: [0, 0, 0, 10]
                },
                {
                    text: `Tổng giá sau giảm: ${totalAfterDiscount.toLocaleString()} VND`, // NEW
                    bold: true,
                    alignment: 'right',
                    margin: [0, 0, 0, 10]
                }
            ],
        };
    
        pdfMake.createPdf(docDefinition).download(`hoa_don_${new Date().getTime()}.pdf`);
    };       
    
    //Thêm khách hàng
    const [isModalOpenAddCus, setIsModalOpenAddCus] = useState(false);

    const showModalCus = () => {
        setIsModalOpenAddCus(true);
    };

    const handleOkCus = () => {
        handleAddCustomer();
        setIsModalOpenAddCus(false);
    };

    const handleCancelCus = () => {
        setIsModalOpenAddCus(false);
    };

    const [customer, setCustomer] = useState({
        maKH: '',
        tenKH: '',
        sdt: '',
        gt: '',
        maCN: ChiNhanh,
    });

    const handleAddCustomer = async () => {
        if (customer.tenKH === '' || customer.sdt === '' || customer.gt === '') {
            toast.warn('Vui lòng điền đủ thông tin yêu cầu');
            return;
        }

        const newCustomer = { ...customer, maCN: ChiNhanh };

        try {
            await axiosCus.post(URLAddCustomer, newCustomer);
            toast.success('Thêm khách hàng mới thành công');
            setIsUpdate(!isUpdate);
        } catch (error) {
            console.error('Error adding customer:', error);
            toast.error('Thêm khách hàng thất bại');
        }
    };

    const handleClearDataCustomer = () => {
        setCustomer({
            maKH: '',
            tenKH: '',
            sdt: '',
            gt: '',
            maCN: ChiNhanh,
        });
    };

    return (
        <div className="wrap-sell">
            <div className="sellMedicine d-flex justify-content-between">
                <div className="section w-100 me-2 p-2">
                    <h5>Danh sách thuốc</h5>
                    <MedicineTable listMedicine={listMedicine} getIDMedicine={getIDMedicine} />
                    <h5>Danh sách khách hàng</h5>
                    <CustomerTable listCustomer={listCustomer} getCusbyID={getCusbyID} />
                </div>
                <div className="section w-100 me-2 p-2">
                    <h5>Chi tiết Hóa đơn</h5>
                    <p>Khách hàng: <b>{customerSelected && customerSelected.tenKH}</b></p>
                    <Table dataSource={invoiceItems} columns={columns} rowKey="id" pagination={false} />
                    <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                        <p>Giá trước giảm: {totalBeforeDiscount.toLocaleString()} VND</p>
                        <p>Giảm giá: 
                            <InputNumber
                                min={0}
                                max={100}
                                value={discountRate}
                                onChange={(value) => setDiscountRate(value || 0)}
                                formatter={(value) => `${value}%`}
                                style={{ marginLeft: '10px' }}
                            />
                        </p>
                        <p>Tổng giá sau giảm: {totalAfterDiscount.toLocaleString()} VND</p>
                    </div>
                    <div className="text-end">
                        {visible && visible.QuanLiKhachHang.actions.them &&
                            <Button type="primary me-2" onClick={showModalCus}>
                                Thêm khách hàng
                            </Button>
                        }
                        {visible && visible.QuanLiThuoc.children.Ban.actions.lapHoaDon &&
                        <Button type="primary" onClick={confirmInvoice} style={{ marginTop: '10px' }}>
                            Xác nhận và in
                        </Button>
                        }
                    </div>
                    
                </div>
            </div>

            <Modal
                title="Nhập số lượng"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                centered
                bodyStyle={{
                    padding: "20px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                }}
                style={{
                    borderRadius: "12px",
                    overflow: "hidden",
                }}
            >
                <p style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>
                    <label htmlFor="quantity-input" style={{ marginRight: "8px" }}>Nhập số lượng:</label>
                    <input
                        id="quantity-input"
                        value={medicineSelected.quantity === 0 ? "" : medicineSelected.quantity}
                        onChange={(e) => {
                            const value = e.target.value.trim();
                            setMedicineSelected({
                                ...medicineSelected,
                                quantity: value === "" ? 0 : parseInt(value),
                            });
                        }}
                        type="number"
                        style={{
                            padding: "8px",
                            width: "60%",
                            fontSize: "14px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            outline: "none",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => e.target.select()}
                        onBlur={(e) => {
                            if (!e.target.value.trim()) {
                                setMedicineSelected({
                                    ...medicineSelected,
                                    quantity: 0,
                                });
                            }
                        }}
                    />
                </p>
            </Modal>

            <Modal 
            title="Thêm khách hàng" 
            open={isModalOpenAddCus} 
            onOk={handleOkCus} 
            onCancel={handleCancelCus}
            okText="Thêm"
            cancelText="Hủy"
            >
            <div className="">
                    <h3 className="mb-3">THÔNG TIN KHÁCH HÀNG</h3>
                    <div className="infoCustomer-detail">
                        <p className="d-flex align-items-center">
                            <label className="col-3 text-start fw-bold">Tên KH</label>
                            <Input value={customer.tenKH} onChange={e => setCustomer({ ...customer, tenKH: e.target.value })} className="col-9" />
                        </p>
                        <p className="d-flex align-items-center">
                            <label className="col-3 text-start fw-bold">SĐT</label>
                            <Input value={customer.sdt} onChange={e => setCustomer({ ...customer, sdt: e.target.value })} className="col-9" />
                        </p>
                        <p className="d-flex align-items-center">
                            <label className="col-3 text-start fw-bold">Giới Tính</label>
                            <Select 
                                value={customer.gt} 
                                onChange={(value) => setCustomer({ ...customer, gt: value })} 
                                className="col-9"
                            >
                                <Select.Option value="nam">Nam</Select.Option>
                                <Select.Option value="nữ">Nữ</Select.Option>
                                <Select.Option value="000">Không rõ</Select.Option>
                            </Select>
                        </p>
                        <div className="button-group mt-3">
                            <Button 
                                onClick={handleClearDataCustomer} 
                                style={{ backgroundColor: 'gray', borderColor: 'gray', color: 'white' }}
                            >
                                Xóa thông tin
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default SellMedicine;
