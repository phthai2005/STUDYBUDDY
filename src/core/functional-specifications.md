# Functional Specifications

## 1. Authentication & Onboarding

Mục tiêu: đảm bảo môi trường học tập an toàn và chuẩn hoá người dùng bằng thông tin trường học.

- Người dùng có thể đăng ký và đăng nhập bằng:
  - Email trường học `.edu`
  - Google Sign-In (OAuth)
- Kiểm tra tính hợp lệ của email trường học để chặn tài khoản cá nhân.
- Khi đăng ký thành công, tạo hồ sơ người dùng ban đầu trong collection `users`.
- Sử dụng Firestore `users` để lưu:
  - `uid`, `name`, `email`, `avatar`, `school`, `major`, `courses`, `schedule`, `location`
- Onboarding cần hướng dẫn người dùng:
  - hoàn thành hồ sơ
  - lựa chọn môn đang theo học
  - cập nhật Availability 7 ngày

## 2. Profile Management

Mục tiêu: cho phép sinh viên tự quản lý hồ sơ và thời gian rảnh để phối hợp học nhóm.

- Màn hình Profile cho phép cập nhật:
  - ảnh đại diện
  - tên
  - trường / chuyên ngành
  - email hiển thị
- Quan trọng nhất: Availability 7 ngày
  - Lịch rảnh theo ngày trong tuần
  - Mỗi ngày chứa các khung giờ/mốc giờ rảnh
  - Thông tin này lưu trong `users.schedule`
- Hồ sơ cũng lưu hồ sơ học tập cơ bản:
  - `courses`: danh sách mã môn học
  - `location`: tọa độ hoặc vùng học

## 3. Matching Engine

Mục tiêu: ghép bạn học phù hợp dựa trên môn học và khoảng cách địa lý.

- Tính toán tương thích với hai yếu tố chính:
  - Courses: số môn học trùng
  - Geo-hash / khoảng cách: người gần nhau hơn được ưu tiên
- Kết quả trả về danh sách Study Buddies có:
  - `matchScore` hoặc `matchPercent`
  - `sharedCourses`
  - `sharedSchedule`
  - `distance`
- Yêu cầu dữ liệu:
  - `users.location` chứa latitude / longitude
  - `users.courses` chứa danh sách mã môn học
  - `users.schedule` chứa lịch rảnh
- Kết quả gợi ý nên ưu tiên:
  - cùng trường / cùng chuyên ngành
  - lịch trùng khớp
  - khoảng cách địa lý gần

## 4. Group Chat & Media Sharing

Mục tiêu: hỗ trợ cộng tác nhóm realtime với chia sẻ tài liệu học tập.

- Chat nhóm realtime dùng Firestore `messages`.
- Mỗi tin nhắn lưu:
  - `messageId`, `groupId`, `senderId`, `senderName`, `text`, `fileUrl`, `fileType`, `timestamp`
- Hỗ trợ nội dung đa phương tiện:
  - hình ảnh (image)
  - PDF tài liệu học tập (file)
  - ghi chú / tài liệu văn bản
- Thành phần chat phải hiển thị:
  - tên nhóm
  - tin nhắn gần nhất
  - thông báo khi nhóm có tin nhắn mới
- Khi gửi file, lưu `fileUrl` trong message và hiển thị phù hợp.
- Tính năng notification hiển thị khi có tin nhắn mới trong nhóm.

## 5. Schedule Manager

Mục tiêu: tạo và quản lý lịch họp nhóm, nhắc lịch đúng giờ.

- Dữ liệu họp lưu trong Firestore `meetings`:
  - `meetingId`, `groupId`, `groupName`, `title`, `description`, `dateTime`, `locationName`, `coordinates`, `createdBy`, `participants`, `createdAt`, `updatedAt`
- Chức năng:
  - tạo cuộc họp mới cho nhóm
  - chọn thời gian, địa điểm và chủ đề
  - mời / thêm thành viên nhóm vào `participants`
- Tự động nhắc lịch:
  - gửi thông báo trước khi cuộc họp diễn ra
  - thông báo đẩy hoặc trong app reminder
- Liên kết với chat nhóm để dễ truy cập thông tin cuộc họp.

## 6. End-of-Term Review

Mục tiêu: khuyến khích trách nhiệm nhóm với đánh giá ẩn danh.

- Sau khi kết thúc môn học hoặc nhóm học, sinh viên có thể đánh giá đồng đội.
- Dữ liệu review lưu trong collection `peer_reviews`:
  - `reviewId`, `groupId`, `reviewerId`, `revieweeId`, `rating`, `comment`, `timestamp`
- Yêu cầu:
  - đánh giá ẩn danh với người được review không biết danh tính reviewer
  - mỗi thành viên chỉ có thể đánh giá đồng đội trong cùng nhóm
  - tổng hợp số sao và nhận xét để cải thiện chất lượng học tập

## Mapping tới hệ thống hiện tại

- `users` tương ứng với collection `users`
- `groups` hiện đang được lưu tạm dưới tên `study_groups`
- `messages` đã có subscription realtime trong `ChatRoom`
- `meetings` đã có màn hình tạo cuộc họp
- `reviews` hiện đang dùng collection `peer_reviews`

## Gợi ý cải tiến tiếp theo

- Thêm Google Sign-In và kiểm tra `.edu`
- Xây dựng `UserRepository`, `GroupRepository`, `MessageRepository`, `MeetingRepository`, `ReviewRepository`
- Triển khai push notification schedule cho `meetings`
- Bổ sung geo-hash/cluster để lọc kết quả matching nhanh hơn
