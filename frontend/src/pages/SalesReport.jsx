import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, DollarSign, ShoppingBag, Calendar } from 'lucide-react';

const SalesReport = () => {
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/merchant/sales-report');
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Generating report...</div>;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Outfit, sans-serif' }}>
            <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer', marginBottom: '30px' }}>
                <ArrowLeft size={20} /> Back
            </button>

            <div className="glass" style={{ padding: '50px', borderRadius: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                    <div style={{ padding: '12px', background: '#FF4757', borderRadius: '15px', color: 'white' }}>
                        <TrendingUp size={30} />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>Daily Sales Report</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div className="glass" style={{ padding: '25px', borderRadius: '25px', textAlign: 'center' }}>
                        <div style={{ background: 'rgba(46, 204, 113, 0.1)', color: '#2ECC71', padding: '10px', borderRadius: '50%', width: '45px', height: '45px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={24} />
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.8rem' }}>TOTAL REVENUE</p>
                        <h3 style={{ margin: '5px 0', fontSize: '1.8rem', fontWeight: '900' }}>₹{report.total_revenue.toFixed(2)}</h3>
                    </div>
                    <div className="glass" style={{ padding: '25px', borderRadius: '25px', textAlign: 'center' }}>
                        <div style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498DB', padding: '10px', borderRadius: '50%', width: '45px', height: '45px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag size={24} />
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.8rem' }}>TOTAL ORDERS</p>
                        <h3 style={{ margin: '5px 0', fontSize: '1.8rem', fontWeight: '900' }}>{report.total_orders}</h3>
                    </div>
                    <div className="glass" style={{ padding: '25px', borderRadius: '25px', textAlign: 'center' }}>
                        <div style={{ background: 'rgba(155, 89, 182, 0.1)', color: '#9B59B6', padding: '10px', borderRadius: '50%', width: '45px', height: '45px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={24} />
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.8rem' }}>TOTAL GST</p>
                        <h3 style={{ margin: '5px 0', fontSize: '1.8rem', fontWeight: '900' }}>₹{report.total_gst.toFixed(2)}</h3>
                    </div>
                </div>

                <div>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' }}>Item Sales Performance</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {Object.entries(report.item_sales).map(([name, count]) => (
                            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', background: 'rgba(0,0,0,0.02)', borderRadius: '15px' }}>
                                <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{name}</span>
                                <span style={{ fontWeight: '900', color: '#FF4757' }}>{count} Sold</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesReport;
