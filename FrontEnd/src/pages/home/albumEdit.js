
import React, { useState } from 'react'; // Import React và hook useState từ thư viện React
import TextField from '@mui/material/TextField'; // Import TextField từ Material UI để sử dụng input dạng text
import Button from '@mui/material/Button'; // Import Button từ Material UI để sử dụng nút bấm
import { useEffect } from 'react'; // Import useEffect từ React để thực thi tác vụ khi component mount hoặc cập nhật
import { fetchPutDataWithAuth, fetchGetDataWithAuth } from 'client/client'; // Import các hàm fetch để gửi và nhận dữ liệu với xác thực
import { useNavigate } from 'react-router-dom'; // Import useNavigate từ react-router-dom để điều hướng người dùng
import { useLocation } from 'react-router-dom'; // Import useLocation để lấy thông tin URL hiện tại

const EditAlbumForm = () => {
  const navigate = useNavigate(); // Khởi tạo hook useNavigate để điều hướng người dùng trong ứng dụng
  const location = useLocation(); // Lấy thông tin về URL hiện tại
  const queryParams = new URLSearchParams(location.search); // Lấy các tham số trong URL
  const album_id = queryParams.get('id'); // Lấy ID của album từ tham số URL

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa thông qua token trong localStorage
    const isLoggedIn = localStorage.getItem('token');
    if (!isLoggedIn) {
      // Nếu chưa đăng nhập, chuyển hướng người dùng đến trang đăng nhập và reload lại trang
      navigate('/login');
      window.location.reload();
    }

    // Lấy dữ liệu của album thông qua ID và cập nhật vào form
    fetchGetDataWithAuth('/albums/' + album_id)
      .then(res => {
        if (res.data) {
          setFormData(prevFormData => ({
            ...prevFormData,
            name: res.data.name, // Cập nhật tên của album vào form
            description: res.data.description // Cập nhật mô tả của album vào form
          }));
        }
      });
  }, []); // Chỉ chạy một lần khi component mount

  // Khởi tạo state formData để lưu trữ dữ liệu nhập vào từ form
  const [formData, setFormData] = useState({
    name: '', // Trường "name" khởi tạo rỗng
    description: '' // Trường "description" khởi tạo rỗng
  });

  // Khởi tạo state errors để lưu trữ thông báo lỗi cho các trường dữ liệu
  const [errors, setErrors] = useState({
    name: '', // Mặc định không có lỗi cho trường "name"
    description: '' // Mặc định không có lỗi cho trường "description"
  });

  // Hàm xử lý khi người dùng thay đổi nội dung trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target; // Lấy tên và giá trị của trường dữ liệu
    setFormData((prevData) => ({
      ...prevData, // Giữ lại các giá trị trước đó
      [name]: value // Cập nhật giá trị mới cho trường được thay đổi
    }));
  };

  // Hàm xử lý khi người dùng submit form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn hành vi mặc định của form (không reload trang)

    // Biến cờ để kiểm tra form có hợp lệ hay không
    let isValid = true;
    const newErrors = { name: '', description: '' }; // Khởi tạo đối tượng chứa lỗi mới

    // Kiểm tra trường "name" có trống không
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'; // Đặt thông báo lỗi cho trường "name"
      isValid = false; // Form không hợp lệ
    }

    // Kiểm tra trường "description" có trống không
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'; // Đặt thông báo lỗi cho trường "description"
      isValid = false; // Form không hợp lệ
    }

    // Cập nhật lại các lỗi nếu có
    setErrors(newErrors);

    // Nếu form hợp lệ, thực hiện gửi dữ liệu lên server
    if (isValid) {
      const payload = {
        name: formData.name, // Trường "name" từ dữ liệu trong form
        description: formData.description // Trường "description" từ dữ liệu trong form
      };

      // Gửi dữ liệu qua API để cập nhật album với ID đã có
      fetchPutDataWithAuth("/albums/" + album_id + "/update", payload)
        .then((response) => {
          // Xử lý kết quả từ server nếu thành công
          console.log(response); // In kết quả ra console
        })
        .catch((error) => {
          // Xử lý lỗi nếu có sự cố khi gửi yêu cầu
          console.error('Login error:', error);
        });

      console.log('Form submitted:'); // In ra thông báo khi form được submit
      navigate('/'); // Điều hướng người dùng trở về trang chủ sau khi cập nhật thành công
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form sẽ gọi handleSubmit khi người dùng nhấn nút submit */}
      <TextField
        fullWidth // Input chiếm toàn bộ chiều rộng
        label="Name" // Nhãn của input
        variant="outlined" // Kiểu của input
        name="name" // Tên trường dữ liệu (được liên kết với formData)
        value={formData.name} // Giá trị của input từ formData
        onChange={handleInputChange} // Gọi handleInputChange khi nội dung thay đổi
        error={!!errors.name} // Hiển thị lỗi nếu có
        helperText={errors.name} // Thông báo lỗi bên dưới input
        margin="normal" // Thiết lập lề mặc định của input
      />
      <TextField
        fullWidth // Input chiếm toàn bộ chiều rộng
        label="Description" // Nhãn của input
        variant="outlined" // Kiểu của input
        name="description" // Tên trường dữ liệu
        value={formData.description} // Giá trị của input từ formData
        onChange={handleInputChange} // Gọi handleInputChange khi nội dung thay đổi
        error={!!errors.description} // Hiển thị lỗi nếu có
        helperText={errors.description} // Thông báo lỗi bên dưới input
        multiline // Cho phép nhập nhiều dòng văn bản
        rows={4} // Số dòng hiển thị trong trường nhập liệu
        margin="normal" // Thiết lập lề mặc định của input
      />
      <Button type="submit" variant="contained" color="primary">
        {/* Nút submit form */}
        Edit Album {/* Văn bản hiển thị trên nút */}
      </Button>
    </form>
  );
};

export default EditAlbumForm; // Xuất component để sử dụng ở nơi khác
