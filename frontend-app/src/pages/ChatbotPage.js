import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import { getVehicles } from '../api/vehicleAPI';
import { getStations } from '../api/stations';
import { getAllBookings } from '../api/bookings';

const ChatbotPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [chatData, setChatData] = useState({
    vehicles: [],
    stations: [],
    bookings: [],
    vehicleStats: { total: 0, available: 0, avgPrice: 0 }
  });
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Xin chào, tôi là BTSTQ - Trợ lý AI thông minh của FEV. Tôi có thể giúp bạn:',
      timestamp: new Date(),
      suggestions: [
        'Tìm hiểu về xe điện hiện có',
        'Xem danh sách trạm xe',
        'Thông tin về giá cả và khuyến mãi',
        'Hướng dẫn cách đặt xe',
        'Thống kê hệ thống xe'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load real data from APIs
  useEffect(() => {
    const loadChatData = async () => {
      try {
        setIsLoadingData(true);
        
        // Load vehicles data
        const vehiclesResponse = await getVehicles({ limit: 100 });
        let vehicles = [];
        if (Array.isArray(vehiclesResponse)) {
          vehicles = vehiclesResponse;
        } else if (vehiclesResponse && vehiclesResponse.content) {
          vehicles = vehiclesResponse.content;
        }

        // Load stations data
        const stations = await getStations();

        // Calculate vehicle statistics
        const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
        const avgPrice = vehicles.length > 0 
          ? vehicles.reduce((sum, v) => sum + (v.pricePerHour || 0), 0) / vehicles.length 
          : 0;

        setChatData({
          vehicles,
          stations: stations || [],
          vehicleStats: {
            total: vehicles.length,
            available: availableVehicles.length,
            avgPrice: Math.round(avgPrice)
          }
        });

        console.log('📊 Chatbot data loaded:', {
          vehiclesCount: vehicles.length,
          stationsCount: (stations || []).length,
          availableVehicles: availableVehicles.length
        });

      } catch (error) {
        console.error('❌ Error loading chatbot data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadChatData();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpenLogin = (onSuccessCallback) => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginModalOpen(false);
  };

  const simulateBotResponse = (userMessage) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let botResponse = '';
      const lowerMessage = userMessage.toLowerCase();
      const { vehicles, stations, vehicleStats } = chatData;

      // Xe điện/thuê xe
      if (lowerMessage.includes('xe điện') || lowerMessage.includes('thuê xe') || lowerMessage.includes('xe hiện có')) {
        const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
        const vehicleTypes = [...new Set(vehicles.map(v => v.type))].filter(Boolean);
        
        botResponse = `THÔNG TIN XE ĐIỆN HIỆN CÓ\n\n` +
          `Thống kê: ${vehicleStats.total} xe tổng cộng, ${vehicleStats.available} xe sẵn sàng\n\n` +
          `Loại xe phổ biến: ${vehicleTypes.slice(0, 5).join(', ')}\n\n` +
          `Giá trung bình: ${vehicleStats.avgPrice.toLocaleString()}đ/giờ\n\n` +
          `Ví dụ xe khả dụng:`;
        
        availableVehicles.slice(0, 3).forEach(vehicle => {
          const station = stations.find(s => s.id === vehicle.station?.id);
          botResponse += `\n• ${vehicle.description || vehicle.type} - ${vehicle.pricePerHour?.toLocaleString() || 'N/A'}đ/giờ (Pin: ${vehicle.batteryLevel || 0}%) tại ${station?.name || 'N/A'}`;
        });

        botResponse += `\n\nBạn có thể hỏi:\n• "Xe nào rẻ nhất?"\n• "Xe ở Hà Nội có gì?"\n• "Xe pin đầy có không?"`;
        
      // Xe rẻ nhất
      } else if (lowerMessage.includes('rẻ nhất') || lowerMessage.includes('giá thấp') || lowerMessage.includes('tiết kiệm')) {
        const cheapestVehicles = vehicles
          .filter(v => v.pricePerHour && v.status === 'AVAILABLE')
          .sort((a, b) => a.pricePerHour - b.pricePerHour)
          .slice(0, 5);
          
        botResponse = `XE GIÁ RẺ NHẤT HIỆN TẠI\n\n`;
        cheapestVehicles.forEach((vehicle, index) => {
          const station = stations.find(s => s.id === vehicle.station?.id);
          botResponse += `${index + 1}. ${vehicle.description || vehicle.type} - ${vehicle.pricePerHour.toLocaleString()}đ/giờ\n`;
          botResponse += `    Vị trí: ${station?.name || 'N/A'} - ${station?.province || 'N/A'}\n`;
          botResponse += `    Pin: ${vehicle.batteryLevel || 0}%, Ghế: ${vehicle.seats || 'N/A'}\n\n`;
        });
        
        botResponse += `Mẹo tiết kiệm: Thuê nhiều giờ được giảm giá, đặt trước có ưu đãi!`;

      // Xe theo tỉnh/thành - tìm kiếm động
      } else if (lowerMessage.includes('xe ở') || lowerMessage.includes('trạm ở') || lowerMessage.includes('tại ') || 
                 lowerMessage.includes('tỉnh') || lowerMessage.includes('thành phố') || 
                 lowerMessage.includes('hà nội') || lowerMessage.includes('hcm') || lowerMessage.includes('đà nẵng') || 
                 lowerMessage.includes('sài gòn') || lowerMessage.includes('cần thơ') || lowerMessage.includes('hải phòng')) {
        
        // Tạo danh sách tất cả tỉnh/thành có trong hệ thống
        const allProvinces = [...new Set(stations.map(s => s.province?.toLowerCase().trim()))].filter(Boolean);
        
        // Tìm tỉnh/thành được mention trong câu hỏi
        let searchProvince = '';
        let foundProvince = '';
        
        // Kiểm tra tên tỉnh/thành trong câu hỏi với dữ liệu thực
        for (const province of allProvinces) {
          const provinceWords = province.split(' ');
          
          // Kiểm tra từng từ trong tên tỉnh
          if (provinceWords.some(word => lowerMessage.includes(word.toLowerCase())) ||
              lowerMessage.includes(province)) {
            searchProvince = province;
            foundProvince = stations.find(s => s.province?.toLowerCase() === province)?.province || province;
            break;
          }
        }
        
        // Mapping các từ khóa đặc biệt
        const specialMappings = {
          'hà nội': allProvinces.find(p => p.includes('hà nội') || p.includes('hanoi')),
          'hcm': allProvinces.find(p => p.includes('hồ chí minh') || p.includes('hcm')),
          'sài gòn': allProvinces.find(p => p.includes('hồ chí minh') || p.includes('hcm')),
          'đà nẵng': allProvinces.find(p => p.includes('đà nẵng')),
          'cần thơ': allProvinces.find(p => p.includes('cần thơ')),
          'hải phòng': allProvinces.find(p => p.includes('hải phòng'))
        };
        
        // Kiểm tra mapping đặc biệt nếu chưa tìm thấy
        if (!searchProvince) {
          for (const [keyword, mappedProvince] of Object.entries(specialMappings)) {
            if (lowerMessage.includes(keyword) && mappedProvince) {
              searchProvince = mappedProvince;
              foundProvince = stations.find(s => s.province?.toLowerCase() === mappedProvince)?.province || mappedProvince;
              break;
            }
          }
        }
        
        if (searchProvince && foundProvince) {
          // Tìm trạm và xe tại tỉnh/thành đó
          const stationsInProvince = stations.filter(s => 
            s.province?.toLowerCase() === searchProvince
          );
          
          const vehiclesInProvince = vehicles.filter(v => {
            const station = stations.find(s => s.id === v.station?.id);
            return station?.province?.toLowerCase() === searchProvince;
          });
          
          const availableVehicles = vehiclesInProvince.filter(v => v.status === 'AVAILABLE');
          const avgPrice = vehiclesInProvince.length > 0 
            ? vehiclesInProvince.reduce((sum, v) => sum + (v.pricePerHour || 0), 0) / vehiclesInProvince.length 
            : 0;
          
          botResponse = `XE ĐIỆN TẠI ${foundProvince.toUpperCase()}\n\n`;
          botResponse += `TỔNG QUAN\n`;
          botResponse += `Số trạm: ${stationsInProvince.length} trạm\n`;
          botResponse += `Tổng xe: ${vehiclesInProvince.length} xe\n`;
          botResponse += `Xe sẵn sàng: ${availableVehicles.length} xe\n`;
          botResponse += `Giá trung bình: ${Math.round(avgPrice).toLocaleString()}đ/giờ\n\n`;
          
          if (stationsInProvince.length > 0) {
            botResponse += `CÁC TRẠM CHÍNH\n`;
            stationsInProvince.slice(0, 4).forEach(station => {
              const vehicleCount = vehicles.filter(v => v.station?.id === station.id).length;
              const availableCount = vehicles.filter(v => v.station?.id === station.id && v.status === 'AVAILABLE').length;
              botResponse += `• ${station.name}\n`;
              botResponse += `   Địa chỉ: ${station.address}\n`;
              botResponse += `   Xe: ${vehicleCount} tổng, ${availableCount} sẵn sàng\n\n`;
            });
          }
          
          if (availableVehicles.length > 0) {
            botResponse += `XE KHẢ DỤNG TẠI ${foundProvince.toUpperCase()}\n`;
            availableVehicles.slice(0, 5).forEach(vehicle => {
              const station = stations.find(s => s.id === vehicle.station?.id);
              botResponse += `• ${vehicle.description || vehicle.type} - ${vehicle.pricePerHour?.toLocaleString() || 'N/A'}đ/giờ\n`;
              botResponse += `   Pin: ${vehicle.batteryLevel || 0}%, Ghế: ${vehicle.seats || 'N/A'}\n`;
              botResponse += `   Tại: ${station?.name || 'N/A'}\n\n`;
            });
          } else {
            botResponse += `HIỆN TẠI KHÔNG CÓ XE SẴN SÀNG TẠI ${foundProvince}\n\n`;
            botResponse += `GỢI Ý: Thử tìm xe tại các tỉnh lân cận hoặc đặt trước!`;
          }
          
        } else {
          // Hiển thị tất cả tỉnh/thành có sẵn từ dữ liệu thực
          const provinces = [...new Set(stations.map(s => s.province))].filter(Boolean);
          const provinceStats = {};
          
          provinces.forEach(province => {
            const stationCount = stations.filter(s => s.province === province).length;
            const vehicleCount = vehicles.filter(v => {
              const station = stations.find(s => s.id === v.station?.id);
              return station?.province === province;
            }).length;
            provinceStats[province] = { stations: stationCount, vehicles: vehicleCount };
          });
          
          botResponse = `🌍 CÁC TỈNH/THÀNH CÓ XE FEV\n\n`;
          Object.entries(provinceStats)
            .sort(([,a], [,b]) => b.vehicles - a.vehicles)
            .forEach(([province, stats]) => {
              botResponse += `📍 ${province}: ${stats.vehicles} xe tại ${stats.stations} trạm\n`;
            });
            
          botResponse += `\n💬 VÍ DỤ CÂU HỎI\n`;
          botResponse += `• "Xe ở ${provinces[0]} có gì?"\n`;
          botResponse += `• "Trạm tại ${provinces[1]} như thế nào?"\n`;
          botResponse += `• "Xe ở ${provinces[2]} giá bao nhiêu?";`;
        }

      // Pin đầy/cao
      } else if (lowerMessage.includes('pin đầy') || lowerMessage.includes('pin cao') || lowerMessage.includes('pin 100')) {
        const fullBatteryVehicles = vehicles.filter(v => (v.batteryLevel || 0) >= 90 && v.status === 'AVAILABLE');
        
        botResponse = `XE PIN ĐẦY (≥90%) HIỆN CÓ\n\n`;
        botResponse += `Tổng cộng: ${fullBatteryVehicles.length} xe\n\n`;
        
        fullBatteryVehicles.slice(0, 6).forEach(vehicle => {
          const station = stations.find(s => s.id === vehicle.station?.id);
          botResponse += `• ${vehicle.description || vehicle.type} - Pin ${vehicle.batteryLevel}%\n`;
          botResponse += `   Giá: ${vehicle.pricePerHour?.toLocaleString() || 'N/A'}đ/giờ tại ${station?.name || 'N/A'}\n\n`;
        });
        
        if (fullBatteryVehicles.length === 0) {
          botResponse += `Hiện tại không có xe pin đầy. Xe pin cao nhất:\n`;
          const highestBattery = vehicles
            .filter(v => v.status === 'AVAILABLE')
            .sort((a, b) => (b.batteryLevel || 0) - (a.batteryLevel || 0))
            .slice(0, 3);
          
          highestBattery.forEach(vehicle => {
            botResponse += `• ${vehicle.description || vehicle.type} - Pin ${vehicle.batteryLevel || 0}%\n`;
          });
        }

      // Trạm xe  
      } else if (lowerMessage.includes('trạm') || lowerMessage.includes('địa điểm') || lowerMessage.includes('vị trí')) {
        const provinces = [...new Set(stations.map(s => s.province))].filter(Boolean);
        
        botResponse = `HỆ THỐNG TRẠM FEV\n\n` +
          `Tổng số trạm: ${stations.length} trạm\n\n` +
          `Phủ sóng: ${provinces.length} tỉnh/thành phố\n\n` +
          `Các tỉnh/thành có trạm:\n${provinces.slice(0, 8).join(', ')}\n\n` +
          `Trạm tiêu biểu:`;
        
        stations.slice(0, 4).forEach(station => {
          const vehicleCount = vehicles.filter(v => v.station?.id === station.id).length;
          botResponse += `\n• ${station.name} - ${station.province}`;
          botResponse += `\n  Địa chỉ: ${station.address}`;
          botResponse += `\n  Số xe: ${vehicleCount} xe\n`;
        });

        botResponse += `\nBạn có thể hỏi: "Trạm ở Hà Nội", "Trạm nào có nhiều xe nhất?";`
        
      // Trạm nhiều xe
      } else if (lowerMessage.includes('trạm nào') && (lowerMessage.includes('nhiều xe') || lowerMessage.includes('xe nhiều'))) {
        const stationVehicleCounts = stations.map(station => ({
          ...station,
          vehicleCount: vehicles.filter(v => v.station?.id === station.id).length,
          availableCount: vehicles.filter(v => v.station?.id === station.id && v.status === 'AVAILABLE').length
        })).sort((a, b) => b.vehicleCount - a.vehicleCount);

        botResponse = `TRẠM CÓ NHIỀU XE NHẤT\n\n`;
        stationVehicleCounts.slice(0, 5).forEach((station, index) => {
          botResponse += `${index + 1}. ${station.name} - ${station.province}\n`;
          botResponse += `   Tổng xe: ${station.vehicleCount}, Sẵn sàng: ${station.availableCount}\n`;
          botResponse += `   Địa chỉ: ${station.address}\n\n`;
        });

      // Đặt xe
      } else if (lowerMessage.includes('đặt xe') || lowerMessage.includes('booking') || lowerMessage.includes('thuê')) {
        botResponse = `HƯỚNG DẪN ĐẶT XE FEV\n\n` +
          `Bước 1: Chọn xe - Duyệt ${vehicleStats.total} xe điện đa dạng\n` +
          `Bước 2: Chọn trạm - ${stations.length} trạm trên toàn quốc\n` +
          `Bước 3: Chọn thời gian - Đặt trước hoặc thuê ngay\n` +
          `Bước 4: Xác thực - Upload GPLX và CCCD\n` +
          `Bước 5: Thanh toán - Online hoặc tại trạm\n` +
          `Bước 6: Nhận xe - Staff hỗ trợ giao xe\n\n` +
          `Yêu cầu: GPLX hạng B1 trở lên, từ 18 tuổi\n` +
          `Thời gian tối thiểu: 1 giờ\n` +
          `Đặt cọc: 20% giá trị đơn hàng\n\n` +
          `Mẹo: Đặt trước để có giá tốt hơn!\n\n` +
          `Bạn có thể hỏi: "Cần giấy tờ gì?", "Thanh toán như thế nào?";`

      // Giấy tờ cần thiết
      } else if (lowerMessage.includes('giấy tờ') || lowerMessage.includes('cần gì') || lowerMessage.includes('yêu cầu') || lowerMessage.includes('điều kiện')) {
        botResponse = `GIẤY Tờ VÀ ĐIỀU KIỆN THUÊ XE FEV\n\n` +
          `GIẤY Tờ BẮT BUỘC\n` +
          `• GPLX (Giấy phép lái xe) hạng B1 trở lên\n` +
          `• CCCD/CMND (Căn cước công dân)\n` +
          `• Cả 2 giấy tờ phải còn hiệu lực\n\n` +
          `ĐIỀU KIỆN\n` +
          `• Tuổi: Từ 18 tuổi trở lên\n` +
          `• Kinh nghiệm lái: Tối thiểu 1 năm\n` +
          `• Không trong tình trạng say rượu/bia\n` +
          `• Tài khoản không bị khóa/cảnh báo\n\n` +
          `UPLOAD ẢNH\n` +
          `• Ảnh rõ nét, đầy đủ 4 góc\n` +
          `• Không bị che mờ, nhòe\n` +
          `• Admin duyệt trong 2-24h\n\n` +
          `Lưu ý: Phải hoàn tất xác thực trước khi đặt xe!`;
          
      // Thanh toán  
      } else if (lowerMessage.includes('thanh toán') || lowerMessage.includes('trả tiền') || lowerMessage.includes('payment')) {
        botResponse = `PHƯƠNG THỨC THANH TOÁN FEV\n\n` +
          `ONLINE (Khuyên dùng)\n` +
          `• Thẻ ATM/Visa/MasterCard\n` +
          `• VNPay, MoMo, ZaloPay\n` +
          `• Internet Banking\n` +
          `• Được giảm 5% phí dịch vụ\n\n` +
          `TẠI TRẠM\n` +
          `• Tiền mặt\n` +
          `• Quẹt thẻ\n` +
          `• Chỉ áp dụng một số trạm\n\n` +
          `QUY TRÌNH\n` +
          `• Đặt cọc 20% khi booking\n` +
          `• Thanh toán 80% còn lại khi nhận xe\n` +
          `• Hoàn cọc 100% nếu hủy trước 2h\n\n` +
          `ƯU đãi: Thanh toán online được tích điểm thành viên!`;

      // Giá cả
      } else if (lowerMessage.includes('giá') || lowerMessage.includes('khuyến mãi') || lowerMessage.includes('chi phí')) {
        const minPrice = Math.min(...vehicles.map(v => v.pricePerHour || Infinity).filter(p => p !== Infinity));
        const maxPrice = Math.max(...vehicles.map(v => v.pricePerHour || 0));
        
        botResponse = `BẢNG GIÁ FEV (cập nhật real-time)\n\n` +
          `Khoảng giá: ${minPrice?.toLocaleString() || 'N/A'}đ - ${maxPrice?.toLocaleString() || 'N/A'}đ/giờ\n` +
          `Giá trung bình: ${vehicleStats.avgPrice.toLocaleString()}đ/giờ\n\n` +
          `KHUYẾN MÃI HIỆN TẠI\n` +
          `• Giảm 20% cho lần đầu với mã FEV20\n` +
          `• Thuê 5 ngày giảm 15%\n` +
          `• Sinh viên giảm 10% (có thẻ SV)\n` +
          `• Thành viên VIP giảm 8%\n\n` +
          `PHÍ DỊCH VỤ\n` +
          `• Online: Miễn phí\n` +
          `• Tại trạm: 5% tổng đơn hàng\n\n` +
          `XE GIÁ TỐT NHẤT HIỆN TẠI`;
          
        const cheapestVehicles = vehicles
          .filter(v => v.pricePerHour && v.status === 'AVAILABLE')
          .sort((a, b) => a.pricePerHour - b.pricePerHour)
          .slice(0, 3);
          
        cheapestVehicles.forEach(vehicle => {
          botResponse += `\n• ${vehicle.description || vehicle.type} - ${vehicle.pricePerHour.toLocaleString()}đ/giờ`;
        });
        
      // Pin/sạc
      } else if (lowerMessage.includes('pin') || lowerMessage.includes('sạc') || lowerMessage.includes('điện')) {
        const avgBattery = vehicles.length > 0 
          ? vehicles.reduce((sum, v) => sum + (v.batteryLevel || 0), 0) / vehicles.length 
          : 0;
        const lowBatteryCount = vehicles.filter(v => (v.batteryLevel || 0) < 30).length;
        
        botResponse = `THÔNG TIN PIN VÀ SẠC\n\n` +
          `Mức pin trung bình: ${Math.round(avgBattery)}%\n` +
          `Xe cần sạc: ${lowBatteryCount} xe (< 30%)\n` +
          `Trạm có sạc: Tất cả ${stations.length} trạm\n\n` +
          `THÔNG TIN SẠC\n` +
          `• Sạc nhanh: 10-80% trong 30 phút\n` +
          `• Sạc chậm: Đầy trong 2-3 giờ\n` +
          `• Ứng dụng theo dõi pin real-time\n` +
          `• Cảnh báo khi pin < 20%\n\n` +
          `CHÍNH SÁCH PIN\n` +
          `• Giao xe với pin ≥ 80%\n` +
          `• Trả xe với pin ≥ 20% (không phạt)\n` +
          `• Pin < 20% khi trả: phí 50.000đ\n\n` +
          `Mẹo tiết kiệm pin: Chế độ Eco, tốc độ ổn định, tắt điều hòa khi không cần`;

      // Bảo hiểm
      } else if (lowerMessage.includes('bảo hiểm') || lowerMessage.includes('tai nạn') || lowerMessage.includes('hỏng')) {
        botResponse = `CHÍNH SÁCH BẢO HIỂM FEV\n\n` +
          `BẢO HIỂM BẮT BUỘC\n` +
          `• Bảo hiểm trách nhiệm dân sự\n` +
          `• Bảo hiểm thân vỏ xe\n` +
          `• Bảo hiểm tai nạn cho người lái\n\n` +
          `QUYỀN LỢI\n` +
          `• Tai nạn: Hỗ trợ 100% chi phí y tế\n` +
          `• Hỏng xe: Miễn phí sửa chữa (lỗi kỹ thuật)\n` +
          `• Cứu hộ 24/7: Miễn phí trong 50km\n\n` +
          `KHÁCH HÀNG CHỊU TRÁCH NHIỆM\n` +
          `• Vi phạm giao thông\n` +
          `• Lái xe sau khi uống rượu/bia\n` +
          `• Hỏng do sử dụng không đúng cách\n` +
          `• Mất trộm do không khóa xe\n\n` +
          `Hotline cứu hộ: 1900 123 456 (24/7)`;

      // Thống kê
      } else if (lowerMessage.includes('thống kê') || lowerMessage.includes('số liệu') || lowerMessage.includes('báo cáo')) {
        const maintenanceCount = vehicles.filter(v => v.status === 'MAINTENANCE').length;
        const rentedCount = vehicles.filter(v => v.status === 'RENTED').length;
        const reservedCount = vehicles.filter(v => v.status === 'RESERVED').length;
        
        botResponse = `THỐNG KÊ HỆ THỐNG FEV\n\n` +
          `ĐỘI XE\n` +
          `• Tổng: ${vehicleStats.total} xe\n` +
          `• Sẵn sàng: ${vehicleStats.available} xe (${Math.round(vehicleStats.available/vehicleStats.total*100)}%)\n` +
          `• Đang thuê: ${rentedCount} xe\n` +
          `• Đã đặt: ${reservedCount} xe\n` +
          `• Bảo trì: ${maintenanceCount} xe\n\n` +
          `Mạng lưới: ${stations.length} trạm\n` +
          `Giá trung bình: ${vehicleStats.avgPrice.toLocaleString()}đ/giờ\n\n` +
          `TOP tỉnh có nhiều trạm:`;
          
        const provinceStats = {};
        stations.forEach(station => {
          provinceStats[station.province] = (provinceStats[station.province] || 0) + 1;
        });
        
        Object.entries(provinceStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .forEach(([province, count], index) => {
            botResponse += `\n${index + 1}. ${province}: ${count} trạm`;
          });
          
          botResponse += `\n\nXu hướng: Xe điện ngày càng phổ biến!`;      // Liên hệ/hỗ trợ
      } else if (lowerMessage.includes('liên hệ') || lowerMessage.includes('hỗ trợ') || lowerMessage.includes('hotline')) {
        botResponse = `THÔNG TIN LIÊNN HỆ FEV\n\n` +
          `HOTLINE CHĂM SÓC KHÁCH HÀNG\n` +
          `• 1900 123 456 (24/7)\n` +
          `• Miễn cước từ Viettel, Vinaphone\n\n` +
          `EMAIL HỖ TRỢ\n` +
          `• support@fev.vn (Hỗ trợ chung)\n` +
          `• booking@fev.vn (Đặt xe)\n` +
          `• feedback@fev.vn (Góp ý)\n\n` +
          `MẠNG XÃ HỘI\n` +
          `• Facebook: fb.com/FEVVietnam\n` +
          `• Zalo OA: FEV Official\n\n` +
          `VĂN PHÒNG CHÍNH\n` +
          `• Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM\n` +
          `• Giờ làm việc: 8:00 - 18:00 (T2-T7)`;
          
      // Default response - thông minh hơn
      } else {
        const keywords = lowerMessage.split(' ').filter(word => word.length > 2);
        let suggestedQuestions = [
          '"Xe nào rẻ nhất?"',
          '"Trạm ở Hà Nội có gì?"',
          '"Cần giấy tờ gì để thuê xe?"',
          '"Thanh toán như thế nào?"',
          '"Xe pin đầy có không?"'
        ];

        // Gợi ý thông minh dựa trên từ khóa
        if (keywords.some(k => ['giá', 'tiền', 'rẻ', 'đắt'].includes(k))) {
          suggestedQuestions = ['"Xe nào rẻ nhất?"', '"Bảng giá như thế nào?"', '"Có khuyến mãi gì không?"'];
        } else if (keywords.some(k => ['địa', 'chỗ', 'đâu', 'nơi'].includes(k))) {
          suggestedQuestions = ['"Trạm ở Hà Nội"', '"Trạm nào có nhiều xe?"', '"Vị trí các trạm"'];
        }
        
        botResponse = `TÔI CÓ THỂ GIÚP BẠN\n\n` +
          `Tìm hiểu: ${vehicleStats.total} xe điện hiện có\n` +
          `Xem trạm: ${stations.length} trạm trên toàn quốc\n` +
          `Thông tin giá: từ ${vehicleStats.avgPrice?.toLocaleString() || 'N/A'}đ/giờ\n` +
          `Hướng dẫn: đặt xe chi tiết\n` +
          `Thống kê: hệ thống real-time\n\n` +
          `GỢI Ý CÂU HỎI: ${suggestedQuestions.join(', ')}\n\n` +
          `Hãy hỏi tôi bất cứ điều gì về FEV!`;
      }

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        text: inputValue,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
      
      // Simulate bot response
      simulateBotResponse(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-page">
      <Header onOpenLogin={handleOpenLogin} />
      
      <div className="chatbot-container">
        {/* Sidebar */}
        <div className="chatbot-sidebar">
          <div className="chat-history-header">
            <h3>Trò chuyện</h3>
          </div>
          <div className="chat-history-item active">
            <div className="chat-avatar">
              <div className="bot-icon">
                <i className="fas fa-robot"></i>
              </div>
            </div>
            <div className="chat-info">
              <div className="chat-title">BTSTQ</div>
              <div className="chat-preview">
                {isLoadingData 
                  ? 'Đang tải dữ liệu hệ thống...' 
                  : `Đã tải ${chatData.vehicles.length} xe, ${chatData.stations.length} trạm`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chatbot-main">
          <div className="chatbot-header">
            <div className="bot-info">
              <div className="bot-avatar">
                <div className="bot-icon">
                  <i className="fas fa-robot"></i>
                </div>
              </div>
              <div className="bot-details">
                <h2>BTSTQ</h2>
                <span className="bot-status">
                  {isLoadingData ? 'Đang tải dữ liệu...' : 'Trợ lý AI của FEV'}
                </span>
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                {message.type === 'bot' && (
                  <div className="message-avatar">
                    <div className="bot-icon">
                      <i className="fas fa-robot"></i>
                    </div>
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">
                    {message.text.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                  {message.suggestions && (
                    <div className="message-suggestions">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="suggestion-btn"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <span className="suggestion-icon">
                            <i className="fas fa-comment-dots"></i>
                          </span>
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                {message.type === 'user' && (
                  <div className="message-avatar user-avatar">
                    <div className="user-icon">
                      <i className="fas fa-user"></i>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-avatar">
                  <div className="bot-icon">
                    <i className="fas fa-robot"></i>
                  </div>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="typing-text">BTSTQ đang trả lời...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn hoặc bạn cũng có thể chọn 1 trong những câu hỏi được gợi ý bên dưới."
                className="chat-input"
                rows="1"
              />
              <button
                onClick={handleSendMessage}
                className="send-button"
                disabled={!inputValue.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;