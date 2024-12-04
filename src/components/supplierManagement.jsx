/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import { Table, Input, Button, Space, Modal } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { axiosCus } from "../axios/axios";
import { URLGetAllSupplier, URLGetSupplierByID, URLAddSupplier, URLUpdateSupplier, URLDeleteSupplier, URLUserByID, URLListCungCap } from "../../URL/url";
import { Bounce, toast } from "react-toastify";

function SupplierManagement() {
    const [listSuppliers, setListSuppliers] = useState([]);
    const [listCC, setListCC] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [idSelected, setIdSelected] = useState('');
    const [supplierData, setSupplierData] = useState();
    const [isUpdate, setIsUpdate] = useState(false);

    const [supplier, setSupplier] = useState({
        maNCC: '',
        tenNCC: '',
        diaChi: '',
        sdt: '',
        email: '',
    });

    // visible
    const [visible, setVisible] = useState();

    useEffect(() => {
        const fetchEmployees = async () => {
            const userID = localStorage.getItem("userID");

            try {
                const response = await axiosCus.get(`${URLUserByID}${userID}`);
                setVisible(JSON.parse(response.user[0].visibleFunction));

                const res = await axiosCus.get(URLListCungCap)
                setListCC(res.listCungCap)
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        
        fetchEmployees();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(URLGetAllSupplier);
                setListSuppliers(res.listNhaCungCap);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [isUpdate]);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const getIDSupplier = (supplierID) => {
        setIdSelected(supplierID);
    };

    const columns = [
        { title: 'Mã NCC', dataIndex: 'maNCC', key: 'maNCC', ...getColumnSearchProps('maNCC') },
        { title: 'Tên NCC', dataIndex: 'tenNCC', key: 'tenNCC', ...getColumnSearchProps('tenNCC') },
        { title: 'Địa Chỉ', dataIndex: 'diaChi', key: 'diaChi', ...getColumnSearchProps('diaChi') },
        { title: 'SĐT', dataIndex: 'sdt', key: 'sdt', ...getColumnSearchProps('sdt') },
        { title: 'Email', dataIndex: 'email', key: 'email', ...getColumnSearchProps('email') },
    ];

    useEffect(() => {
        if (idSelected) {
            const fetchData = async () => {
                try {
                    const res = await axiosCus.get(`${URLGetSupplierByID}${idSelected}`);
                    setSupplierData(res.listNhaCungCap[0]);
                } catch (error) {
                    console.error('Error fetching supplier data:', error);
                }
            };
            fetchData();
        }
    }, [idSelected]);

    useEffect(() => {
        if (supplierData) {
            setSupplier({
                maNCC: supplierData.maNCC,
                tenNCC: supplierData.tenNCC,
                diaChi: supplierData.diaChi,
                sdt: supplierData.sdt,
                email: supplierData.email,
            });
        }
    }, [supplierData]);

    const handleUpdateSupplier = async () => {
        // Kiểm tra xem `idSelected` có được chọn không
        if (!idSelected && supplier.maNCC === '') {
            toast.warn('Chưa chọn nhà cung cấp để cập nhật');
            return;
        }
    
        // Kiểm tra xem `maNCC` có tồn tại trong danh sách không
        const isExist = listSuppliers.some(sup => sup.maNCC === supplier.maNCC);
        if (!isExist) {
            toast.error('Mã nhà cung cấp không tồn tại trong danh sách');
            return;
        }
    
        // Thực hiện cập nhật
        try {
            await axiosCus.put(`${URLUpdateSupplier}${supplier.maNCC}`, supplier);
            toast.success('Cập nhật nhà cung cấp thành công');
            setIsUpdate(!isUpdate); // Cập nhật danh sách
        } catch (error) {
            console.error('Error updating supplier:', error);
            toast.error('Cập nhật thất bại');
        }
    };    

    const handleAddSupplier = async () => {
        // Kiểm tra thông tin đầy đủ
        if (!supplier.maNCC || !supplier.tenNCC || !supplier.diaChi || !supplier.sdt || !supplier.email) {
            toast.warn('Vui lòng điền đủ thông tin yêu cầu');
            return;
        }
    
        // Kiểm tra xem `maNCC` đã tồn tại trong danh sách chưa
        const isExist = listSuppliers.some(sup => sup.maNCC === supplier.maNCC);
        if (isExist) {
            toast.error('Mã nhà cung cấp đã tồn tại');
            return;
        }
    
        // Thực hiện thêm mới
        try {
            await axiosCus.post(URLAddSupplier, supplier);
            toast.success('Thêm nhà cung cấp mới thành công');
            setIsUpdate(!isUpdate); // Cập nhật danh sách
        } catch (error) {
            console.error('Error adding supplier:', error);
            toast.error('Thêm nhà cung cấp thất bại');
        }
    };    

    const handleDeleteSupplier = () => {
        if (idSelected === '' && supplier.maNCC === '') {
            toast.warn('Vui lòng chọn nhà cung cấp để xóa');
            return;
        }

        const existsInInvoices = listCC.some(CC => CC.maNCC === supplier.maNCC);

        if (existsInInvoices) {
            toast.warn('Nhà cung cấp này đã được sử dụng không thể xóa!', {
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
            return; // Dừng lại nếu thuốc đã được lập hóa đơn
        }

        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa nhà cung cấp này?',
            okText: 'Xác nhận',
            cancelText: 'Hủy bỏ',
            onOk: async () => {
                try {
                    await axiosCus.delete(`${URLDeleteSupplier}${supplier.maNCC}`);
                    toast.success('Xóa nhà cung cấp thành công');
                    handleClearDataSupplier()
                    setIsUpdate(!isUpdate);
                } catch (error) {
                    console.error('Error deleting supplier:', error);
                    toast.error('Xóa nhà cung cấp thất bại');
                }
            },
        });
    };

    const handleClearDataSupplier = () => {
        setSupplier({
            maNCC: '',
            tenNCC: '',
            diaChi: '',
            sdt: '',
            email: '',
        });
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-8">
                    <h4 className="mb-3">Danh sách nhà cung cấp</h4>
                    <Table
                        className="table-supplier"
                        columns={columns}
                        dataSource={listSuppliers}
                        rowKey="maNCC"
                        pagination={{ pageSize: 10 }}
                        onRow={(record) => ({
                            onClick: () => {
                                getIDSupplier(record.maNCC);
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.cursor = 'pointer';
                            },
                        })}
                    />
                </div>

                <div className="col-md-4">
                    <h3 className="mb-3">THÔNG TIN NHÀ CUNG CẤP</h3>
                    <div className="infoSupplier-detail">
                        <p className="d-flex align-items-center">
                            <label className="col-3 text-start fw-bold">Mã NCC</label>
                            <Input
                                value={supplier.maNCC}
                                onChange={e => setSupplier({ ...supplier, maNCC: e.target.value })}
                                className="col-9"
                            />
                        </p>
                        <p className="d-flex align-items-center">
                            <label className="col-3 text-start fw-bold">Tên NCC</label>
                            <Input value={supplier.tenNCC} onChange={e => setSupplier({ ...supplier, tenNCC: e.target.value })} className="col-9" />
                        </p>
                        <p className="d-flex align-items-center">
                            <label className="col-3 text-start fw-bold">Địa Chỉ</label>
                            <Input value={supplier.diaChi} onChange={e => setSupplier({ ...supplier, diaChi: e.target.value })} className="col-9" />
                        </p>
                        <p className="d-flex align-items-center">
                            <label className="col-3 text-start fw-bold">SĐT</label>
                            <Input value={supplier.sdt} onChange={e => setSupplier({ ...supplier, sdt: e.target.value })} className="col-9" />
                        </p>
                        <p className="d-flex align-items-center">
                            <label className="col-3 text-start fw-bold">Email</label>
                            <Input value={supplier.email} onChange={e => setSupplier({ ...supplier, email: e.target.value })} className="col-9" />
                        </p>
                        <div className="button-group mt-3">
                            {visible && visible.QuanLiNhapHang.children.NhaCungCap.actions.them &&
                                <Button onClick={handleAddSupplier} type="primary" className="me-2">Thêm</Button>
                            }
                            {visible && visible.QuanLiNhapHang.children.NhaCungCap.actions.sua &&
                                <Button onClick={handleUpdateSupplier} style={{ backgroundColor: 'gold', borderColor: 'gold', color: 'black' }} className="me-2">Cập nhật</Button>
                            }
                            {visible && visible.QuanLiNhapHang.children.NhaCungCap.actions.xoa &&
                                <Button onClick={handleDeleteSupplier} danger className="me-2">Xóa</Button>
                            }
                            <Button onClick={handleClearDataSupplier} style={{ backgroundColor: 'gray', borderColor: 'gray', color: 'white' }}>Xóa thông tin</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SupplierManagement;
