import { useState, useEffect } from 'react';
import axios from 'axios';

//STYLES
const styles = {
  container: { padding: '20px', fontFamily: 'Arial', maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
  header: { gridColumn: '1 / -1', borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '20px' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  authBox: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' },
  section: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fff', marginBottom: '20px' },
  card: { border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  button: { padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', border: 'none', color: 'white', fontWeight: 'bold' },
  btnBlue: { backgroundColor: '#007bff' },
  btnRed: { backgroundColor: '#dc3545' },
  btnGreen: { backgroundColor: '#28a745' },
  btnOrange: { backgroundColor: '#fd7e14' },
  input: { padding: '8px', marginRight: '5px', borderRadius: '4px', border: '1px solid #ccc' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' },
  status: { fontWeight: 'bold' },
  adminPanel: { backgroundColor: '#fff3cd', border: '1px solid #ffeeba', padding: '15px', borderRadius: '8px', marginBottom: '20px', gridColumn: '1 / -1' },
  link: { color: '#007bff', textDecoration: 'underline', cursor: 'pointer', marginLeft: '10px' },
  badge: { padding: '3px 8px', borderRadius: '10px', fontSize: '12px', color: 'white' }
};

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regData, setRegData] = useState({ name: '', email: '', password: '' });
  
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const log = (msg, type = 'neutral') => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p]);

  const fetchData = async () => {
    try {
      const prodRes = await axios.get('http://localhost:3000/api/v1/products');
      setProducts(prodRes.data.data.products);
      if (email) {
        try {
          const orderRes = await axios.get(`http://localhost:3000/api/v1/orders?email=${email}`);
          setOrders(orderRes.data.data.orders);
        } catch (e) {  }
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [email]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/v1/users/signup', regData);
      setEmail(res.data.data.user.email);
      log(`Welcome ${res.data.data.user.name}!`, 'success');
      setIsRegistering(false);
      fetchData();
    } catch (err) { log(`Error: ${err.response?.data?.message}`, 'error'); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/v1/products', newProduct);
      log(`Added Product: ${newProduct.name}`, 'success');
      setNewProduct({ name: '', price: '', stock: '' });
      fetchData();
    } catch (err) { log('Failed to add product', 'error'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/v1/products/${id}`);
      log('Product deleted', 'success');
      fetchData();
    } catch (err) { log('Failed to delete', 'error'); }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      setCart(cart.map(item => item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { productId: product._id, name: product.name, price: product.price, quantity: 1 }]);
    }
  };

  const handleCheckout = async () => {
    if (!email) return alert('Login first!');
    if (cart.length === 0) return alert('Cart empty!');
    setIsProcessing(true);
    try {
      await axios.post('http://localhost:3000/api/v1/orders', { email, cartItems: cart.map(i => ({ productId: i.productId, quantity: i.quantity })) });
      log('Order Placed! Status: PENDING', 'success');
      setCart([]);
      fetchData();
    } catch (err) { log(`Checkout Failed: ${err.response?.data?.message}`, 'error'); } 
    finally { setIsProcessing(false); }
  };

  //PAYMENT ---
  const handlePayment = async (orderId) => {
    setIsProcessing(true);
    log('Processing Payment...', 'neutral');
    try {
      await axios.post('http://localhost:3000/api/v1/orders/pay', { orderId });
      log('Payment Successful! Order CONFIRMED.', 'success');
      fetchData(); 
    } catch (err) {
      log(`Payment Failed: ${err.response?.data?.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if(!confirm('Cancel order & refund?')) return;
    try {
      await axios.post(`http://localhost:3000/api/v1/orders/${orderId}/refund`);
      log(`Order Cancelled. Stock restored.`, 'success');
      fetchData();
    } catch (err) { log(`Cancel Failed`, 'error'); }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1>E-Commerce Demo</h1>
          <button onClick={() => setIsAdmin(!isAdmin)} style={{...styles.button, backgroundColor: isAdmin ? '#6c757d' : '#fd7e14'}}>
            {isAdmin ? 'Exit Admin' : 'Admin Panel'}
          </button>
        </div>
        <div style={styles.authBox}>
          {!isRegistering ? (
            <div style={{display: 'flex', alignItems: 'center'}}>
              <label style={{marginRight: '10px'}}><strong>Your Email:</strong></label>
              <input style={{...styles.input, width: '250px'}} value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. alice@test.com" />
              <button style={{...styles.button, ...styles.btnBlue}} onClick={fetchData}>Login</button>
              <span style={styles.link} onClick={() => setIsRegistering(true)}>New User? Register</span>
            </div>
          ) : (
            <form onSubmit={handleRegister} style={{display: 'flex', gap: '10px', alignItems: 'flex-end'}}>
              <input style={styles.input} value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} placeholder="Name" />
              <input style={styles.input} value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} placeholder="Email" />
              <input type="password" style={styles.input} value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} placeholder="Pass" />
              <button type="submit" style={{...styles.button, ...styles.btnGreen}}>Register</button>
              <span style={styles.link} onClick={() => setIsRegistering(false)}>Cancel</span>
            </form>
          )}
        </div>
      </div>

      {/* ADMIN */}
      {isAdmin && (
        <div style={styles.adminPanel}>
          <h3>Add Inventory</h3>
          <form onSubmit={handleAddProduct} style={{display: 'flex', gap: '10px', alignItems: 'flex-end'}}>
            <input style={styles.input} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Product Name" />
            <input type="number" style={{...styles.input, width: '80px'}} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="Price" />
            <input type="number" style={{...styles.input, width: '80px'}} value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} placeholder="Stock" />
            <button type="submit" style={{...styles.button, ...styles.btnGreen}}>Add</button>
          </form>
        </div>
      )}

      {/* PRODUCTS */}
      <div style={styles.section}>
        <h3>Products</h3>
        {products.map(p => (
          <div key={p._id} style={styles.card}>
            <div>
              <strong>{p.name}</strong> (${p.price})<br/>
              <span style={{color: p.stock < 3 ? 'red' : 'green', fontWeight: 'bold'}}>{p.stock} in stock</span>
            </div>
            <div style={{display:'flex', gap:'5px'}}>
              <button disabled={p.stock === 0} onClick={() => addToCart(p)} style={{...styles.button, ...styles.btnBlue, opacity: p.stock === 0 ? 0.5 : 1}}>
                {p.stock === 0 ? 'Out of Stock' : '+ Add'}
              </button>
              {isAdmin && <button onClick={() => handleDeleteProduct(p._id)} style={{...styles.button, ...styles.btnRed}}>X</button>}
            </div>
          </div>
        ))}
      </div>

      {/* CART & ORDERS */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        
        {/* CART */}
        <div style={styles.section}>
          <h3>Cart</h3>
          {cart.length === 0 ? <p style={{color: '#999'}}>Empty</p> : (
            <>
              {cart.map(i => <div key={i.productId} style={{borderBottom:'1px solid #eee', padding:'5px', fontSize:'14px'}}>{i.name} x {i.quantity} <b>${i.price*i.quantity}</b></div>)}
              <div style={{marginTop:'10px', display:'flex', gap:'5px'}}>
                <button onClick={handleCheckout} disabled={isProcessing} style={{...styles.button, ...styles.btnGreen, flex: 1}}>{isProcessing ? 'Processing...' : 'Checkout (Create Order)'}</button>
                <button onClick={() => setCart([])} style={{...styles.button, ...styles.btnRed}}>Clear</button>
              </div>
            </>
          )}
        </div>

        {/* ORDER  */}
        <div style={styles.section}>
          <h3>Your Orders</h3>
          {!email ? <p style={{color:'#999'}}>Login to view orders</p> : orders.length===0 ? <p>No orders yet.</p> : orders.map(o => (
            <div key={o._id} style={{...styles.card, background:'#f9f9f9', flexDirection:'column', alignItems:'flex-start'}}>
              <div style={{width:'100%', display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                <span style={{fontSize:'0.8em', color: '#666'}}>#{o._id.slice(-4)}</span>
                <span style={{
                  ...styles.badge, 
                  backgroundColor: o.status === 'REFUNDED' ? 'orange' : o.status === 'CONFIRMED' ? 'green' : '#6c757d'
                }}>
                  {o.status}
                </span>
              </div>
              <div style={{fontWeight:'bold', marginBottom:'10px'}}>${o.totalAmount}</div>
              
              <div style={{width: '100%', display: 'flex', gap: '5px'}}>
                
                {/* 1. PAYMENT   */}
                {o.status === 'PENDING' && (
                  <button 
                    onClick={() => handlePayment(o._id)} 
                    style={{...styles.button, ...styles.btnGreen, fontSize:'12px', flex: 1}}
                    disabled={isProcessing}
                  >
                    Pay Now
                  </button>
                )}

                {/* 2. REFUNC/CANCEL */}
                {o.status !== 'REFUNDED' && (
                  <button 
                    onClick={() => handleCancelOrder(o._id)} 
                    style={{...styles.button, ...styles.btnRed, fontSize:'12px', flex: 1}}
                    disabled={isProcessing}
                  >
                    {o.status === 'PENDING' ? 'Cancel' : 'Refund'}
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* SHOWING HISTORY LOGS*/}
        <div style={{...styles.section, height:'150px', overflowY:'auto', background:'#333', color:'#0f0', fontFamily:'monospace', fontSize:'11px'}}>
          {logs.map((l,i)=><div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  ); 
}

export default App;