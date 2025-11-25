import React, { useState } from 'react';
import '../styles/components/payment-modal.css';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  bookingData, 
  onPaymentSuccess, 
  onPaymentError,
  showPaymentModal,
  setShowPaymentModal,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  handleAdvancePayment,
  rentalDetails
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'processing', 'success', 'error'
  const [localPaymentMethod, setLocalPaymentMethod] = useState('');
  const [progressValue, setProgressValue] = useState(0);

  if (!isOpen && !showPaymentModal) return null;

  // Use props or local state for payment method
  const currentPaymentMethod = selectedPaymentMethod || localPaymentMethod;
  const updatePaymentMethod = setSelectedPaymentMethod || setLocalPaymentMethod;

  const totalAmount = bookingData?.totalPrice || rentalDetails?.totalPrice || 0;
  const depositAmount = Math.round(totalAmount * 0.2); // Cọc 20%
  const remainingAmount = totalAmount - depositAmount; // Số tiền còn lại

  const handleClose = () => {
    if (!isProcessing) {
      if (onClose) onClose();
      if (setShowPaymentModal) setShowPaymentModal(false);
    }
  };

  const handlePaymentMethodSelect = (methodId) => {
    updatePaymentMethod(methodId);
  };

  const handleProceedPayment = async (method) => {
    if (handleAdvancePayment) {
      return handleAdvancePayment(method);
    }
    
    if (!currentPaymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');
    setProgressValue(0);

    try {
      // Simulate progress animation
      const progressInterval = setInterval(() => {
        setProgressValue(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            // When progress is complete, show success after a short delay
            setTimeout(() => {
              setPaymentStep('success');
            }, 500);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      // Lấy userId từ localStorage
      const userProfile = localStorage.getItem('userProfile');
      const user = userProfile ? JSON.parse(userProfile) : null;
      
      if (!user || !user.id) {
        throw new Error('Không tìm thấy thông tin user');
      }

      // Gọi API payment
      const paymentRequest = {
        userId: user.id,
        bookingId: null, // Booking chưa được tạo
        amount: depositAmount,
        type: 'DEPOSIT',
        paymentMethod: currentPaymentMethod.toUpperCase()
      };

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(paymentRequest)
      });

      if (response.ok) {
        const result = await response.json();
        // Just wait for the progress animation to complete naturally
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Payment failed' }));
        throw new Error(errorData.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStep('error');
      setTimeout(() => {
        onPaymentError(error.message);
        setIsProcessing(false);
        setPaymentStep('select');
        setProgressValue(0);
      }, 3000);
    }
  };

  return (
    <>
      {(showPaymentModal || isOpen) && (
        <div className="modal-overlay" onClick={!isProcessing ? handleClose : undefined}>
          <div className="car-detail-payment-modal" onClick={e => e.stopPropagation()}>
            {paymentStep === 'processing' ? (
              <div className="payment-processing-container">
                <div className="processing-content">
                  <div className="spinner-container">
                    <div className="payment-spinner"></div>
                  </div>
                  <h3 className="processing-title">Đang xử lý thanh toán...</h3>
                  <p className="processing-message">Vui lòng không thoát để hoàn tất thanh toán</p>
                  <div className="processing-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progressValue}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {progressValue < 50 ? 'Đang kết nối với cổng thanh toán...' : 
                       progressValue < 80 ? 'Đang xử lý giao dịch...' : 
                       'Đang hoàn tất thanh toán...'}
                    </span>
                  </div>
                </div>
              </div>
            ) : paymentStep === 'success' ? (
              <div className="payment-success-container">
                <div className="success-content">
                  <div className="success-icon">
                    <iconify-icon icon="material-symbols:check-circle" className="payment-success-checkmark"></iconify-icon>
                  </div>
                  <h3 className="success-title">Thanh toán thành công!</h3>
                  <p className="success-message">Cảm ơn bạn đã thanh toán. Đặt xe của bạn đã được xác nhận.</p>
                  <div className="success-details">
                    <div className="success-amount">
                      <span>Số tiền đã thanh toán:</span>
                      <span className="amount">{depositAmount.toLocaleString()}đ</span>
                    </div>
                  </div>
                  <div className="success-actions">
                    <button className="success-btn" onClick={() => {
                      setPaymentStep('select');
                      setIsProcessing(false);
                      setProgressValue(0);
                      if (onPaymentSuccess) onPaymentSuccess({ amount: depositAmount });
                      handleClose();
                    }}>
                      Hoàn tất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h3>Chọn phương thức thanh toán cọc</h3>
                  <button className="modal-close" onClick={handleClose}>
                    <iconify-icon icon="material-symbols:close"></iconify-icon>
                  </button>
                </div>
                
                <div className="car-detail-deposit-info">
                  <div className="car-detail-deposit-amount">
                    <span>Số tiền cọc:</span>
                    <span className="amount">{depositAmount.toLocaleString()}đ</span>
                  </div>
                  <div className="car-detail-remaining-amount">
                    <span>Số tiền còn lại:</span>
                    <span className="remaining">{remainingAmount.toLocaleString()}đ</span>
                  </div>
                  <div className="car-detail-deposit-note">
                    <iconify-icon icon="material-symbols:info"></iconify-icon>
                    <span>Thanh toán cọc 20% để xác nhận đặt xe. Số tiền còn lại sẽ thanh toán khi nhận xe.</span>
                  </div>
                </div>
                
                <div className="car-detail-payment-methods">
                  <label className="car-detail-payment-method" htmlFor="momo">
                    <input 
                      id="momo"
                      type="radio" 
                      name="payment" 
                      value="momo" 
                      checked={currentPaymentMethod === 'momo'}
                      onChange={() => handlePaymentMethodSelect('momo')}
                    />
                    <div className="car-detail-payment-info">
                      <img src="/assets/images/payment/momo.png" alt="MoMo" className="car-detail-payment-logo" />
                      <div className="car-detail-payment-details">
                        <div className="car-detail-payment-name">Ví MoMo</div>
                        <div className="car-detail-payment-desc">Thanh toán nhanh chóng với ví điện tử MoMo</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="car-detail-payment-method" htmlFor="zalopay">
                    <input 
                      id="zalopay"
                      type="radio" 
                      name="payment" 
                      value="zalopay" 
                      checked={currentPaymentMethod === 'zalopay'}
                      onChange={() => handlePaymentMethodSelect('zalopay')}
                    />
                    <div className="car-detail-payment-info">
                      <img src="/assets/images/payment/ZaloPay.png" alt="ZaloPay" className="car-detail-payment-logo" />
                      <div className="car-detail-payment-details">
                        <div className="car-detail-payment-name">ZaloPay</div>
                        <div className="car-detail-payment-desc">Thanh toán tiện lợi với ZaloPay</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="car-detail-payment-method" htmlFor="vnpay">
                    <input 
                      id="vnpay"
                      type="radio" 
                      name="payment" 
                      value="vnpay" 
                      checked={currentPaymentMethod === 'vnpay'}
                      onChange={() => handlePaymentMethodSelect('vnpay')}
                    />
                    <div className="car-detail-payment-info">
                      <img src="/assets/images/payment/vnpay.780689d6.png" alt="VNPay" className="car-detail-payment-logo" />
                      <div className="car-detail-payment-details">
                        <div className="car-detail-payment-name">VNPay</div>
                        <div className="car-detail-payment-desc">Thanh toán qua cổng thanh toán VNPay</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="car-detail-payment-method" htmlFor="alepay">
                    <input 
                      id="alepay"
                      type="radio" 
                      name="payment" 
                      value="alepay" 
                      checked={currentPaymentMethod === 'alepay'}
                      onChange={() => handlePaymentMethodSelect('alepay')}
                    />
                    <div className="car-detail-payment-info">
                      <img src="/assets/images/payment/ApplePay.png" alt="ApplePay" className="car-detail-payment-logo" />
                      <div className="car-detail-payment-details">
                        <div className="car-detail-payment-name">ApplePay</div>
                        <div className="car-detail-payment-desc">Thanh toán đa dạng với ApplePay</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="car-detail-payment-method" htmlFor="visa">
                    <input 
                      id="visa"
                      type="radio" 
                      name="payment" 
                      value="visa" 
                      checked={currentPaymentMethod === 'visa'}
                      onChange={() => handlePaymentMethodSelect('visa')}
                    />
                    <div className="car-detail-payment-info">
                      <img src="/assets/images/payment/Visa.png" alt="Visa" className="car-detail-payment-logo" />
                      <div className="car-detail-payment-details">
                        <div className="car-detail-payment-name">Thẻ Visa</div>
                        <div className="car-detail-payment-desc">Thanh toán bằng thẻ tín dụng quốc tế</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="car-detail-payment-method" htmlFor="vtmoney">
                    <input 
                      id="vtmoney"
                      type="radio" 
                      name="payment" 
                      value="vtmoney" 
                      checked={currentPaymentMethod === 'vtmoney'}
                      onChange={() => handlePaymentMethodSelect('vtmoney')}
                    />
                    <div className="car-detail-payment-info">
                      <img src="/assets/images/payment/ViettelMoney.png" alt="VT Money" className="car-detail-payment-logo" />
                      <div className="car-detail-payment-details">
                        <div className="car-detail-payment-name">Viettel Money</div>
                        <div className="car-detail-payment-desc">Thanh toán với ví điện tử Viettel Money</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="car-detail-payment-method" htmlFor="bank">
                    <input 
                      id="bank"
                      type="radio" 
                      name="payment" 
                      value="bank" 
                      checked={currentPaymentMethod === 'bank'}
                      onChange={() => handlePaymentMethodSelect('bank')}
                    />
                    <div className="car-detail-payment-info">
                      <iconify-icon icon="material-symbols:account-balance" className="car-detail-payment-icon"></iconify-icon>
                      <div className="car-detail-payment-details">
                        <div className="car-detail-payment-name">Chuyển khoản ngân hàng</div>
                        <div className="car-detail-payment-desc">Chuyển khoản trực tiếp qua ngân hàng</div>
                      </div>
                    </div>
                  </label>
                </div>
                
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={handleClose}>
                    Hủy
                  </button>
                  <button 
                    className="pay-btn" 
                    onClick={() => handleProceedPayment(currentPaymentMethod)}
                    disabled={!currentPaymentMethod}
                  >
                    Thanh toán cọc
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentModal;