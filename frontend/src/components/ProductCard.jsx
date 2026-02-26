import React from 'react';
import { Trash2, Ban, CheckCircle } from 'lucide-react';
import styles from './ProductCard.module.css';

const ProductCard = ({ name, price, category, image, available = true, stockCount = 100, onClick, onDelete, onToggleAvailability }) => {
    return (
        <div className={`${styles.card} ${!available ? styles.unavailable : ''}`} onClick={available ? onClick : undefined}>
            {onDelete && (
                <button
                    className={styles.deleteBtn}
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    title="Delete Item"
                >
                    <Trash2 size={16} />
                </button>
            )}
            {onToggleAvailability && (
                <button
                    className={styles.availabilityBtn}
                    onClick={(e) => { e.stopPropagation(); onToggleAvailability(); }}
                    title={available ? "Mark Unavailable" : "Mark Available"}
                >
                    {available ? <Ban size={16} /> : <CheckCircle size={16} />}
                </button>
            )}
            <div
                className={styles.image}
                style={{ backgroundImage: image || 'linear-gradient(135deg, #eee, #ddd)' }}
            />
            <div className={styles.details}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className={styles.category}>{category}</p>
                    {(!available || stockCount === 0) ? (
                        <span className={styles.outOfStock}>OUT OF STOCK</span>
                    ) : stockCount < 5 && (
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', backgroundColor: '#FFF2F2', color: '#FF4757', padding: '4px 8px', borderRadius: '6px' }}>LOW STOCK</span>
                    )}
                </div>
                <h4 className={styles.name}>{name}</h4>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Stock: {stockCount}</p>
            </div>
            <div className={styles.footer}>
                <p className={styles.price}>₹{price}</p>
            </div>
        </div>
    );
};

export default ProductCard;
