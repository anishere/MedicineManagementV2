/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Bounce, toast } from 'react-toastify';
import { Modal } from 'antd';
import { axiosCus } from '../axios/axios';
import { URLChangePassword } from '../../URL/url';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

dayjs.extend(utc);
dayjs.extend(timezone);

function Setting() {
    const [selectedTimezone, setSelectedTimezone] = useState('Asia/Ho_Chi_Minh'); // Mặc định múi giờ Việt Nam
    const [selectedCity, setSelectedCity] = useState('Cần Thơ'); // Mặc định thành phố Cần Thơ

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [oldPass, setOldPass] = useState()
    const [newPass, setNewPass] = useState()
    const [confirmPass, setConfirmPass] = useState()

    // Cài đặt hiển thị
    const [displaySettings, setDisplaySettings] = useState({
        showName: true,
        showDateTime: true,
        showTemperature: true,
        showAnimation: true,
    });

    const [passwordVisibility, setPasswordVisibility] = useState({
        oldPass: false,
        newPass: false,
        confirmPass: false,
    });

    const togglePasswordVisibility = (field) => {
        setPasswordVisibility((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const timeZones = [
        { label: 'UTC', value: 'UTC' },
        { label: 'GMT', value: 'GMT' },
        { label: 'Eastern Time', value: 'America/New_York' },
        { label: 'British Time', value: 'Europe/London' },
        { label: 'Japan Time', value: 'Asia/Tokyo' },
        { label: 'Vietnam Time', value: 'Asia/Ho_Chi_Minh' },
        { label: 'China Time', value: 'Asia/Shanghai' },
        { label: 'Australia Time', value: 'Australia/Sydney' },
    ];

    const vietnamCities = [
        'Cần Thơ',
        'Hà Nội',
        'Hồ Chí Minh',
        'Đà Nẵng',
        'Hải Phòng',
        'Nha Trang',
        'Vũng Tàu',
        'Huế',
        'Quy Nhơn',
        'Phú Quốc',
        'Sóc Trăng',
    ];

    const getTimeZonesWithOffset = () => {
        return timeZones.map((zone) => {
            const offset = dayjs().tz(zone.value).utcOffset() / 60; // Lấy độ lệch UTC tính theo giờ
            const sign = offset >= 0 ? '+' : '-';
            return {
                ...zone,
                offset: `UTC${sign}${Math.abs(offset)}`, // Ví dụ: UTC+7
            };
        });
    };

    const timeZonesWithOffset = getTimeZonesWithOffset();

    useEffect(() => {
        // Lấy dữ liệu đã lưu trong localStorage
        const savedTimezone = localStorage.getItem('userTimezone');
        const savedCity = localStorage.getItem('userCity');
        const savedDisplaySettings = JSON.parse(localStorage.getItem('displaySettings'));

        if (savedTimezone) {
            setSelectedTimezone(savedTimezone);
        }
        if (savedCity) {
            setSelectedCity(savedCity);
        }
        if (savedDisplaySettings) {
            setDisplaySettings(savedDisplaySettings);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('userTimezone', selectedTimezone);
        localStorage.setItem('userCity', selectedCity);
        localStorage.setItem('displaySettings', JSON.stringify(displaySettings));

        toast.success('Các cài đặt đã được lưu vui lòng reload lại', {
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
    };

    const handleToggleDisplaySetting = (setting) => {
        setDisplaySettings((prevSettings) => ({
            ...prevSettings,
            [setting]: !prevSettings[setting],
        }));
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleChangePass = () => {
        const userID = localStorage.getItem('userID')

        if(newPass === confirmPass) {
            const request = async () => {
                const res = await axiosCus.put(`${URLChangePassword}${userID}`, {
                    oldPassword: oldPass,
                    newPassword: newPass,
                })
                console.log(res)
                if(res.statusCode === 200) {
                    toast.success('Mật khẩu thay đổi thành công', {
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

                    setIsModalOpen(false);
                    setOldPass('');
                    setNewPass('');
                    setConfirmPass('');
                } else {
                    toast.error('Mật khẩu ko đúng', {
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
                }
            }
            request()
        } else {
            toast.error('Mật khẩu mới và mật khẩu xác nhận ko giống nhau', {
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
        }
    }

    return (
    <div className='d-flex'>
        <div style={{ maxWidth: '600px', margin: '0 0 0 60px', padding: '20px' }}>
            <h1 style={{ textAlign: 'start', marginBottom: '20px' }}>Cài đặt</h1>
    
            {/* Chọn múi giờ */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="timezone-select" style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>
                    Chọn múi giờ:
                </label>
                <select
                    id="timezone-select"
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="form-select"
                    style={{
                        width: '105%',
                        maxWidth: '400px',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                    }}
                >
                    {timeZonesWithOffset.map((zone) => (
                        <option key={zone.value} value={zone.value}>
                            {zone.offset} ({zone.label})
                        </option>
                    ))}
                </select>
            </div>
    
            {/* Chọn thành phố */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="city-select" style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>
                    Chọn thành phố:
                </label>
                <select
                    id="city-select"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="form-select"
                    style={{
                        width: '105%',
                        maxWidth: '400px',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                    }}
                >
                    {vietnamCities.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>
            </div>
    
            {/* Cài đặt hiển thị */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Cài đặt hiển thị:</h3>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={displaySettings.showName}
                            onChange={() => handleToggleDisplaySetting('showName')}
                        />
                        Hiển thị tên
                    </label>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={displaySettings.showDateTime}
                            onChange={() => handleToggleDisplaySetting('showDateTime')}
                        />
                        Hiển ngày giờ
                    </label>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={displaySettings.showTemperature}
                            onChange={() => handleToggleDisplaySetting('showTemperature')}
                        />
                        Hiển thị nhiệt độ
                    </label>
                </div>
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={displaySettings.showAnimation}
                            onChange={() => handleToggleDisplaySetting('showAnimation')}
                        />
                        Hiển thị animation
                    </label>
                </div>
            </div>
    
            <div style={{ textAlign: 'center' }}>
                <button
                    onClick={handleSave}
                    className="btn btn-primary"
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    Lưu cài đặt
                </button>
            </div>
        </div>
        <div className='align-content-end mb-4 ms-4'>
            <button onClick={showModal} className='btn btn-primary'>Thay đổi mật khẩu</button>
        </div>

        <Modal
                title="Thay đổi mật khẩu"
                open={isModalOpen}
                onOk={handleChangePass}
                onCancel={handleCancel}
                footer={[
                    <button key="cancel" onClick={handleCancel} className="btn btn-secondary">
                        Hủy
                    </button>,
                    <button key="submit" onClick={handleChangePass} className="ms-3 btn btn-primary">
                        Lưu
                    </button>,
                ]}
            >
                <div style={{ marginBottom: '15px', position: 'relative' }}>
                    <input
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        type={passwordVisibility.oldPass ? 'text' : 'password'}
                        placeholder="Mật khẩu cũ"
                        style={{
                            width: '100%',
                            padding: '10px 40px 10px 10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                        }}
                    />
                    {passwordVisibility.oldPass ? (
                        <EyeOutlined
                            onClick={() => togglePasswordVisibility('oldPass')}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                        />
                    ) : (
                        <EyeInvisibleOutlined
                            onClick={() => togglePasswordVisibility('oldPass')}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                        />
                    )}
                </div>

                {/* Mật khẩu mới */}
                <div style={{ marginBottom: '15px', position: 'relative' }}>
                    <input
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        type={passwordVisibility.newPass ? 'text' : 'password'}
                        placeholder="Mật khẩu mới"
                        style={{
                            width: '100%',
                            padding: '10px 40px 10px 10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                        }}
                    />
                    {passwordVisibility.newPass ? (
                        <EyeOutlined
                            onClick={() => togglePasswordVisibility('newPass')}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                        />
                    ) : (
                        <EyeInvisibleOutlined
                            onClick={() => togglePasswordVisibility('newPass')}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                        />
                    )}
                </div>

                {/* Xác nhận mật khẩu */}
                <div style={{ position: 'relative' }}>
                    <input
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        type={passwordVisibility.confirmPass ? 'text' : 'password'}
                        placeholder="Xác nhận mật khẩu"
                        style={{
                            width: '100%',
                            padding: '10px 40px 10px 10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                        }}
                    />
                    {passwordVisibility.confirmPass ? (
                        <EyeOutlined
                            onClick={() => togglePasswordVisibility('confirmPass')}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                        />
                    ) : (
                        <EyeInvisibleOutlined
                            onClick={() => togglePasswordVisibility('confirmPass')}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                        />
                    )}
                </div>
        </Modal>
    </div>
    
    );    
}

export default Setting;
