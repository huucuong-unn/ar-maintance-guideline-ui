import React from 'react';
import ReactDOM from 'react-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const courses = Array.from({ length: 10 }, (_, index) => ({
    id: index,
    title: `Course ${index + 1}`,
    image: `https://via.placeholder.com/150?text=Course+${index + 1}`,
}));

const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    rtl: false,
};

const CardSlider = () => (
    <Slider {...settings}>
        {courses.map((course) => (
            <div key={course.id} style={{ padding: '10px' }}>
                <div style={{ border: '1px solid #ccc', padding: '20px', textAlign: 'center' }}>
                    <img src={course.image} alt={course.title} style={{ width: '100%', height: 'auto' }} />
                    <h3>{course.title}</h3>
                </div>
            </div>
        ))}
    </Slider>
);

export default CardSlider;
