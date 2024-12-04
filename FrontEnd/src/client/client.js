import axios from 'axios';

const API_version = '/api/v1';

// Thêm axios interceptor để xử lý token hết hạn
// Interceptor này sẽ bắt tất cả các response từ server
axios.interceptors.response.use(
  // Nếu response thành công, trả về response như bình thường
  (response) => response,
  // Nếu có lỗi xảy ra
  (error) => {
    // Kiểm tra nếu response trả về lỗi 401 (Unauthorized) hoặc 403 (Forbidden)
    // Điều này thường xảy ra khi token hết hạn hoặc không hợp lệ
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Xóa token đã hết hạn khỏi localStorage
      localStorage.removeItem('token');
      // Chuyển hướng người dùng về trang login để đăng nhập lại
      window.location.href = '/login';
    }
    // Tiếp tục ném lỗi để các hàm khác có thể xử lý nếu cần
    return Promise.reject(error);
  }
);

const fetchGetData = (uri) => {
  const url = `${API_version}${uri}`;
  return axios.get(url).catch((error) => {
    // Handle exceptions/errors
    console.error('Error fetching data for URL:', url, 'Error', error.message);
    // You can throw the error again if you want to handle it elsewhere
    throw error;
  });
};

const fetchGetDataArrayBuffer = (uri) => {
  const url = `${API_version}${uri}`;
  try {
    const response = axios.get(url, {
      responseType: 'arraybuffer'
    });
    return response;
  } catch (error) {
    // Xử lý lỗi nếu yêu cầu thất bại
    console.error('Error fetching data:', error);
  }
};

const fetchPostData = (uri, payload) => {
  const url = `${API_version}${uri}`;
  return axios.post(url, payload).catch((error) => {
    // Handle exceptions/errors
    console.error('Error fetching data for URL:', url, 'Error', error.message);
    // You can throw the error again if you want to handle it elsewhere
    throw error;
  });
};

const fetchPostDataWithAuth = (uri, payload) => {
  const token = localStorage.getItem('token');
  const url = `${API_version}${uri}`;
  return axios
    .post(url, payload, {
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    .catch((error) => {
      // Handle exceptions/errors
      console.error('Error fetching data for URL:', url, 'Error', error.message);
      // You can throw the error again if you want to handle it elsewhere
      throw error;
    });
};

const fetchPutDataWithAuth = (uri, payload) => {
  const token = localStorage.getItem('token');
  const url = `${API_version}${uri}`;
  return axios
    .put(url, payload, {
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    .catch((error) => {
      console.error('Error fetching data for URL:', url, 'Error', error.message);
      throw error;
    });
};

const fetchGetDataWithAuth = async (uri) => {
  const token = localStorage.getItem('token');
  const url = `${API_version}${uri}`;
  try {
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return response;
  } catch (error) {
    // Handle errors if the request fails
    console.error('Error fetching data:', error);
  }
};

const fetchPostFileUploadWithAuth = async (uri, formData) => {
  const token = localStorage.getItem('token');
  const url = `${API_version}${uri}`;
  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    // Handle errors if the request fails
    console.error('Error fetching data:', error);
  }
};

const fetchPutFileUploadWithAuth = async (uri, formData) => {
  const token = localStorage.getItem('token');
  const url = `${API_version}${uri}`;
  try {
    const response = await axios.put(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    // Handle errors if the request fails
    console.error('Error fetching data:', error);
  }
};

const fetchGetDataWithAuthArrayBuffer = (uri) => {
  const token = localStorage.getItem('token');
  const url = `${API_version}${uri}`;
  try {
    const response = axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'arraybuffer'
    });
    return response;
  } catch (error) {
    // Handle errors if the request fails
    console.error('Error fetching data:', error);
  }
};

const fetchDeleteDataWithAuth = async (uri) => {
  const token = localStorage.getItem('token');
  const url = `${API_version}${uri}`;
  try {
    const response = await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
    return response;
  } catch (error) {
    // Handle errors if the request fails
    console.error('Error fetching data:', error);
  }
};

const fetchGetBlobDataWithAuth = async (uri) => {
  const token = localStorage.getItem('token');
  const url = `${API_version}${uri}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'blob' // Chỉ định trả về dữ liệu dạng blob
    });

    return response;
  } catch (error) {
    // Xử lý lỗi nếu yêu cầu thất bại
    console.error('Error fetching data:', error);
  }
};

export default fetchGetData;
export {
  fetchGetDataArrayBuffer,
  fetchGetData,
  fetchPutDataWithAuth,
  fetchPostData,
  fetchPostDataWithAuth,
  fetchGetDataWithAuth,
  fetchPostFileUploadWithAuth,
  fetchGetDataWithAuthArrayBuffer,
  fetchDeleteDataWithAuth,
  fetchGetBlobDataWithAuth,
  fetchPutFileUploadWithAuth
};
