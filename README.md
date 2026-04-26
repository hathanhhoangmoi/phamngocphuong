# Fanola Strategy Static Site

Trang web tĩnh tóm lược chiến lược E-commerce cho Fanola, dùng HTML, CSS và JavaScript thuần, sẵn sàng đưa lên GitHub và deploy trên Render.

## Chạy local

Mở trực tiếp `index.html` hoặc chạy một static server đơn giản:

```bash
python3 -m http.server 8000
```

Sau đó truy cập `http://localhost:8000`.

## Deploy lên Render

1. Push toàn bộ source code này lên GitHub.
2. Tạo service mới trên Render từ repository đó.
3. Render sẽ đọc `render.yaml` và deploy dưới dạng static site.
