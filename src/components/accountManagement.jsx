/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import { Table, Input, Button, Space, Select, Modal, DatePicker, TimePicker, Checkbox, AutoComplete } from "antd";
import { FolderOpenOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { axiosCus } from "../axios/axios";
import { URLListAccount, URLUserByID, URLCreateAccount, URLChangePassword, URLDeleteAccount, ChiNhanh, URLUpdateAccount, URLListEmployee, URLUploadAvatar } from "../../URL/url";
import { toast } from "react-toastify";
import dayjs from "dayjs";

function AccountManagement() {
    const [listAccount, setListAccount] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [idSelected, setIdSelected] = useState('');
    const [accountData, setAccountData] = useState();
    const [isUpdate, setIsUpdate] = useState(false);

    const [listNhanVien, setListNhanVien] = useState([]); 
    const [nhanVienMap, setNhanVienMap] = useState({}); 

    const [parsedVisibleFunction, setParsedVisibleFunction] = useState({});

    const [isModalOpenVisible, setIsModalOpenVisible] = useState(false);

    const [visible, setVisible] = useState()

    // Mở modal
    const showModalVisible = () => {
        setIsModalOpenVisible(true);
    };

    // Đóng modal khi nhấn OK
    const handleOkVisible = () => {
        setIsModalOpenVisible(false);
    };

    const handleToggleVisibility = (module, child = null) => {
        const updatedVisibleFunction = { ...parsedVisibleFunction };
    
        if (child === null) {
            // Toggle visible for module
            updatedVisibleFunction[module].visible = !updatedVisibleFunction[module].visible;
    
            // Nếu module bị ẩn, ẩn tất cả children
            if (!updatedVisibleFunction[module].visible && updatedVisibleFunction[module].children) {
                Object.entries(updatedVisibleFunction[module].children).forEach(([childKey, childValue]) => {
                    childValue.visible = false;
                });
            }
        } else {
            // Toggle visible for child
            updatedVisibleFunction[module].children[child].visible =
                !updatedVisibleFunction[module].children[child].visible;
        }
    
        setParsedVisibleFunction(updatedVisibleFunction);
    };

    const handleToggleAction = (module, child, action) => {
        const updatedVisibleFunction = { ...parsedVisibleFunction };
    
        if (child === null) {
            // Nếu không có child, xử lý actions cấp module
            if (updatedVisibleFunction[module] && updatedVisibleFunction[module].actions) {
                updatedVisibleFunction[module].actions[action] =
                    !updatedVisibleFunction[module].actions[action];
            }
        } else {
            // Nếu có child, xử lý actions của child
            if (
                updatedVisibleFunction[module] &&
                updatedVisibleFunction[module].children &&
                updatedVisibleFunction[module].children[child] &&
                updatedVisibleFunction[module].children[child].actions
            ) {
                updatedVisibleFunction[module].children[child].actions[action] =
                    !updatedVisibleFunction[module].children[child].actions[action];
            }
        }
    
        setParsedVisibleFunction(updatedVisibleFunction); // Cập nhật state
    };        

    //visible
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
    
    const weekDays = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
    // Check manv co ton tai ko thi moi dc thay doi hay them vao continue... 
    const [account, setAccount] = useState({
        userName: '',
        password: '',
        avatar: '',
        userType: '',
        activeStatus: 1,
        visibleFunction: '',
        startTime: '00:00:00',
        endTime: '00:00:00',
        workDayofWeek: '0000000',
        activationDate: null,
        deactivationDate: null,
        workShedule: 0,
        activeShedule: 0,
        maNV: '',
        maCN: ChiNhanh,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(URLListAccount);
                setListAccount(res.user);

                const resEmployee = await axiosCus.get(URLListEmployee); // NEW CODE: Gọi API lấy danh sách nhân viên
                const nhanVienList = resEmployee.listNhanVien;
                setListNhanVien(nhanVienList); // NEW CODE: Cập nhật state listNhanVien
                const map = nhanVienList.reduce((acc, nv) => {
                    acc[nv.maNV] = nv.tenNV;
                    return acc;
                }, {});
                setNhanVienMap(map);
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

    const columns = [
        { title: 'ID', dataIndex: 'userID', key: 'userID', ...getColumnSearchProps('userID') },
        { title: 'Tên tài khoản', dataIndex: 'userName', key: 'userName', ...getColumnSearchProps('userName') },
        { title: 'Loại tài khoản', dataIndex: 'userType', key: 'userType', ...getColumnSearchProps('userType') },
        { title: 'Trạng thái', dataIndex: 'activeStatus', key: 'activeStatus' },
        { 
            title: 'Thuộc nhân viên', 
            dataIndex: 'maNV', 
            key: 'maNV',
            ...getColumnSearchProps('maNV') ,
            //render: (maNV) => nhanVienMap[maNV] || 'N/A', // NEW CODE: Hiển thị tên nhân viên dựa trên maNV từ nhanVienMap
        }
    ];

    const handleUpdateAccount = async () => {
        // Kiểm tra nếu `userName` đã tồn tại
        const existingAccount = listAccount.find((acc) => acc.userName === account.userName);
        if (idSelected !== '' && existingAccount) {
            try {
                let updatedAccount = { ...account };
                
                // Nếu có ảnh mới, upload ảnh lên server trước
                if (account.newImageFile) {
                    const formData = new FormData();
                    formData.append('file', account.newImageFile);
    
                    // Upload ảnh và lấy URL từ server
                    const uploadResponse = await axiosCus.post(URLUploadAvatar, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    
                    // Cập nhật URL ảnh thực từ server nếu upload thành công
                    updatedAccount.avatar = uploadResponse.imageUrl;
                }

                updatedAccount = {
                    ...updatedAccount,
                    visibleFunction: JSON.stringify(parsedVisibleFunction), // Serialize trước khi gửi
                };
    
                // Gửi yêu cầu cập nhật tài khoản với URL ảnh thực từ server
                await axiosCus.put(`${URLUpdateAccount}${idSelected}`, updatedAccount);
                toast.success('Updated account successfully');
                setIsUpdate(!isUpdate);
    
            } catch (error) {
                console.error('Error updating account:', error.response || error.message);
                toast.error('Update failed');
            }
        } else {
            toast.warn('No account selected for update');
        }
    };           
    
    const handleAddAccount = async () => {
        if (account.userName === '' || account.password === '') {
            toast.warn('Please fill in all required information');
            return;
        }
    
        // Kiểm tra nếu `userName` đã tồn tại
        const existingAccount = listAccount.find((acc) => acc.userName === account.userName);
        if (existingAccount) {
            toast.warn('UserName already exists. Please choose a unique UserName.');
            return;
        }
    
        try {
            let newAccount = { ...account };
            
            // Kiểm tra nếu có ảnh mới
            if (account.newImageFile) {
                const formData = new FormData();
                formData.append('file', account.newImageFile);
    
                // Upload ảnh lên server
                const uploadResponse = await axiosCus.post(URLUploadAvatar, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                console.log(uploadResponse.imageUrl)
                // Cập nhật URL ảnh mới vào account
                newAccount.avatar = uploadResponse.imageUrl;
            }

            newAccount = {
                ...newAccount,
                visibleFunction: JSON.stringify(parsedVisibleFunction), // Serialize trước khi gửi
            };
    
            const response = await axiosCus.post(URLCreateAccount, newAccount);
    
            if (response.statusCode === 200) {
                toast.success('Added new account successfully');
                setIsUpdate(!isUpdate);
                handleClearDataAccount(); // Reset form sau khi thêm thành công
            } else {
                toast.error('Add account failed');
            }
        } catch (error) {
            console.error('Error adding account:', error);
            toast.error('Add account failed');
        }
    };             

    const handleDeleteAccount = () => {
        if (idSelected === '') {
            toast.warn('Please select an account to delete');
            return;
        }

        Modal.confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this account?',
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await axiosCus.delete(`${URLDeleteAccount}${idSelected}`);
                    handleClearDataAccount();
                    toast.success('Deleted account successfully');
                    setIsUpdate(!isUpdate);
                } catch (error) {
                    console.error('Error deleting account:', error);
                    toast.error('Delete account failed');
                }
            },
            onCancel() {
                console.log('Cancelled delete');
            }
        });
    };

    const handleClearDataAccount = () => {
        setAccount({
            userName: '',
            password: '',
            avatar: '',
            userType: '',
            activeStatus: 1,
            visibleFunction: '',
            startTime: '00:00:00',
            endTime: '00:00:00',
            workDayofWeek: '0000000',
            activationDate: null,
            deactivationDate: null,
            workShedule: 0,
            activeShedule: 0,
            maNV: '',
            maCN: ChiNhanh,
        });
        setIdSelected('')
    };

    const handleWeekDayChange = (checkedValues) => {
        let workDays = '0000000'.split('');
        checkedValues.forEach(dayIndex => {
            workDays[dayIndex] = '1';
        });
        setAccount({ ...account, workDayofWeek: workDays.join('') });
    };

    useEffect(() => {
        if (idSelected) {
            const fetchData = async () => {
                try {
                    const res = await axiosCus.get(`${URLUserByID}${idSelected}`);
                    setAccountData(res.user[0]);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
        }
    }, [idSelected]);

    useEffect(() => {
        if (accountData) {
            setAccount({
                ...account,
                userName: accountData.userName,
                password: accountData.password,
                avatar: accountData.avatar,
                userType: accountData.userType,
                activeStatus: accountData.activeStatus,
                visibleFunction: accountData.visibleFunction.trim(),
                startTime: accountData.startTime,
                endTime: accountData.endTime,
                workDayofWeek: accountData.workDayofWeek,
                activationDate: dayjs(accountData.activationDate),
                deactivationDate: dayjs(accountData.deactivationDate),
                workShedule: accountData.workShedule,
                activeShedule: accountData.activeShedule,
                maNV: accountData.maNV,
                maCN: accountData.maCN,
            });
    
            // Parse visibleFunction thành object JSON và lưu vào state riêng
            try {
                setParsedVisibleFunction(JSON.parse(accountData.visibleFunction || '{}'));
            } catch (error) {
                console.error('Error parsing visibleFunction:', error);
                setParsedVisibleFunction({});
            }
        }
    }, [accountData]);    

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        // Tạo URL tạm thời để hiển thị ảnh
        const imageUrlPreview = URL.createObjectURL(file);
        
        setAccount((prev) => ({
            ...prev,
            avatar: imageUrlPreview, // Hiển thị preview
            newImageFile: file,      // Lưu file để upload
        }));
    };        

    const handleUserNameChange = (e) => {
        const newUserName = e.target.value;
    
        setAccount((prev) => ({
            ...prev,
            userName: newUserName,
            avatar: newUserName !== prev.userName ? '' : prev.avatar, // Xóa ảnh nếu mã thuốc thay đổi
            newImageFile: newUserName !== prev.userName ? null : prev.newImageFile // Xóa file ảnh nếu mã thuốc thay đổi
        }));
    }; 

    const handleToggleFunction = (module, child, action) => {
        const updatedVisibleFunction = { ...parsedVisibleFunction }; // Sao chép object hiện tại
        if (
            updatedVisibleFunction[module] &&
            updatedVisibleFunction[module].children &&
            updatedVisibleFunction[module].children[child] &&
            updatedVisibleFunction[module].children[child].actions
        ) {
            // Toggle trạng thái action
            updatedVisibleFunction[module].children[child].actions[action] =
                !updatedVisibleFunction[module].children[child].actions[action];
        }
    
        setParsedVisibleFunction(updatedVisibleFunction); // Cập nhật state
    };    

    const handleRemoveAllPermissions = () => {
        const updatedVisibleFunction = { ...parsedVisibleFunction };
    
        // Gán visible = false cho tất cả các cấp
        Object.entries(updatedVisibleFunction).forEach(([module, details]) => {
            details.visible = false;
    
            // Nếu có children, tiếp tục duyệt qua các children
            if (details.children) {
                Object.entries(details.children).forEach(([child, childDetails]) => {
                    childDetails.visible = false;
                    if (childDetails.actions) {
                        Object.keys(childDetails.actions).forEach((action) => {
                            childDetails.actions[action] = false;
                        });
                    }
                });
            }
    
            // Nếu có actions (như QuanLiKhachHang), cũng gán actions cho nó thành false
            if (details.actions) {
                Object.keys(details.actions).forEach((action) => {
                    details.actions[action] = false;
                });
            }
        });
    
        setParsedVisibleFunction(updatedVisibleFunction);
    };    

    const handleGrantAllPermissions = () => {
        const updatedVisibleFunction = { ...parsedVisibleFunction };
    
        // Gán visible = true cho tất cả các cấp
        Object.entries(updatedVisibleFunction).forEach(([module, details]) => {
            details.visible = true;
    
            // Nếu có children, tiếp tục duyệt qua các children
            if (details.children) {
                Object.entries(details.children).forEach(([child, childDetails]) => {
                    childDetails.visible = true;
                    if (childDetails.actions) {
                        Object.keys(childDetails.actions).forEach((action) => {
                            childDetails.actions[action] = true;
                        });
                    }
                });
            }
    
            // Nếu có actions (như QuanLiKhachHang), cũng gán visible và actions cho nó
            if (details.actions) {
                Object.keys(details.actions).forEach((action) => {
                    details.actions[action] = true;
                });
            }
        });
    
        setParsedVisibleFunction(updatedVisibleFunction);
    };    
    
    return (
        <div className="container">
            <div className="row">
                <div className="col-md-8">
                    <h4 className="mb-3">Account List</h4>
                    <Table
                        className="table-account"
                        columns={columns}
                        dataSource={listAccount}
                        rowKey="userID"
                        pagination={{ pageSize: 10 }}
                        onRow={(record) => ({
                            onClick: () => {
                                setIdSelected(record.userID);
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.cursor = 'pointer';
                            },
                        })}
                    />
                </div>
    
                <div className="col-md-4">
                    <h3 className="mb-3">Chi tiết tài khoản</h3>
                    <div className="infoAccount-detail">
                        <p><label className="fw-bold">Tên tài khoản</label>
                            <Input onch value={account.userName} onChange={handleUserNameChange} />
                        </p>
                        <p><label className="fw-bold">Mật khẩu</label>
                            <Input.Password value={account.password} onChange={e => setAccount({ ...account, password: e.target.value })} />
                        </p>
                        
                        {/* Trạng thái hoạt động */}
                        <p><label className="fw-bold me-2">Trạng thái hoạt động</label>
                            <Select
                                value={account.activeStatus}
                                onChange={(value) => setAccount({ ...account, activeStatus: value })}
                            >
                                <Select.Option value={1}>Hoạt động</Select.Option>
                                <Select.Option value={0}>Không hoạt động</Select.Option>
                            </Select>
                        </p>
                        
                        {/* Chỉ hiển thị các trường khác khi activeStatus là 1 */}
                        {account.activeStatus === 1 && (
                            <>
                                <p>
                                    <p><label className="fw-bold">Ảnh đại diện</label></p>
                                    <img src={account.avatar ? account.avatar : '/avatarStore/default.jpg'} className="img-account" alt="Medicine Image" />

                                    {/* Label để trigger file input */}
                                    <p><label htmlFor="file-input" className="mt-2 styled-label">Chọn ảnh <FolderOpenOutlined /></label></p>

                                    {/* Input để chọn file hình ảnh */}
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept="image/*" // Chỉ cho phép file hình ảnh
                                        onChange={handleImageUpload}
                                        className="file-input"
                                    />
                                </p>
                                <p><label className="fw-bold me-2">Loại tài khoản</label>
                                    <Select value={account.userType} onChange={(value) => setAccount({ ...account, userType: value })}>
                                        <Select.Option value="Admin">Admin</Select.Option>
                                        <Select.Option value="User">Dược sĩ</Select.Option>
                                    </Select>
                                </p>
                                <p>
                                    <label className="fw-bold">Quyền chức năng</label>
                                    <Button type="primary" className="ms-2" onClick={showModalVisible}>
                                        Cài đặt quyền chức năng
                                    </Button>
                                </p>
                                {/* Work Schedule */}
                                <p><label className="fw-bold me-2">Lịch làm việc</label>
                                    <Select 
                                        value={account.workShedule} 
                                        onChange={(value) => setAccount({ ...account, workShedule: value })}
                                    >
                                        <Select.Option value={0}>Inactive</Select.Option>
                                        <Select.Option value={1}>Active</Select.Option>
                                    </Select>
                                </p>
        
                                {/* Chỉ hiển thị khi WorkShedule là 1 */}
                                {account.workShedule === 1 && (
                                    <>
                                        <p><label className="fw-bold me-2">Thời gian bắt đầu</label>
                                            <TimePicker 
                                                value={account.startTime ? dayjs(account.startTime, 'HH:mm:ss') : null} 
                                                onChange={(time) => setAccount({ ...account, startTime: time ? time.format('HH:mm:ss') : '' })} 
                                                format="HH:mm:ss" 
                                            />
                                        </p>
                                        <p><label className="fw-bold me-2">Thời gian kết thúc</label>
                                            <TimePicker 
                                                value={account.endTime ? dayjs(account.endTime, 'HH:mm:ss') : null} 
                                                onChange={(time) => setAccount({ ...account, endTime: time ? time.format('HH:mm:ss') : '' })} 
                                                format="HH:mm:ss" 
                                            />
                                        </p>
                                        <p><label className="fw-bold">Ngày làm việc trong tuần</label></p>
                                        <Checkbox.Group
                                            options={weekDays.map((day, index) => ({ label: day, value: index }))}
                                            onChange={handleWeekDayChange}
                                            value={[...account.workDayofWeek].map((day, index) => day === '1' ? index : null).filter(val => val !== null)}
                                        />
                                        <p>Chuỗi ngày làm việc: {account.workDayofWeek}</p>
                                    </>
                                )}
        
                                {/* Active Schedule */}
                                <p><label className="fw-bold me-2">Kích hoạt lịch</label>
                                    <Select 
                                        value={account.activeShedule} 
                                        onChange={(value) => setAccount({ ...account, activeShedule: value })}
                                    >
                                        <Select.Option value={0}>Inactive</Select.Option>
                                        <Select.Option value={1}>Active</Select.Option>
                                    </Select>
                                </p>
        
                                {/* Chỉ hiển thị khi ActiveShedule là 1 */}
                                {account.activeShedule === 1 && (
                                    <>
                                        <p><label className="fw-bold me-2">Ngày kích hoạt tài khoản</label>
                                            <DatePicker value={account.activationDate} onChange={(date) => setAccount({ ...account, activationDate: date })} />
                                        </p>
                                        <p><label className="fw-bold me-2">Ngày hết hạn tài khoản</label>
                                            <DatePicker value={account.deactivationDate} onChange={(date) => setAccount({ ...account, deactivationDate: date })} />
                                        </p>
                                    </>
                                )}
        
                            <p><label className="fw-bold me-2">Mã nhân viên</label>
                                <AutoComplete
                                    options={listNhanVien.map((nv) => ({ value: nv.maNV }))} // NEW CODE: Gợi ý chỉ hiển thị maNV
                                    value={account.maNV}
                                    onChange={(value) => setAccount({ ...account, maNV: value })}
                                    placeholder="Nhập mã nhân viên"
                                    style={{ width: '30%' }}
                                >
                                    <Input /> {/* Cho phép nhập tự do nhưng có gợi ý maNV */}
                                </AutoComplete>
                            </p>
                            {/* Hiển thị tên nhân viên tương ứng bên dưới nếu maNV hợp lệ */}
                            {account.maNV && nhanVienMap[account.maNV] && (
                                <p>
                                    <label className="fw-bold me-2">Tên nhân viên:</label> {nhanVienMap[account.maNV]}
                                </p>
                            )}
                            </>
                        )}
    
                        <div className="button-group mt-3">
                            {visible && visible.QuanLiNhanSu.children.QuanLiTaiKhoan.actions.them &&
                                <Button className="me-2" onClick={handleAddAccount} type="primary">Tạo</Button>
                            }
                            {visible && visible.QuanLiNhanSu.children.QuanLiTaiKhoan.actions.sua &&
                                <Button className="me-2" onClick={handleUpdateAccount} style={{ backgroundColor: 'gold', color: 'black' }}>Cập nhật</Button>
                            }
                            {visible && visible.QuanLiNhanSu.children.QuanLiTaiKhoan.actions.xoa &&
                                <Button className="me-2" onClick={handleDeleteAccount} danger>Xóa</Button>
                            }
                            <Button onClick={handleClearDataAccount} style={{ backgroundColor: 'gray', color: 'white' }}>Xóa thông tin</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal hiển thị quyền chức năng */}
            <Modal
            title="Cài đặt quyền chức năng"
            open={isModalOpenVisible}
            onOk={handleOkVisible}
            onCancel={handleOkVisible}
            width={800}
        >
            {/* Header buttons */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">Quản lý quyền chức năng</h5>
                <div>
                    <Button
                        type="danger"
                        className="me-2"
                        onClick={handleRemoveAllPermissions}
                    >
                        Xóa tất cả quyền
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleGrantAllPermissions}
                    >
                        Cấp full quyền
                    </Button>
                </div>
            </div>

            {/* Permissions tree */}
            <div className="function-group mt-4">
                {Object.entries(parsedVisibleFunction).map(([module, details]) => (
                    <div key={module} className="mb-4">
                        {/* Module cấp 1 */}
                        <div className="d-flex align-items-center mb-2">
                            <h5 className="fw-bold me-3 text-primary">{module}</h5>
                            <Button
                                type={details.visible ? 'primary' : 'default'}
                                className="me-2"
                                onClick={() => handleToggleVisibility(module)}
                            >
                                {details.visible ? 'Hiển thị' : 'Ẩn'}
                            </Button>
                        </div>

                        {details.visible && (
                            <div className="ps-4 border-start border-primary">
                                {/* Nếu có children */}
                                {details.children &&
                                    Object.entries(details.children).map(([child, childDetails]) => (
                                        <div key={child} className="mb-3">
                                            <div className="d-flex align-items-center mb-1">
                                                <h6 className="fw-semibold me-3 text-secondary">{child}</h6>
                                                <Button
                                                    type={childDetails.visible ? 'primary' : 'default'}
                                                    className="me-2"
                                                    onClick={() => handleToggleVisibility(module, child)}
                                                >
                                                    {childDetails.visible ? 'Hiển thị' : 'Ẩn'}
                                                </Button>
                                            </div>
                                            {childDetails.visible && (
                                                <div className="ps-3">
                                                    {childDetails.actions &&
                                                        Object.entries(childDetails.actions).map(
                                                            ([action, isEnabled]) => (
                                                                <Button
                                                                    key={action}
                                                                    type={isEnabled ? 'primary' : 'default'}
                                                                    className="me-2 mb-2"
                                                                    onClick={() =>
                                                                        handleToggleAction(
                                                                            module,
                                                                            child,
                                                                            action
                                                                        )
                                                                    }
                                                                >
                                                                    {action}
                                                                </Button>
                                                            )
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                {/* Nếu không có children nhưng có actions */}
                                {!details.children &&
                                    details.actions &&
                                    Object.entries(details.actions).map(([action, isEnabled]) => (
                                        <Button
                                            key={action}
                                            type={isEnabled ? 'primary' : 'default'}
                                            className="me-2 mb-2"
                                            onClick={() => handleToggleAction(module, null, action)}
                                        >
                                            {action}
                                        </Button>
                                    ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Modal>
        </div>
    );
}

export default AccountManagement;
