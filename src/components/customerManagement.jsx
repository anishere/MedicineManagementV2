/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import { Table, Input, Button, Space, Select, Modal } from "antd"; // Thêm Select từ Ant Design
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { axiosCus } from "../axios/axios";
import { URLListCustomer, URLGetCusByID, URLAddCustomer, URLUpdateCustomer, URLDeleCustomer, URLUserByID } from "../../URL/url";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { ChiNhanh } from "../../URL/url"; // Import ChiNhanh

function CustomerManagement() {
    const [listCustomer, setListCustomer] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [idSelected, setIdSelected] = useState('');
    const [customerData, setCustomerData] = useState();
    const [isUpdate, setIsUpdate] = useState(false);

    const [customer, setCustomer] = useState({
        maKH: '',
        tenKH: '',
        sdt: '',
        gt: '',
        maCN: ChiNhanh,
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
    if(visible) console.log(visible);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(URLListCustomer);
                setListCustomer(res.listKhachHang);
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

    const getIDCustomer = (customerID) => {
        setIdSelected(customerID);
    };

    // Cấu hình cột cho bảng
    const columns = [
        { title: 'Mã Khách Hàng', dataIndex: 'maKH', key: 'maKH', ...getColumnSearchProps('maKH') },
        { title: 'Tên Khách Hàng', dataIndex: 'tenKH', key: 'tenKH', ...getColumnSearchProps('tenKH') },
        { title: 'Số Điện Thoại', dataIndex: 'sdt', key: 'sdt', ...getColumnSearchProps('sdt') },
        { title: 'Giới Tính', dataIndex: 'gt', key: 'gt', ...getColumnSearchProps('gt') },
    ];

    useEffect(() => {
        if (idSelected) {
            const fetchData = async () => {
                try {
                    const res = await axiosCus.get(`${URLGetCusByID}${idSelected}`);
                    setCustomerData(res.listKhachHang[0]);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
        }
    }, [idSelected]);

    useEffect(() => {
        if (customerData) {
            setCustomer({
                maKH: customerData.maKH,
                tenKH: customerData.tenKH,
                sdt: customerData.sdt,
                gt: customerData.gt,
                maCN: ChiNhanh,
            });
        }
    }, [customerData]);

    const handleUpdateCustomer = async () => {
        if (idSelected !== '') {
            try {
                await axiosCus.put(`${URLUpdateCustomer}${idSelected}`, customer);
                toast.success('Cập nhật khách hàng thành công');
                setIsUpdate(!isUpdate);
            } catch (error) {
                console.error('Error updating customer:', error);
                toast.error('Cập nhật thất bại');
            }
        } else {
            toast.warn('Chưa chọn khách hàng để cập nhật');
        }
    };

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

    const handleDeleteCustomer = () => {
        if (idSelected === '') {
            toast.warn('Vui lòng chọn khách hàng để xóa');
            return;
        }
    
        // Hiển thị hộp thoại xác nhận trước khi xóa
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa khách hàng này?',
            okText: 'Xác nhận',
            cancelText: 'Hủy bỏ',
            onOk: async () => {
                // Nếu người dùng nhấn OK, thực hiện xóa
                try {
                    await axiosCus.delete(`${URLDeleCustomer}${idSelected}`);
                    toast.success('Xóa khách hàng thành công');
                    setIsUpdate(!isUpdate);
                } catch (error) {
                    console.error('Error deleting customer:', error);
                    toast.error('Xóa khách hàng thất bại');
                }
            },
            onCancel() {
                console.log('Hủy xóa khách hàng');
            }
        });
    };
    
    const handleClearDataCustomer = () => {
        setCustomer({
            maKH: '',
            tenKH: '',
            sdt: '',
            gt: '',
            maCN: ChiNhanh,
        });
        setIdSelected('')
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-8">
                    <h4 className="mb-3">Danh sách khách hàng</h4>
                    <Table
                        className="table-customer"
                        columns={columns}
                        dataSource={listCustomer}
                        rowKey="maKH"
                        pagination={{ pageSize: 10 }}
                        onRow={(record) => ({
                            onClick: () => {
                                getIDCustomer(record.maKH);
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.cursor = 'pointer';
                            },
                        })}
                    />
                </div>

                <div className="col-md-4">
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
                            {visible && visible.QuanLiKhachHang.actions.them &&
                                <Button onClick={handleAddCustomer} type="primary" className="me-2">Thêm</Button>}
                            
                            {visible && visible.QuanLiKhachHang.actions.sua &&
                            <Button 
                                onClick={handleUpdateCustomer} 
                                style={{ backgroundColor: 'gold', borderColor: 'gold', color: 'black' }} 
                                className="me-2"
                            >
                                Cập nhật
                            </Button>
                            }
                            
                            {visible && visible.QuanLiKhachHang.actions.xoa &&
                            <Button onClick={handleDeleteCustomer} danger className="me-2">Xóa</Button>
                            }

                            <Button 
                                onClick={handleClearDataCustomer} 
                                style={{ backgroundColor: 'gray', borderColor: 'gray', color: 'white' }}
                            >
                                Xóa thông tin
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerManagement;
