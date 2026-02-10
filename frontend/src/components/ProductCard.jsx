import React from 'react';
import styles from './ProductCard.module.css';

const ProductCard = ({ name, price, category, image, onClick }) => {
    return (
        <div className={styles.card} onClick={onClick}>
            <div
                className={styles.image}
                style={{ backgroundImage: image || 'linear-gradient(135deg, #eee, #eee)' }}
            />
            <div className={styles.details}>
                <p className={styles.category}>{category}</p>
                <h4 className={styles.name}>{name}</h4>
            </div>
            <div className={styles.footer}>
                <p className={styles.price}>₹{price}</p>
                <div className={styles.addButton}>+</div>
            </div>
        </div>
    );
};

export default ProductCard;
