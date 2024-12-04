import React, { useEffect, useState } from "react";
import "./feed.scss";
import Share from "../share/Share";
import Post from "../post/Post";
import fetchGetData from "client/client";
import { useParams } from "react-router-dom"; // Import useParams để lấy userId từ URL

// Component Feed: hiển thị danh sách bài viết và phần chia sẻ
const Feed = () => {
  // Khởi tạo state để lưu trữ danh sách bài post
  const [posts, setPosts] = useState(null);

  // Lấy token từ localStorage để xác thực người dùng
  const token = localStorage.getItem('token'); // Kiểm tra token trong localStorage

  // Lấy userId từ URL thông qua hook useParams
  const { userId } = useParams(); // Lấy userId từ URL nếu có

  useEffect(() => {
    // Kiểm tra xem có token không trước khi gọi API
    if (token) { // Kiểm tra token trước khi gọi API
      const getPosts = async () => {
        try {
          // Xác định endpoint dựa vào việc có userId hay không
          // Nếu có userId: lấy bài viết của user đó
          // Nếu không có userId: lấy tất cả bài viết
          const endpoint = userId ? `/user/${userId}/posts` : "/posts"; // URL tùy thuộc vào việc có userId hay không

          // Gọi API để lấy danh sách bài viết
          const response = await fetchGetData(endpoint); // Gọi API

          // Cập nhật state posts với dữ liệu nhận được
          setPosts(response.data); // Lưu danh sách posts vào state
        } catch (error) {
          console.error("Failed to fetch posts:", error);
        }
      };

      // Gọi hàm getPosts để lấy dữ liệu
      getPosts();
    }
  }, [token, userId]); // useEffect sẽ chạy lại khi token hoặc userId thay đổi

  return (
    // Container chính của feed
    <div className="feed">
      <div className="feedWrapper">
        {/* Hiển thị component Share chỉ khi có token (đã đăng nhập) */}
        {token && <Share />}

        {/* Kiểm tra có dữ liệu posts không trước khi render */}
        {posts && (
          <>
            {/* Lặp qua mảng posts và render từng Post component */}
            {posts.map((p) => (
              <Post key={p.postId} post={p} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Feed;
