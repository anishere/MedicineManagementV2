/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { axiosCus } from '../axios/axios';
import { URLEmployeID, URLUserByID } from '../../URL/url';

function Personal() {
    const [personalInfo, setPersonalInfo] = useState(null);
    const [accountInfo, setAccountInfo] = useState(null);

    useEffect(() => {
        const idPersonal = localStorage.getItem('maNV');
        const idAccount = localStorage.getItem('userID');

        const fetchEmployees = async () => {
            try {
                const response = await axiosCus.get(`${URLEmployeID}${idPersonal}`);
                setPersonalInfo(response.listNhanVien[0]);

                const response2 = await axiosCus.get(`${URLUserByID}${idAccount}`);
                setAccountInfo(response2.user[0]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchEmployees();
    }, []);

    if (!personalInfo || !accountInfo) {
        return (
            <div className="text-center mt-5">
                <p>Loading dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="personal-container">
            {/* Thông tin cá nhân */}
            <div className="personal-card">
                <div className="personal-header">
                    <h4>Thông Tin Cá Nhân</h4>
                </div>
                <div className="personal-body">
                    <div className="personal-item">
                        <span className="personal-label">Tên Nhân Viên:</span>
                        <span className="personal-value">{personalInfo.tenNV}</span>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Giới Tính:</span>
                        <span className="personal-value">{personalInfo.gt}</span>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Ngày Sinh:</span>
                        <span className="personal-value">
                            {new Date(personalInfo.ngaySinh).toLocaleDateString("vi-VN")}
                        </span>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Mã Nhân Viên:</span>
                        <span className="personal-value">{personalInfo.maNV}</span>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Mã Chi Nhánh:</span>
                        <span className="personal-value">{personalInfo.maCN}</span>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Số Điện Thoại:</span>
                        <span className="personal-value">{personalInfo.sdt}</span>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Lương:</span>
                        <span className="personal-value">
                            {personalInfo.luong.toLocaleString('vi-VN')} VNĐ
                        </span>
                    </div>
                </div>
            </div>

            {/* Thông tin tài khoản */}
            <div className="personal-card mt-4">
                <div className="personal-header">
                    <h4>Thông Tin Tài Khoản</h4>
                </div>
                <div className="personal-body">
                    <div className="personal-item">
                        <span className="personal-label">Tên Đăng Nhập:</span>
                        <span className="personal-value">{accountInfo.userName}</span>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Loại Tài Khoản:</span>
                        <span className="personal-value">{accountInfo.userType}</span>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Lịch Làm Việc:</span>
                        <div className="work-schedule-horizontal">
                            {[
                                "Thứ 2",
                                "Thứ 3",
                                "Thứ 4",
                                "Thứ 5",
                                "Thứ 6",
                                "Thứ 7",
                                "Chủ Nhật",
                            ].map((day, index) => (
                                <div key={index} className="work-schedule-item-horizontal">
                                    <span className="work-day">{day}</span>
                                    <span className={`work-status ${accountInfo.workDayofWeek[index] === "1" ? "working" : "off"}`}>
                                        {accountInfo.workDayofWeek[index] === "1" ? "✔" : "✘"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Giờ Làm Việc:</span>
                        <span className="personal-value">
                            {accountInfo.startTime} - {accountInfo.endTime}
                        </span>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Kích Hoạt:</span>
                        <span className="personal-value">
                            {accountInfo.activeStatus === 1 ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                        </span>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Ngày Kích Hoạt:</span>
                        <span className="personal-value">
                            {new Date(accountInfo.activationDate).toLocaleDateString("vi-VN")}
                        </span>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Ngày Hết Hạn:</span>
                        <span className="personal-value">
                            {new Date(accountInfo.deactivationDate).toLocaleDateString("vi-VN")}
                        </span>
                    </div>
                    <div className="personal-item">
                        <span className="personal-label">Avatar:</span>
                        <span className="personal-value">
                            <img
                                src={accountInfo.avatar}
                                alt="Avatar"
                                className="account-avatar"
                            />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Personal;
