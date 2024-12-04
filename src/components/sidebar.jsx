/* eslint-disable react-hooks/rules-of-hooks */
import { ProfileOutlined, LoginOutlined, CarryOutOutlined, SettingOutlined, FormOutlined, UserSwitchOutlined, UsergroupAddOutlined, ContainerOutlined, BarChartOutlined, RobotOutlined } from "@ant-design/icons";
import { Flex, Menu, Modal } from "antd";
import { Link } from "react-router-dom"; // Import Link
import logo from '../assets/imgStore/logo.jpg'
import { useEffect, useState } from "react";
import { URLUserByID } from "../../URL/url";
import { axiosCus } from "../axios/axios";

const { SubMenu } = Menu; // Sử dụng SubMenu từ Menu

function Sidebar() {
    const [visible, setVisible] = useState();
    const [displaySettings, setDisplaySettings] = useState()

    useEffect(() => {
        const disPlaySetting = JSON.parse(localStorage.getItem('displaySettings'));
        setDisplaySettings(disPlaySetting);

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
    
    const handleLogout = () => {
        Modal.confirm({
            title: "Xác nhận đăng xuất",
            content: "Bạn có chắc chắn muốn đăng xuất?",
            okText: "Đăng xuất",
            cancelText: "Hủy",
            onOk: () => {
                // Xóa toàn bộ local storage
                localStorage.clear();
                window.location.href = "/";
            },
            onCancel: () => {
                console.log("Hủy đăng xuất");
            },
            centered: true,
        });
    };

    return (
        <>
            <Flex align="center" justify="center">
                <div className="logo-container">
                    <img 
                        src={logo}
                        alt="Pharmacist Logo" 
                        className="logo"
                    />
                    {displaySettings && displaySettings.showAnimation &&
                    <div className="orbits">
                        <div className="orbit orbit1"></div>
                        <div className="orbit orbit2"></div>
                        <div className="orbit orbit3"></div>
                    </div>
                    }   
                </div>
            </Flex>

            <Menu mode='inline' defaultSelectedKeys={['1']} className="menu-bar">
                <Menu.Item key='1' icon={<BarChartOutlined />}>
                    <Link to='/'>Dashboard</Link> {/* Điều hướng đến "/" */}
                </Menu.Item>

                {/* Tạo Menu con cho Quản lý thuốc */}
                {visible && visible.QuanLiThuoc.visible && 
                <SubMenu key='sub1' icon={<FormOutlined />} title="Quản lý thuốc">
                    {visible && visible.QuanLiThuoc.children.DanhSachThuoc.visible &&
                    <Menu.Item key='2-1'>
                        <Link to='/medicineManagement'>Danh sách thuốc</Link> {/* Điều hướng đến trang Quản lý thuốc */}
                    </Menu.Item>
                    }
                    {visible && visible.QuanLiThuoc.children.Ban.visible &&
                    <Menu.Item key='2-2'>
                        <Link to='/sellMedicine'>Bán thuốc</Link> {/* Điều hướng đến trang Bán thuốc */}
                    </Menu.Item>
                    }
                    {visible && visible.QuanLiThuoc.children.HoaDon.visible &&
                    <Menu.Item key='2-3'>
                        <Link to='/invoices'>Danh sách phiếu thu</Link> {/* Điều hướng đến trang Thêm thuốc */}
                    </Menu.Item>
                    }
                    {visible && visible.QuanLiThuoc.children.QuanLiDanhMuc.visible &&
                    <Menu.Item key='2-4'>
                        <Link to='/categoryManagement'>Danh mục thuốc</Link> {/* Điều hướng đến trang Thêm thuốc */}
                    </Menu.Item>
                    }
                </SubMenu>
                }

                {visible && visible.QuanLiKhachHang.visible &&
                <Menu.Item key='3' icon={<UsergroupAddOutlined />}>
                    <Link to='/customerManagement'>Quản lý khách hàng</Link>
                </Menu.Item>
                }

                {/* Tạo Menu con cho Quản lý thuốc */}
                {visible && visible.QuanLiNhanSu.visible &&
                <SubMenu key='sub2' icon={<UserSwitchOutlined />} title="Quản lý nhân sự">
                    {visible && visible.QuanLiNhanSu.children.QuanLiNhanVien.visible &&
                    <Menu.Item key='4-1' >
                        <Link to='/employeeManagement'>Quản lý nhân viên</Link> {/* Điều hướng đến "/accounts" */}
                    </Menu.Item>
                    }
                    {visible && visible.QuanLiNhanSu.children.QuanLiTaiKhoan.visible &&
                    <Menu.Item key='4-2'>
                        <Link to='/accountManagement'>Quản lý tài khoản</Link> {/* Điều hướng đến trang Bán thuốc */}
                    </Menu.Item>
                    }
                </SubMenu>
                }

                {visible && visible.QuanLiNhapHang.visible &&
                <SubMenu key='sub3' icon={<ContainerOutlined />} title="Q.lý nhập hàng">
                    {visible && visible.QuanLiNhapHang.children.NhaCungCap.visible &&
                    <Menu.Item key='5-1' >
                        <Link to='/supplierManagement'>Nhà cung cấp</Link> {/* Điều hướng đến "/accounts" */}
                    </Menu.Item>
                    }
                    {visible && visible.QuanLiNhapHang.children.DanhSachNhapHang.visible &&
                    <Menu.Item key='5-2' >
                        <Link to='/importManagement'>D.sách nhập hàng</Link> {/* Điều hướng đến "/accounts" */}
                    </Menu.Item>
                    }
                </SubMenu>
                }

                <Menu.Item key='6' icon={<CarryOutOutlined />}>
                    <Link to='/notePersonal'>Ghi chú</Link> {/* Điều hướng đến "/notes" */}
                </Menu.Item>

                <Menu.Item key='7' icon={<ProfileOutlined />}>
                    <Link to='/personal'>Cá nhân</Link> {/* Điều hướng đến "/profile" */}
                </Menu.Item>

                <Menu.Item key='8' icon={<RobotOutlined />}>
                    <Link to='/chatcomponent'>Chatbot</Link> {/* Điều hướng đến "/settings" */}
                </Menu.Item>

                <Menu.Item key='9' icon={<SettingOutlined />}>
                    <Link to='/settings'>Cài đặt</Link> {/* Điều hướng đến "/settings" */}
                </Menu.Item>

                <Menu.Item key='10' icon={<LoginOutlined />}>
                    <Link onClick={handleLogout} to=''>Thoát</Link> {/* Điều hướng đến "/logout" */}
                </Menu.Item>
            </Menu>
        </>
    );
}

export default Sidebar;
