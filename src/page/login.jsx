/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import { axiosCus } from "../axios/axios";
import { URLLogin } from "../../URL/url";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import logo from '../assets/imgStore/logo.jpg'

function login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.post(URLLogin, {
                    "userName": username,
                    "password": password,
                });
    
                if (res.statusCode === 200) {
                    const user = res.user[0];
    
                    const handleLoginSuccess = () => {
                        localStorage.setItem("maNV", user.maNV);
                        localStorage.setItem("userID", user.userID);
                        localStorage.setItem("isLogin", true);
                        localStorage.setItem("displaySettings", `{"showName":true,"showDateTime":true,"showTemperature":true,"showAnimation":true}`);
                        toast('Đăng nhập thành công', {
                            position: "top-right",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                            transition: Bounce,
                        });
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    };
    
                    const isCurrentTimeInRange = (startTimeStr, endTimeStr) => {
                        const [startHours, startMinutes, startSeconds] = startTimeStr.split(':').map(Number);
                        const [endHours, endMinutes, endSeconds] = endTimeStr.split(':').map(Number);
    
                        const now = new Date();
                        const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes, startSeconds);
                        const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes, endSeconds);
    
                        return now >= startTime && now <= endTime;
                    };
    
                    if (user.userType === 'User') {
                        // Kiểm tra activeStatus
                        if (user.activeStatus === 0) {
                            toast.error('Tài khoản chưa kích hoạt', {
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

                        // Kiểm tra activeShedule và ngày kích hoạt
                        if (user.activeShedule === 1) {
                            const currentDate = new Date();
                            const activationDate = new Date(user.activationDate);
                            const deactivationDate = new Date(user.deactivationDate);
                            if (currentDate < activationDate || currentDate > deactivationDate) {
                                toast.error('Tài khoản không trong thời gian kích hoạt', {
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
                        }
    
                        // Kiểm tra workShedule và workDayofWeek
                        if (user.workShedule === 1) {
                            const currentDayOfWeek = new Date().getDay(); // Lấy ngày trong tuần (0-6, Chủ nhật là 0)
                            
                            // Điều chỉnh để ngày bắt đầu từ thứ Hai (2)
                            const adjustedDay = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Chủ nhật (0) là ngày cuối tuần trong chuỗi (6), các ngày còn lại trừ đi 1

                            const workDays = user.workDayofWeek; // Ví dụ: "1111100" - làm việc từ thứ 2 đến thứ 6

                            // Kiểm tra nếu ngày hiện tại là ngày không làm việc
                            if (workDays[adjustedDay] === '0') {
                                toast.error('Hôm nay không phải là ngày làm việc', {
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
                        }
    
                        // Kiểm tra thời gian hoạt động (startTime, endTime)
                        if (user.startTime && user.endTime) {
                            if (isCurrentTimeInRange(user.startTime, user.endTime)) {
                                console.log("Thời gian hiện tại nằm trong khoảng!");
                                handleLoginSuccess();
                            } else {
                                toast.error('Chưa đến giờ hoạt động', {
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
                        } else {
                            console.log("startTime hoặc endTime không tồn tại.");
                        }
    
                    } else if (user.userType === 'Admin') {
                        // Admin chỉ kiểm tra activeStatus
                        if (user.activeStatus === 1) {
                            handleLoginSuccess();
                        } else {
                            toast.error('Tài khoản chưa kích hoạt', {
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
                } else {
                    toast.error('Tài khoản hoặc mật khẩu không chính xác', {
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
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    };    
    
    return (
        <div className="login">

            <Flex className="mt-5 shadow-lg" align="center" justify="center">
                <div className="logo-container">
                    <img 
                        src={logo}
                        alt="Pharmacist Logo" 
                        className="logo"
                    />
                    <div className="orbits">
                        <div className="orbit orbit1"></div>
                        <div className="orbit orbit2"></div>
                        <div className="orbit orbit3"></div>
                    </div>
                </div>
            </Flex>

            <div className="container-login">
                <h1>Chào mừng bạn trở lại</h1>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Tên đăng nhập"/>
                <p className="position-relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu"/>
                    <i
                        className="login-iconEyes position-absolute"
                        onClick={() => setShowPassword(!showPassword)} // Chuyển đổi trạng thái hiển/ẩn
                        style={{ cursor: "pointer" }}
                    >
                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </i>
                </p>
                <button disabled={!username || !password} onClick={handleLogin} className="btn-login">Đăng nhập</button>                
            </div>
            <ToastContainer />
        </div>
    );
}

export default login;