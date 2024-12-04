/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Button, Space, Modal } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { axiosCus } from "../axios/axios";
import { URLCategory, URLGetCateByID, URLCreateCate, URLUpdateCate, URLDeleteCate, URLUserByID, URLListMedicine } from "../../URL/url";
import { Bounce, toast } from "react-toastify";

function CategoryManagement() {
    const [listCategories, setListCategories] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [listMedicine, setListMedicine] = useState();

    const [idSelected, setIdSelected] = useState('');
    const [categoryData, setCategoryData] = useState();
    const [isUpdate, setIsUpdate] = useState(false);

    const [category, setCategory] = useState({
        maDanhMuc: '',
        tenDanhMuc: '',
    });

    // visible
    const [visible, setVisible] = useState();

    useEffect(() => {
        const fetchEmployees = async () => {
            const userID = localStorage.getItem("userID");

            try {
                const response = await axiosCus.get(`${URLUserByID}${userID}`);
                setVisible(JSON.parse(response.user[0].visibleFunction));

                const res = await axiosCus.get(URLListMedicine);
                setListMedicine(res.listMedicine);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        
        fetchEmployees(); 
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(URLCategory);
                setListCategories(res.listCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
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

    const getIDCategory = (categoryID) => {
        setIdSelected(categoryID);
    };

    const columns = [
        { title: 'Mã Danh Mục', dataIndex: 'maDanhMuc', key: 'maDanhMuc', ...getColumnSearchProps('maDanhMuc') },
        { title: 'Tên Danh Mục', dataIndex: 'tenDanhMuc', key: 'tenDanhMuc', ...getColumnSearchProps('tenDanhMuc') },
    ];

    useEffect(() => {
        if (idSelected) {
            const fetchData = async () => {
                try {
                    const res = await axiosCus.get(`${URLGetCateByID}${idSelected}`);
                    setCategoryData(res);
                } catch (error) {
                    console.error('Error fetching category:', error);
                }
            };
            fetchData();
        }
    }, [idSelected]);

    useEffect(() => {
        if (categoryData) {
            setCategory({
                maDanhMuc: categoryData.maDanhMuc,
                tenDanhMuc: categoryData.tenDanhMuc,
            });
        }
    }, [categoryData]);

    const handleUpdateCategory = async () => {
        if (idSelected !== '' && category.maDanhMuc !== '') {
            try {
                await axiosCus.put(URLUpdateCate, category);
                toast.success('Cập nhật danh mục thành công');
                setIsUpdate(!isUpdate);
            } catch (error) {
                console.error('Error updating category:', error);
                toast.error('Cập nhật thất bại');
            }
        } else {
            toast.warn('Chưa chọn danh mục để cập nhật');
        }
    };

    const handleAddCategory = async () => {
        if (category.maDanhMuc === '' || category.tenDanhMuc === '') {
            toast.warn('Vui lòng điền đủ thông tin yêu cầu');
            return;
        }
    
        // Kiểm tra xem maDanhMuc đã tồn tại trong listCategories chưa
        const isExist = listCategories.some(dm => dm.maDanhMuc === category.maDanhMuc);
        if (isExist) {
            toast.error('Mã danh mục đã tồn tại');
            return;
        }
    
        try {
            await axiosCus.post(URLCreateCate, category);
            toast.success('Thêm danh mục mới thành công');
            setIsUpdate(!isUpdate); // Cập nhật lại danh sách danh mục
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error('Thêm danh mục thất bại');
        }
    };    

    const handleDeleteCategory = () => {
        const isExist = listCategories.some(cate => cate.maDanhMuc === category.maDanhMuc);

        if (idSelected === '' && category.maDanhMuc === '') {
            toast.warn('Vui lòng chọn danh mục để xóa');
            return;
        }

        // Kiểm tra nếu MaThuoc tồn tại trong ListDetailInvoices
        const existsInInvoices = listMedicine.some(medicine => medicine.maDanhMuc === category.maDanhMuc);

        if (existsInInvoices) {
            toast.warn('Mã danh mục này đã được sử dụng không thể xóa!', {
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

        if (!isExist) {
            toast.warn('Mã danh mục không tồn tại, không thể xóa', {
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
            return; // Dừng thực hiện nếu mã thuốc không tồn tại
        }

        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa danh mục này?',
            okText: 'Xác nhận',
            cancelText: 'Hủy bỏ',
            onOk: async () => {
                try {
                    await axiosCus.delete(`${URLDeleteCate}${category.maDanhMuc}`);
                    toast.success('Xóa danh mục thành công');
                    handleClearDataCategory();
                    setIsUpdate(!isUpdate);
                } catch (error) {
                    console.error('Error deleting category:', error);
                    toast.error('Xóa danh mục thất bại');
                }
            },
        });
    };

    const handleClearDataCategory = () => {
        setCategory({
            maDanhMuc: '',
            tenDanhMuc: '',
        });
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-8">
                    <h4 className="mb-3">Danh sách danh mục</h4>
                    <Table
                        className="table-category"
                        columns={columns}
                        dataSource={listCategories}
                        rowKey="maDanhMuc"
                        pagination={{ pageSize: 10 }}
                        onRow={(record) => ({
                            onClick: () => {
                                getIDCategory(record.maDanhMuc);
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.cursor = 'pointer';
                            },
                        })}
                    />
                </div>

                <div className="col-md-4">
                    <h3 className="mb-3">THÔNG TIN DANH MỤC</h3>
                    <div className="infoCategory-detail">
                        <p className="d-flex align-items-center">
                            <label className="col-4 text-start fw-bold">Mã DM</label>
                            <Input value={category.maDanhMuc} onChange={e => setCategory({ ...category, maDanhMuc: e.target.value })} className="col-8" />
                        </p>
                        <p className="d-flex align-items-center">
                            <label className="col-4 text-start fw-bold">Tên DM</label>
                            <Input value={category.tenDanhMuc} onChange={e => setCategory({ ...category, tenDanhMuc: e.target.value })} className="col-8" />
                        </p>
                        <div className="button-group mt-3">
                            {visible && visible.QuanLiThuoc.children.QuanLiDanhMuc.actions.them &&
                                <Button onClick={handleAddCategory} type="primary" className="me-2">Thêm</Button>}
                            {visible && visible.QuanLiThuoc.children.QuanLiDanhMuc.actions.sua &&
                                <Button onClick={handleUpdateCategory} style={{ backgroundColor: 'gold', borderColor: 'gold', color: 'black' }} className="me-2">Cập nhật</Button>}
                            {visible && visible.QuanLiThuoc.children.QuanLiDanhMuc.actions.xoa &&
                                <Button onClick={handleDeleteCategory} danger className="me-2">Xóa</Button>}
                            <Button onClick={handleClearDataCategory} style={{ backgroundColor: 'gray', borderColor: 'gray', color: 'white' }}>Xóa thông tin</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryManagement;
