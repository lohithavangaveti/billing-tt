import { useMemo, useState } from "react";
import CartItem from "./CartItem";

function Billing({ business, closeBilling, saveBill, initialBill }) {
  const [customerName, setCustomerName] = useState(initialBill?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(initialBill?.customerPhone || "");
  const [date, setDate] = useState(initialBill?.date || new Date().toISOString().slice(0, 10));
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [cart, setCart] = useState(initialBill?.cart || []);

  const businessItems = business?.items || [];

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.qty) * Number(item.price), 0);
  }, [cart]);

  const addItemToCart = () => {
    if (!itemName.trim() || !itemPrice) {
      return;
    }

    const existing = cart.find((item) => item.name.toLowerCase() === itemName.trim().toLowerCase());
    if (existing) {
      setCart(
        cart.map((item) =>
          item.name.toLowerCase() === itemName.trim().toLowerCase()
            ? { ...item, qty: Number(item.qty) + 1, price: Number(itemPrice) }
            : item
        )
      );
    } else {
      setCart([...cart, { name: itemName.trim(), price: Number(itemPrice), qty: 1 }]);
    }

    setItemName("");
    setItemPrice("");
  };

  const updateQty = (name, qty) => {
    const nextQty = Number(qty);
    if (!Number.isFinite(nextQty) || nextQty <= 0) {
      setCart(cart.filter((item) => item.name !== name));
      return;
    }

    setCart(cart.map((item) => (item.name === name ? { ...item, qty: nextQty } : item)));
  };

  const removeItem = (name) => {
    setCart(cart.filter((item) => item.name !== name));
  };

  const submitBill = () => {
    if (!customerName.trim()) {
      alert("Customer name is required.");
      return;
    }
    if (cart.length === 0) {
      alert("Add at least one item to create a bill.");
      return;
    }

    saveBill({
      id: initialBill?.id || Date.now(),
      businessId: business.id,
      businessName: business.name,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      date,
      cart,
      total
    });
  };

  return (
    <div style={{ textAlign: "left" }}>
      <h3 style={{ marginTop: 0 }}>Billing - {business?.name}</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginBottom: "15px" }}>
        <input
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Customer Phone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          style={inputStyle}
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: "10px", marginBottom: "15px" }}>
        <select
          value={itemName}
          onChange={(e) => {
            const selectedName = e.target.value;
            setItemName(selectedName);
            const selected = businessItems.find((item) => item.name === selectedName);
            if (selected?.price !== undefined) {
              setItemPrice(String(selected.price));
            }
          }}
          style={inputStyle}
        >
          <option value="">Select product or type manually</option>
          {businessItems.map((item, index) => (
            <option key={`${item.name}-${index}`} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Price"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          style={inputStyle}
        />

        <button onClick={addItemToCart} style={buttonStyle}>
          Add Item
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px" }}>
        <thead style={{ background: "#0ea5e9", color: "white" }}>
          <tr>
            <th style={th}>Item</th>
            <th style={th}>Qty</th>
            <th style={th}>Price</th>
            <th style={th}>Total</th>
            <th style={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: "10px", textAlign: "center", border: "1px solid #ddd" }}>
                No items added yet.
              </td>
            </tr>
          ) : (
            cart.map((item) => (
              <tr key={item.name}>
                <CartItem item={item} updateQty={updateQty} />
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                  <button onClick={() => removeItem(item.name)} style={dangerButtonStyle}>
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h4 style={{ marginTop: 0 }}>Grand Total: Rs. {total.toFixed(2)}</h4>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={submitBill} style={buttonStyle}>
          Save Bill
        </button>
        <button onClick={closeBilling} style={{ ...buttonStyle, background: "#94a3b8" }}>
          Close
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box"
};

const buttonStyle = {
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  background: "#6366f1",
  color: "white"
};

const dangerButtonStyle = {
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  background: "#ef4444",
  color: "white"
};

const th = {
  padding: "10px",
  border: "1px solid #ddd"
};

export default Billing;
