/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import { Table, Input, Button, Space, Modal, DatePicker } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { axiosCus } from "../axios/axios";
import {
    URLListCungCap,
    URLAddCungCap,
    URLUpdateCungCap,
    URLDeleteCungCap,
    ChiNhanh,
    URLUserByID,
    URLUpdateMedicine,
    URLMedicineByID,
} from "../../URL/url";
import { Bounce, toast } from "react-toastify";
import dayjs from "dayjs";

import * as XLSX from 'xlsx';

function ImportManagement() {
    const [listCungCap, setListCungCap] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);

    const [data, setData] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        handleImport()
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleImport = async () => {
        const maNV = selectedCungCap.maNV;
        const maNCC = selectedCungCap.maNCC;
        const ngayCC = selectedCungCap.ngayCungCap?.format("YYYY-MM-DD");
    
        let isSuccess = true; // Biến kiểm tra tất cả thao tác có thành công hay không
    
        for (const item of data) {
            // Chuyển đổi key của object từ data
            const payload = {
                maNV: maNV,
                maNCC: maNCC,
                ngayCungCap: ngayCC,
                maThuoc: item["Mã Thuốc"], // Key trong object gốc
                soLuongNhap: item["Số Lượng Nhập"], // Key trong object gốc
                gia: item["Giá"], // Key trong object gốc
            };
    
            try {
                // Lấy thông tin thuốc hiện tại từ API
                const res = await axiosCus.get(`${URLMedicineByID}${payload.maThuoc}`);
                const medicine = res.listMedicine?.[0];
    
                if (!medicine) {
                    console.error(`Không tìm thấy thông tin thuốc với mã: ${payload.maThuoc}`);
                    isSuccess = false; // Nếu không tìm thấy thuốc thì báo lỗi
                    continue; // Bỏ qua vòng lặp này
                }
    
                // Đảm bảo cả hai giá trị là số nguyên trước khi cộng
                const soLuongThuocCon = parseInt(medicine.soLuongThuocCon, 10) || 0;
                const soLuongThuocNhap = parseInt(payload.soLuongNhap, 10) || 0;
    
                // Cập nhật số lượng thuốc
                const medicineUpdate = {
                    ...medicine,
                    soLuongThuocCon: soLuongThuocCon + soLuongThuocNhap,
                };
    
                // Gửi yêu cầu cập nhật thuốc
                await axiosCus.put(`${URLUpdateMedicine}${medicine.maThuoc}`, medicineUpdate);
                console.log(`Thuốc ${medicine.maThuoc} cập nhật thành công.`);
    
                // Thêm cung cấp
                await axiosCus.post(URLAddCungCap, payload);
            } catch (error) {
                console.error(`Lỗi khi xử lý thuốc với mã: ${payload.maThuoc}`, error);
                isSuccess = false; // Đánh dấu là có lỗi trong quá trình
            }
        }
    
        // Kiểm tra sau khi vòng lặp hoàn tất
        if (isSuccess) {
            toast.success("Tất cả thao tác đã thành công!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        } else {
            toast.error("Đã có lỗi xảy ra trong quá trình xử lý!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    };               

    const [selectedCungCap, setSelectedCungCap] = useState({
        idCungCap: "",
        maNV: "",
        maNCC: "",
        maThuoc: "",
        ngayCungCap: null,
        soLuongThuocNhap: "",
        maCN: ChiNhanh,
        giaNhap: "",
    });

    const [isUpdate, setIsUpdate] = useState(false);

    const [filterDate, setFilterDate] = useState({
        day: 0, // Default 0 means no filter
        month: 0, // Default 0 means no filter
        year: 0, // Default 0 means no filter
    });

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

    // Fetch dữ liệu function
    const fetchData = async () => {
        try {
            const res = await axiosCus.get(URLListCungCap);
            const formattedData = res.listCungCap.map((item) => ({
                ...item,
                ngayCungCap: item.ngayCungCap
                    ? dayjs(item.ngayCungCap, "YYYY-MM-DD")
                    : null,
            }));
            setListCungCap(formattedData || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isUpdate]);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: "block" }}
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
            <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            ),
    });

    const columns = [
        { title: "ID Cung Cấp", dataIndex: "idCungCap", key: "idCungCap" },
        { title: "Mã NV", dataIndex: "maNV", key: "maNV", ...getColumnSearchProps("maNV") },
        { title: "Mã NCC", dataIndex: "maNCC", key: "maNCC", ...getColumnSearchProps("maNCC") },
        { title: "Mã Thuốc", dataIndex: "maThuoc", key: "maThuoc", ...getColumnSearchProps("maThuoc") },
        {
            title: "Ngày Cung Cấp",
            dataIndex: "ngayCungCap",
            key: "ngayCungCap",
            render: (text) => (text ? dayjs(text).format("DD/MM/YYYY") : ""),
        },
        { title: "Số Lượng Nhập", dataIndex: "soLuongThuocNhap", key: "soLuongThuocNhap", ...getColumnSearchProps("soLuongThuocNhap") },
        {
            title: "Giá Nhập",
            dataIndex: "giaNhap",
            key: "giaNhap",
            render: (text) => {
                if (text) {
                    return `${text.toLocaleString()}đ`;
                }
                return '';
            },
        },
    ];

    const handleAdd = async () => {
        try {
            // Chuẩn bị payload cho việc thêm cung cấp
            const payload = {
                ...selectedCungCap,
                ngayCungCap: selectedCungCap.ngayCungCap?.format("YYYY-MM-DD"),
            };
    
            // Lấy thông tin thuốc hiện tại
            const res = await axiosCus.get(`${URLMedicineByID}${payload.maThuoc}`);
            const medicine = res.listMedicine?.[0]; // Đảm bảo lấy đúng dữ liệu
            
            if (!medicine) {
                throw new Error("Không tìm thấy thông tin thuốc.");
            }

            // Đảm bảo cả hai giá trị là số nguyên trước khi cộng
            const soLuongThuocCon = parseInt(medicine.soLuongThuocCon, 10) || 0;
            const soLuongThuocNhap = parseInt(payload.soLuongThuocNhap, 10) || 0;
    
            // Cập nhật số lượng thuốc
            const medicineUpdate = {
                ...medicine,
                soLuongThuocCon: soLuongThuocCon + soLuongThuocNhap,
            };
    
            // Gửi yêu cầu cập nhật thuốc
            await axiosCus.put(`${URLUpdateMedicine}${medicine.maThuoc}`, medicineUpdate);
            console.log("Medicine updated successfully");
    
            // Thêm cung cấp
            await axiosCus.post(URLAddCungCap, payload);
    
            // Thông báo thêm thành công
            // Thông báo cập nhật thành công
            toast.success("Cập nhật thành công!", {
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
    
            // Cập nhật lại trạng thái
            setIsUpdate(!isUpdate);
            handleClear();
        } catch (error) {
            console.error("Error processing request:", error);
            toast.error("Thao tác thất bại!");
        }
    };    

    const handleUpdate = async () => {
        try {
            const payload = {
                ...selectedCungCap,
                ngayCungCap: selectedCungCap.ngayCungCap?.format("YYYY-MM-DD"),
            };
            await axiosCus.put(`${URLUpdateCungCap}${selectedCungCap.idCungCap}`, payload);
            toast.success("Cập nhật thành công!");
            setIsUpdate(!isUpdate);
            handleClear();
        } catch (error) {
            console.error("Error updating record:", error);
            toast.error("Cập nhật thất bại!");
        }
    };

    const handleDelete = async () => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Bạn có chắc chắn muốn xóa bản ghi này?",
            okText: "Xác nhận",
            cancelText: "Hủy bỏ",
            onOk: async () => {
                try {
                    await axiosCus.delete(`${URLDeleteCungCap}${selectedCungCap.idCungCap}`);
                    toast.success("Xóa thành công!");
                    setIsUpdate(!isUpdate);
                    handleClear();
                } catch (error) {
                    console.error("Error deleting record:", error);
                    toast.error("Xóa thất bại!");
                }
            },
        });
    };

    const handleClear = () => {
        setSelectedCungCap({
            idCungCap: "",
            maNV: "",
            maNCC: "",
            maThuoc: "",
            ngayCungCap: null,
            soLuongThuocNhap: "",
            maCN: ChiNhanh,
            giaNhap: "",
        });
    };

    const handleFilter = () => {
        let filteredData = listCungCap;

        if (filterDate.day !== 0) {
            filteredData = filteredData.filter(item => dayjs(item.ngayCungCap).date() === filterDate.day);
        }

        if (filterDate.month !== 0) {
            filteredData = filteredData.filter(item => dayjs(item.ngayCungCap).month() + 1 === filterDate.month);
        }

        if (filterDate.year !== 0) {
            filteredData = filteredData.filter(item => dayjs(item.ngayCungCap).year() === filterDate.year);
        }

        setListCungCap(filteredData);
    };

    const handleResetFilter = () => {
        setFilterDate({ day: 0, month: 0, year: 0 });
        fetchData(); // Reset to the original list
    };

    //xu ly file excel
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const binaryStr = event.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });

            // Lấy dữ liệu từ sheet đầu tiên
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Chuyển đổi dữ liệu từ sheet thành JSON
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            setData(jsonData); // Lưu dữ liệu vào state
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-8">
                    <h4 className="mb-3">Danh sách cung cấp</h4>
                    <Table
                        className="table-cungcap"
                        columns={columns}
                        dataSource={listCungCap}
                        rowKey="idCungCap"
                        onRow={(record) => ({
                            onClick: () => {
                                setSelectedCungCap(record);  // Cập nhật thông tin chi tiết dòng đã chọn
                                setIsUpdate(true);  // Chuyển sang chế độ cập nhật khi có dòng được chọn
                            },
                        })}
                    />
                </div>

                <div className="col-md-4">
                    <h4 className="mb-3">Thêm / Cập nhật cung cấp</h4>
                    <p>ID: <small>{selectedCungCap.idCungCap}</small></p>
                    <div className="form-group">
                        <label htmlFor="maNV">Mã NV:</label>
                        <Input
                            id="maNV"
                            value={selectedCungCap.maNV}
                            onChange={(e) => setSelectedCungCap({ ...selectedCungCap, maNV: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="maNCC">Mã NCC:</label>
                        <Input
                            id="maNCC"
                            value={selectedCungCap.maNCC}
                            onChange={(e) => setSelectedCungCap({ ...selectedCungCap, maNCC: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="maThuoc">Mã Thuốc:</label>
                        <Input
                            id="maThuoc"
                            value={selectedCungCap.maThuoc}
                            onChange={(e) => setSelectedCungCap({ ...selectedCungCap, maThuoc: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="ngayCungCap">Ngày Cung Cấp:</label>
                        <DatePicker
                            id="ngayCungCap"
                            value={selectedCungCap.ngayCungCap}
                            onChange={(date) => setSelectedCungCap({ ...selectedCungCap, ngayCungCap: date })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="soLuongThuocNhap">Số Lượng Nhập:</label>
                        <Input
                            id="soLuongThuocNhap"
                            value={selectedCungCap.soLuongThuocNhap}
                            onChange={(e) => setSelectedCungCap({ ...selectedCungCap, soLuongThuocNhap: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="giaNhap">Giá Nhập:</label>
                        <Input
                            id="giaNhap"
                            value={selectedCungCap.giaNhap}
                            onChange={(e) => setSelectedCungCap({ ...selectedCungCap, giaNhap: e.target.value })}
                        />
                    </div>

                    <div className="form-group mt-3">
                        {visible && visible.QuanLiNhapHang.children.DanhSachNhapHang.actions.them &&
                        <Button type="primary" onClick={handleAdd}>
                            Thêm
                        </Button>
                        }

                        {visible && visible.QuanLiNhapHang.children.DanhSachNhapHang.actions.sua && (
                            <Button type="primary" onClick={handleUpdate} style={{ marginLeft: "10px" }}>
                                Cập nhật
                            </Button>
                        )}

                        {visible && visible.QuanLiNhapHang.children.DanhSachNhapHang.actions.xoa && (
                            <Button danger onClick={handleDelete} style={{ marginLeft: "10px" }}>
                                Xóa
                            </Button>
                        )}

                        <Button onClick={handleClear} style={{ marginLeft: "10px" }}>
                            Hủy
                        </Button>

                        {visible && visible.QuanLiNhapHang.children.DanhSachNhapHang.actions.them &&
                        <Button className="mt-3" type="primary" onClick={showModal}>
                            Nhập danh sách
                        </Button>
                        }
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
                <h5>Filter</h5>
                <div className="row">
                    <div className="col-md-4">
                        <label>Ngày</label>
                        <Input
                            type="number"
                            value={filterDate.day || ""}
                            onChange={(e) => setFilterDate({ ...filterDate, day: parseInt(e.target.value) })}
                            placeholder="Day"
                        />
                    </div>
                    <div className="col-md-4">
                        <label>Tháng</label>
                        <Input
                            type="number"
                            value={filterDate.month || ""}
                            onChange={(e) => setFilterDate({ ...filterDate, month: parseInt(e.target.value) })}
                            placeholder="Month"
                        />
                    </div>
                    <div className="col-md-4">
                        <label>Năm</label>
                        <Input
                            type="number"
                            value={filterDate.year || ""}
                            onChange={(e) => setFilterDate({ ...filterDate, year: parseInt(e.target.value) })}
                            placeholder="Year"
                        />
                    </div>
                </div>
                <div className="mt-3">
                    <Button onClick={handleFilter} type="primary">Áp Dụng Lọc</Button>
                    <Button onClick={handleResetFilter} style={{ marginLeft: "10px" }}>Reset Lọc</Button>
                </div>
            </div>

            <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                    <div className="form-group">
                        <label htmlFor="maNV">Mã NV:</label>
                        <Input
                            id="maNV"
                            value={selectedCungCap.maNV}
                            onChange={(e) => setSelectedCungCap({ ...selectedCungCap, maNV: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="maNCC">Mã NCC:</label>
                        <Input
                            id="maNCC"
                            value={selectedCungCap.maNCC}
                            onChange={(e) => setSelectedCungCap({ ...selectedCungCap, maNCC: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="ngayCungCap">Ngày Cung Cấp:</label>
                        <DatePicker
                            id="ngayCungCap"
                            value={selectedCungCap.ngayCungCap}
                            onChange={(date) => setSelectedCungCap({ ...selectedCungCap, ngayCungCap: date })}
                        />
                    </div>

                    <h5 className="mt-3">Hãy upload 1 file excel (đúng mẫu)</h5>

                    <div className="ant-upload">
                    <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        onChange={handleFileUpload} 
                        className="ant-input ant-input-lg"
                    />
                    </div>
            </Modal>
        </div>
    );
}

export default ImportManagement;
