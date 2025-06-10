# 🕐 Countdown Timer - Đồng Hồ Đếm Ngược

> Ứng dụng đồng hồ đếm ngược hiện đại với giao diện Flip Clock và tích hợp Pomodoro Technique

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 📖 Tổng quan

Ứng dụng Countdown Timer là một công cụ quản lý thời gian mạnh mẽ được thiết kế với giao diện flip clock đẹp mắt, tích hợp Pomodoro Technique và các tính năng thông báo thông minh. Hoàn toàn xây dựng bằng Vanilla JavaScript, không yêu cầu framework hay build tools.

## ✨ Tính năng nổi bật

### 🎯 Core Features
- **Flip Clock Display** - Hiển thị thời gian với hiệu ứng flip animation
- **Pomodoro Timer** - Quản lý chu kỳ làm việc và nghỉ ngơi tự động
- **Smart Break System** - Nghỉ ngắn và nghỉ dài thông minh
- **Audio Notifications** - Thông báo âm thanh tùy chỉnh
- **Desktop Notifications** - Thông báo trên desktop
- **Keyboard Shortcuts** - Điều khiển nhanh bằng phím tắt

### ⚙️ Customization
- Thời gian làm việc: `1-120 phút`
- Thời gian nghỉ ngắn: `1-30 phút`
- Thời gian nghỉ dài: `1-60 phút`
- Số phiên trước nghỉ dài: `1-10 phiên`
- Điều khiển âm lượng: `0-100%`

### ⌨️ Keyboard Shortcuts
| Phím | Chức năng |
|------|-----------|
| `Space` | Bắt đầu/Tạm dừng |
| `R` | Đặt lại timer |
| `S` | Bỏ qua phiên hiện tại |

## 🚀 Cài đặt & Sử dụng

### Quick Start
1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd countdown-timer
   ```

2. **Mở ứng dụng**
   ```bash
   # Cách 1: Mở trực tiếp
   open index.html
   
   # Cách 2: Sử dụng live server (khuyến nghị)
   # Với VS Code Live Server extension
   # Hoặc với Python
   python -m http.server 8000
   ```

3. **Bắt đầu sử dụng**
   - Cài đặt thời gian theo nhu cầu
   - Nhấn "Bắt đầu" hoặc `Space`
   - Tận hưởng Pomodoro workflow!

### Pomodoro Workflow
```
🍅 Làm việc (25p) → 🛌 Nghỉ ngắn (5p) → 🍅 Làm việc (25p) → 🛌 Nghỉ ngắn (5p) 
→ 🍅 Làm việc (25p) → 🛌 Nghỉ ngắn (5p) → 🍅 Làm việc (25p) → 🏖️ Nghỉ dài (15-30p)
```

## 🎨 Giao diện

### Design System
- **Layout**: CSS Grid & Flexbox
- **Style**: Glassmorphism design
- **Animation**: CSS transitions & keyframes
- **Typography**: Modern sans-serif fonts
- **Colors**: Dynamic theme based on timer state

### Responsive Breakpoints
- **Desktop**: `> 1024px` - Full layout với tất cả tính năng
- **Tablet**: `768px - 1024px` - Layout tối ưu cho touch
- **Mobile**: `< 768px` - Compact layout

## 🔧 Technical Stack

### Frontend
```
HTML5       │ Semantic markup
CSS3        │ Grid, Flexbox, Animations, Glassmorphism
JavaScript  │ ES6+, Web APIs, OOP, Event-driven
```

### Web APIs
- **Web Audio API** - Audio generation & control
- **Notification API** - Desktop notifications
- **Local Storage** - Settings persistence (future)

### Browser Support
| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 60+ | ✅ Full |
| Firefox | 55+ | ✅ Full |
| Safari | 11+ | ✅ Full |
| Edge | 79+ | ✅ Full |

## 📱 Mobile Experience

- **Touch-friendly** controls với kích thước button tối ưu
- **Responsive** layout tự động điều chỉnh
- **Performance** optimized cho mobile browsers
- **PWA-ready** structure (future enhancement)

## 🔊 Audio & Notifications

### Audio System
```javascript
// Web Audio API for programmatic sound generation
const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
// Clean, pleasant beep sounds
```

### Notification System
- **Permission handling** - Tự động request permission
- **Context-aware** - Messages thay đổi theo timer state
- **Cross-platform** - Hoạt động trên tất cả OS

## 🛠️ Development

### Project Structure
```
countdown-timer/
├── index.html          # Main HTML file
├── styles/
│   ├── main.css        # Core styles
│   └── responsive.css  # Media queries
├── scripts/
│   ├── timer.js        # Timer logic
│   ├── audio.js        # Audio system
│   └── ui.js          # UI interactions
└── README.md
```

### Development Setup
```bash
# No build process required!
# Just open index.html in browser

# For development with live reload:
npm install -g live-server
live-server
```

### Code Style
- **ES6+** modern JavaScript
- **Vanilla JS** - No frameworks
- **Modular** - Separated concerns
- **Clean** - Well-commented code

## 🎯 Roadmap

### Version 2.0 (Planned)
- [ ] **Dark/Light Theme** toggle
- [ ] **Custom Audio** upload support
- [ ] **Statistics** & productivity analytics
- [ ] **Cloud Sync** với user accounts
- [ ] **PWA** với offline support

### Version 3.0 (Future)
- [ ] **Focus Music** integration
- [ ] **Team Mode** - Shared timers
- [ ] **Mobile App** (React Native)
- [ ] **Desktop App** (Electron)

## 📊 Performance

- **Load time**: < 1s
- **Memory usage**: < 10MB
- **CPU usage**: Minimal
- **Battery impact**: Low

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the **Pomodoro Technique** by Francesco Cirillo
- **Fliqlo** clock design inspiration
- **Modern web standards** & best practices

---

<div align="center">

**🍅 Happy Pomodoro-ing! 🍅**

*Tăng năng suất với kỹ thuật Pomodoro hiệu quả*

</div> 