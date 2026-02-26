import dosaiImg from '../assets/dosai.jpg';
import pooriImg from '../assets/poori.jpg';
import venPongalImg from '../assets/venpongal.jpg';
import watermelonImg from '../assets/watermelon_juice.jpg';
import idlyImg from '../assets/idly.jpg';
import roastImg from '../assets/roast.jpg';
import parottaImg from '../assets/parotta.jpg';
import chapathiImg from '../assets/chapathi.jpg';
import varietyRiceImg from '../assets/variety_rice.jpg';
import mealsImg from '../assets/meals.jpg';
import kothuParottaImg from '../assets/kothu_parotta.jpg';

export const MOCK_MENU = [
    { id: 1, name: 'Dosai', price: 60, category: 'Breakfast', color: '#FF5733', image: `url(${dosaiImg})`, stock: 10 },
    { id: 2, name: 'Poori', price: 60, category: 'Breakfast', color: '#33FF57', image: `url(${pooriImg})`, stock: 10 },
    { id: 3, name: 'Ven Pongal', price: 50, category: 'Breakfast', color: '#3357FF', image: `url(${venPongalImg})`, stock: 10 },
    { id: 4, name: 'Watermelon juice', price: 30, category: 'Drinks', color: '#FF33A6', image: `url(${watermelonImg})`, stock: 10 },
    { id: 5, name: 'Idly', price: 30, category: 'Breakfast', color: '#FF5733', image: `url(${idlyImg})`, stock: 10 },
    { id: 6, name: 'Roast', price: 40, category: 'Breakfast', color: '#FF5733', image: `url(${roastImg})`, stock: 10 },
    { id: 7, name: 'Parotta', price: 30, category: 'Lunch', color: '#FFB86B', image: `url(${parottaImg})`, stock: 10 },
    { id: 8, name: 'Chappathi', price: 30, category: 'Lunch', color: '#A29BFE', image: `url(${chapathiImg})`, stock: 10 },
    { id: 9, name: 'Variety Rice', price: 30, category: 'Lunch', color: '#55E6C1', image: `url(${varietyRiceImg})`, stock: 10 },
    { id: 10, name: 'Meals', price: 60, category: 'Lunch', color: '#FF6B81', image: `url(${mealsImg})`, stock: 10 },
    { id: 11, name: 'Kothu parotta', price: 50, category: 'Lunch', color: '#FF9F43', image: `url(${kothuParottaImg})`, stock: 10 },
];

export default MOCK_MENU;
