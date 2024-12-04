import axios from 'axios';

const serverHost = window.location.hostname;
export const axiosCus = axios.create({
	// ser chạy gì thay chuẩn đó
  baseURL: `http://${serverHost}:5215/api/`,
	//baseURL: `https://${serverHost}:44323/api/`,
});

axiosCus.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  });