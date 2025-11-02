import React from 'react';

const StepItem = ({ stepNumber, image, title, alt }) => {
  return (
    <div className="step-item">
      <img 
        src={image}
        alt={alt}
        className="step-image"
        width="276"
        height="270"
        loading="lazy"
      />
      <p className="step-number" aria-hidden="true">{stepNumber}</p>
      <p className="step-title">{title}</p>
    </div>
  );
};

const HowToRent = () => {
  const steps = [
    {
      stepNumber: "01",
      image: "/assets/images/steps/Gemini_Generated_Image_nygbsgnygbsgnygb-removebg-preview.png",
      alt: "Đặt xe qua web FEV",
      title: "Đặt xe qua web FEV"
    },
    {
      stepNumber: "02", 
      image: "/assets/images/steps/Gemini_Generated_Image_g9kgrrg9kgrrg9kg-removebg-preview.png",
      alt: "Nhận xe",
      title: "Nhận xe"
    },
    {
      stepNumber: "03",
      image: "/assets/images/steps/Gemini_Generated_Image_9t8gr39t8gr39t8g-removebg-preview.png",
      alt: "Bắt đầu hành trình",
      title: "Bắt đầu hành trình"
    },
    {
      stepNumber: "04",
      image: "/assets/images/steps/Gemini_Generated_Image_3192r33192r33192-removebg-preview.png",
      alt: "Trả xe & kết thúc chuyến đi",
      title: "Trả xe & kết thúc chuyến đi"
    }
  ];

  return (
    <section className="how-to-rent-section" aria-labelledby="how-to-rent-title">
      <div className="section-header">
        <h2 id="how-to-rent-title">Hướng Dẫn Thuê Xe</h2>
        <p>Chỉ với 4 bước đơn giản bạn đã có thể trải nghiệm thuê xe trên FEV một cách nhanh chóng.</p>
      </div>

      <div className="steps-grid">
        {steps.map((step, index) => (
          <StepItem 
            key={index}
            stepNumber={step.stepNumber}
            image={step.image}
            alt={step.alt}
            title={step.title}
          />
        ))}
      </div>
    </section>
  );
};

export default HowToRent;