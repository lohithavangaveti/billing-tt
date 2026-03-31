import { useState } from "react";

function Billing({ business, closeBilling, saveBill, initialBill }) {

  const [cart, setCart] = useState(initialBill?.cart || []);
  const [newItem, setNewItem] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const [showBill, setShowBill] = useState(false);

  // ✅ Customer Details
  const [customerName, setCustomerName] = useState(initialBill?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(initialBill?.customerPhone || "");

  // ✅ GST %
  const GST_PERCENT = 18;

  // ✅ Add item
  const addItem = () => {
    if (newItem && newPrice) {
      setCart([
        ...cart,
        { name: newItem, price: Number(newPrice), qty: 1 }
      ]);
      setNewItem("");
      setNewPrice("");
    }
  };

  // ✅ Update qty
  const updateQty = (name, qty) => {
    setCart(cart.map(i =>
      i.name === name ? { ...i, qty: Number(qty) } : i
    ));
  };

  // ✅ Calculations
  const total = cart.reduce((acc, i) => acc + i.qty * i.price, 0);
  const subtotal = Number((total / (1 + (GST_PERCENT / 100))).toFixed(2));
  const gstAmount = Number((total - subtotal).toFixed(2));

  const currentDate = new Date().toLocaleString();

  // ✅ Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: "20px" }}>

      {/* ================= ENTRY UI ================= */}
      {!showBill && (
        <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>

          <h2>🧾 Billing - {business.name}</h2>

          {/* CUSTOMER DETAILS */}
          <div style={{ marginBottom: "15px" }}>
            <input
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <input
              placeholder="Phone Number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              style={{ marginLeft: "10px" }}
            />
          </div>

          {/* ADD ITEM */}
          <div style={{ marginBottom: "20px" }}>
            <input
              placeholder="Item Name"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />

            <input
              type="number"
              placeholder="Price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              style={{ marginLeft: "10px" }}
            />

            <button onClick={addItem} style={{ marginLeft: "10px" }}>
              Add Item
            </button>
          </div>

          {/* TABLE */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#ddd" }}>
              <tr>
                <th style={thStyle}>Item</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Total</th>
              </tr>
            </thead>

            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No items added
                  </td>
                </tr>
              ) : (
                cart.map(i => (
                  <tr key={i.name}>
                    <td style={tdStyle}>{i.name}</td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={i.qty}
                        onChange={(e) => updateQty(i.name, e.target.value)}
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td style={tdStyle}>₹{i.price}</td>
                    <td style={tdStyle}>₹{i.qty * i.price}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <h3>Subtotal: ₹{subtotal}</h3>
          <h3>GST (18%): ₹{gstAmount}</h3>
          <h2>Total: ₹{total}</h2>

          <button onClick={() => setShowBill(true)}>
            Generate Bill
          </button>

          <button onClick={closeBilling} style={{ marginLeft: "10px" }}>
            Back
          </button>
        </div>
      )}

      {/* ================= FINAL BILL ================= */}
      {showBill && (
        <div style={{
          background: "white",
          padding: "20px",
          width: "400px",
          margin: "auto"
        }}>

          <h2 style={{ textAlign: "center" }}>🧾 Invoice</h2>

          <p><strong>Shop:</strong> {business.name}</p>
          <p><strong>Date:</strong> {currentDate}</p>

          <p><strong>Customer:</strong> {customerName}</p>
          <p><strong>Phone:</strong> {customerPhone}</p>

          <hr />

          {cart.map(i => (
            i.qty > 0 && (
              <div key={i.name} style={{
                display: "flex",
                justifyContent: "space-between"
              }}>
                <span>{i.name} x {i.qty}</span>
                <span>₹{i.qty * i.price}</span>
              </div>
            )
          ))}

          <hr />

          <p>Subtotal: ₹{subtotal}</p>
          <p>GST (18%): ₹{gstAmount}</p>
          <h3>Total: ₹{total}</h3>

          {/* ACTIONS */}
          <button onClick={handlePrint}>🖨️ Print</button>

          <button onClick={() => setShowBill(false)} style={{ marginLeft: "10px" }}>
            Edit
          </button>

          <button onClick={() => {
            if (saveBill) {
              saveBill({
                id: initialBill ? initialBill.id : Date.now(),
                businessId: business.id,
                businessName: business.name,
                customerName,
                customerPhone,
                cart: cart.filter(i => i.qty > 0),
                subtotal,
                gstAmount,
                total,
                date: initialBill ? initialBill.date : currentDate
              });
            } else {
              closeBilling();
            }
          }} style={{ marginLeft: "10px" }}>
            Done & Save
          </button>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "10px",
  border: "1px solid #ccc"
};

const tdStyle = {
  padding: "10px",
  border: "1px solid #ccc"
};

export default Billing;