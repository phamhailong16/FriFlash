export const messages: Record<string, string> = {
  // Deck errors
  "ERR-D001": "Tên bộ thẻ không được để trống.",
  "ERR-D002": "Bộ thẻ với tên này đã tồn tại.",
  "ERR-D003": "Tên bộ thẻ không được vượt quá 50 ký tự.",
  "ERR-D004": "Mô tả không được vượt quá 200 ký tự.",
  "ERR-D005": "Không tìm thấy bộ thẻ.",
  "ERR-D006": "Không thể tạo bộ thẻ. Vui lòng thử lại.",
  "ERR-D007": "Không thể cập nhật bộ thẻ. Vui lòng thử lại.",
  "ERR-D008": "Không thể xoá bộ thẻ. Vui lòng thử lại.",
  "ERR-D009": "Vui lòng chọn ít nhất 2 bộ thẻ để gộp.",
  "ERR-D010": "Không thể gộp bộ thẻ. Vui lòng thử lại.",

  // Word errors
  "ERR-W001": "Chữ Hán (Hanzi) không được để trống.",
  "ERR-W002": "Không tìm thấy từ vựng.",
  "ERR-W003": "Không thể thêm từ vựng. Vui lòng thử lại.",
  "ERR-W004": "Không thể cập nhật từ vựng. Vui lòng thử lại.",
  "ERR-W005": "Không thể tra cứu từ điển. Bạn có thể nhập thủ công.",

  // Import errors
  "ERR-I001": "Đường dẫn Google Sheets không hợp lệ.",
  "ERR-I002": "Bảng tính Google Sheets chưa được chia sẻ công khai.",
  "ERR-I003": "File vượt quá giới hạn 10MB.",
  "ERR-I004": "Dữ liệu vượt quá giới hạn 5.000 dòng.",
  "ERR-I005": "Không thể tải file lên. Vui lòng thử lại.",

  // Study/Stats errors
  "ERR-S001": "Không thể lưu tiến độ học. Vui lòng thử lại.",
  "ERR-S002": "Không thể tải thống kê. Vui lòng thử lại.",
  "ERR-S003": "Không có thẻ nào để học trong bộ thẻ này.",

  // Network error
  "ERR-NET": "Mất kết nối mạng. Vui lòng kiểm tra lại.",

  // Generic
  "ERR-UNKNOWN": "Đã xảy ra lỗi. Vui lòng thử lại.",
};

export function getMessage(code: string): string {
  return messages[code] ?? messages["ERR-UNKNOWN"];
}
