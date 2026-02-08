import React from 'react';

const ProductCard = ({ name, price, category, image, onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}
        >
            <div style={{
                height: '100px',
                borderRadius: '8px',
                backgroundImage: image || 'linear-gradient(135deg, #eee, #eee)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginBottom: '0.5rem'
            }} />
            <h4 style={{ margin: 0 }}>{name}</h4>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{category}</p>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#FF4757' }}>₹{price}</p>
        </div>
    );
};

export default ProductCard;
