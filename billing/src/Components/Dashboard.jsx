import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Card from "./Card";
import BusinessTable from "./BusinessTable";
import Billing from "./Billing";

function Dashboard() {

  const navigate = useNavigate();

  const [view, setView] = useState("dashboard");

  const [categories, setCategories] = useState(() => {
    return JSON.parse(localStorage.getItem("categories")) || [
      "All",
      "Supermarket",
      "Hardware Store",
      "Medical Store"
    ];
  });

  const [businesses, setBusinesses] = useState(() => {
    return JSON.parse(localStorage.getItem("businesses")) || [
      { id: 1, name: "Supermart A", category: "Supermarket", items: [] },
      { id: 2, name: "Hardware B", category: "Hardware Store", items: [] }
    ];
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [billingBusiness, setBillingBusiness] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [newBusiness, setNewBusiness] = useState("");
  const [newBusinessCategory, setNewBusinessCategory] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");

  const [businessSubView, setBusinessSubView] = useState("shops");
  const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState("All");
  const [selectedBusinessForProducts, setSelectedBusinessForProducts] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [editingProduct, setEditingProduct] = useState(null);

  const [bills, setBills] = useState(() => {
    return JSON.parse(localStorage.getItem("bills")) || [];
  });

  const [customers, setCustomers] = useState(() => {
    return JSON.parse(localStorage.getItem("customers")) || [];
  });
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("businesses", JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem("bills", JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  // 🔥 Auto-sync customers from bills
  useEffect(() => {
    setCustomers(prevCustomers => {
      let updated = [...prevCustomers];
      let hasNew = false;
      bills.forEach(bill => {
        if (bill.customerName) {
          const exists = updated.find(
            c => c.name.toLowerCase() === bill.customerName.toLowerCase() && c.phone === bill.customerPhone
          );
          if (!exists) {
            updated.push({
              id: Date.now() + Math.random(),
              name: bill.customerName,
              phone: bill.customerPhone || ""
            });
            hasNew = true;
          }
        }
      });
      return hasNew ? updated : prevCustomers;
    });
  }, [bills]);
  const handleSaveBill = (billData) => {
    const existingIndex = bills.findIndex(b => b.id === billData.id);
    if (existingIndex >= 0) {
      const updatedBills = [...bills];
      updatedBills[existingIndex] = billData;
      setBills(updatedBills);
    } else {
      setBills([...bills, billData]);
    }

    // Update the business's items list with any new products from the bill
    setBusinesses(prevBusinesses => prevBusinesses.map(b => {
      if (b.id === billData.businessId) {
        const existingItems = b.items || [];
        const updatedItems = [...existingItems];

        billData.cart.forEach(cartItem => {

          const index = updatedItems.findIndex(
            i =>
              i.name.trim().toLowerCase() ===
              cartItem.name.trim().toLowerCase()
          );

          if (index >= 0) {
            // ✅ UPDATE PRICE (THIS IS YOUR REQUIREMENT)
            updatedItems[index] = {
              ...updatedItems[index],
              name: cartItem.name,
              price: cartItem.price
            };
          } else {
            // ➕ ADD NEW ITEM
            updatedItems.push({
              name: cartItem.name,
              price: cartItem.price
            });
          }

        });

        return { ...b, items: updatedItems };
      }
      return b;
    }));

    setBillingBusiness(null);
    setEditingBill(null);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const totalProducts = businesses.reduce((sum, b) => {
    return sum + (b.items?.length || 0);
  }, 0);

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);

  const filteredBills = bills.filter(bill => {
    // 1. Category filter
    const businessForBill = businesses.find(b => b.id === bill.businessId);
    const matchesCategory = selectedCategory === "All" || businessForBill?.category === selectedCategory;

    // 2. Search filter
    const searchLower = invoiceSearch.toLowerCase();
    const matchesSearch =
      (bill.customerName || "").toLowerCase().includes(searchLower) ||
      (bill.customerPhone || "").includes(searchLower) ||
      (bill.businessName || "").toLowerCase().includes(searchLower) ||
      bill.id.toString().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  const groupedBills = filteredBills.reduce((acc, bill) => {
    const business = businesses.find(b => b.id === bill.businessId);
    const category = business?.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(bill);
    return acc;
  }, {});


  const buttonStyle = {
    background: "#6366f1",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer"
  };

  return (
    <div style={{ display: "flex" }}>

      {/* SIDEBAR */}
      <Sidebar
        categories={categories}
        setCategories={setCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* MAIN */}
      <div style={{
        flex: 1,
        padding: "30px",
        background: "#eef2ff",
        minHeight: "100vh"
      }}>

        {/* TOP BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px"
        }}>
          <h2>SmartBiz System</h2>

          <button
            onClick={handleLogout}
            style={{ ...buttonStyle, background: "#ef4444" }}
          >
            Logout
          </button>
        </div>

        {/* NAVIGATION */}
        <div style={{ marginBottom: "20px" }}>
          <button style={buttonStyle} onClick={() => setView("dashboard")}>
            Dashboard
          </button>

          <button
            style={{ ...buttonStyle, marginLeft: "10px" }}
            onClick={() => { setView("business"); setBusinessSubView("shops"); setBillingBusiness(null); }}
          >
            Businesses
          </button>

          <button
            style={{ ...buttonStyle, marginLeft: "10px" }}
            onClick={() => { setView("invoices"); setEditingBill(null); setSelectedCategory("All"); setInvoiceSearch(""); }}
          >
            Invoices
          </button>

          <button
            style={{ ...buttonStyle, marginLeft: "10px" }}
            onClick={() => { setView("customers"); setEditingCustomer(null); }}
          >
            Customers
          </button>
        </div>

        {/* ================= DASHBOARD ================= */}
        {view === "dashboard" && (
          <div>

            {/* CARDS */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
              marginBottom: "20px"
            }}>
              <Card
                title="Total Customers"
                value={customers.length}
                onClick={() => { setView("customers"); setEditingCustomer(null); }}
              />
              <Card
                title="Total Shops"
                value={businesses.length}
                onClick={() => { setView("business"); setBusinessSubView("shops"); setBillingBusiness(null); }}
              />
              <Card
                title="Total Products"
                value={totalProducts}
                onClick={() => {
                  setView("business");
                  setBusinessSubView("products");
                  setBillingBusiness(null);
                  setSelectedBusinessForProducts("");
                  setSelectedCategoryForProducts("All");
                }}
              />
              <Card
                title="Revenue"
                value={`₹${totalRevenue}`}
                onClick={() => { setView("invoices"); setEditingBill(null); setSelectedCategory("All"); setInvoiceSearch(""); }}
              />
            </div>

            {/* 🔥 ALWAYS SHOW ALL BUSINESSES */}
            <div style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
            }}>
              <h3>All Businesses</h3>

              {!billingBusiness ? (
                <BusinessTable
                  businesses={businesses}
                  setBusinesses={setBusinesses}
                  categories={categories}
                  selectedCategory="All"   // 🔥 FIX HERE
                  handleBilling={setBillingBusiness}
                />
              ) : (
                <Billing
                  business={billingBusiness}
                  closeBilling={() => setBillingBusiness(null)}
                  saveBill={handleSaveBill}
                />
              )}

            </div>

          </div>
        )}

        {/* ================= BUSINESS ================= */}
        {view === "business" && (
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                style={businessSubView === "shops" ? buttonStyle : { ...buttonStyle, background: "#94a3b8" }}
                onClick={() => setBusinessSubView("shops")}
              >
                Shops
              </button>
              <button
                style={businessSubView === "products" ? buttonStyle : { ...buttonStyle, background: "#94a3b8" }}
                onClick={() => setBusinessSubView("products")}
              >
                Products
              </button>
            </div>

            {businessSubView === "shops" && (
              <>

                {/* ADD BUSINESS */}
                <div style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
                }}>
                  <h3>Add Business</h3>

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <input
                      placeholder="Enter Business Name"
                      value={newBusiness}
                      onChange={(e) => setNewBusiness(e.target.value)}
                      style={{
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        flex: 1
                      }}
                    />

                    <select
                      value={newBusinessCategory}
                      onChange={(e) => setNewBusinessCategory(e.target.value)}
                      style={{
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        flex: 1
                      }}
                    >
                      <option value="">Select a Category...</option>
                      {categories.filter(c => c !== "All").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <button
                      style={buttonStyle}
                      onClick={() => {
                        if (newBusiness && newBusinessCategory) {
                          setBusinesses([
                            ...businesses,
                            {
                              id: businesses.length + 1,
                              name: newBusiness,
                              category: newBusinessCategory,
                              items: []
                            }
                          ]);
                          setNewBusiness("");
                          setNewBusinessCategory("");
                        } else {
                          alert("Business Name and Category are required");
                        }
                      }}
                    >
                      Add Business
                    </button>
                  </div>
                </div>

                {/* 🔥 FILTERED TABLE */}
                <div style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
                }}>
                  {!billingBusiness ? (
                    <BusinessTable
                      businesses={businesses}
                      setBusinesses={setBusinesses}
                      categories={categories}
                      selectedCategory={selectedCategory} // normal filter
                      handleBilling={setBillingBusiness}
                    />
                  ) : (
                    <Billing
                      business={billingBusiness}
                      closeBilling={() => setBillingBusiness(null)}
                      saveBill={handleSaveBill}
                    />
                  )}
                </div>
              </>
            )}

            {businessSubView === "products" && (
              <div style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
              }}>
                <h3>Manage Products</h3>
                <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
                  <select
                    value={selectedCategoryForProducts}
                    onChange={(e) => {
                      setSelectedCategoryForProducts(e.target.value);
                      setSelectedBusinessForProducts("");
                      setEditingProduct(null);
                      setNewProduct({ name: "", price: "" });
                    }}
                    style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                    ))}
                  </select>

                  <select
                    value={selectedBusinessForProducts}
                    onChange={(e) => {
                      setSelectedBusinessForProducts(e.target.value);
                      setEditingProduct(null);
                      setNewProduct({ name: "", price: "" });
                    }}
                    style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }}
                  >
                    <option value="">Select a Business...</option>
                    {businesses.filter(b => selectedCategoryForProducts === "All" || b.category === selectedCategoryForProducts).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {selectedBusinessForProducts && (() => {
                  const targetBusiness = businesses.find(b => b.id.toString() === selectedBusinessForProducts.toString());
                  if (!targetBusiness) return null;

                  return (
                    <>
                      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                        <input
                          placeholder="Product Name"
                          value={editingProduct ? editingProduct.name : newProduct.name}
                          onChange={(e) => editingProduct
                            ? setEditingProduct({ ...editingProduct, name: e.target.value })
                            : setNewProduct({ ...newProduct, name: e.target.value })
                          }
                          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }}
                        />
                        <input
                          type="number"
                          placeholder="Price (₹)"
                          value={editingProduct ? editingProduct.price : newProduct.price}
                          onChange={(e) => editingProduct
                            ? setEditingProduct({ ...editingProduct, price: e.target.value })
                            : setNewProduct({ ...newProduct, price: e.target.value })
                          }
                          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }}
                        />
                        <button
                          style={buttonStyle}
                          onClick={() => {
                            if (editingProduct) {
                              setBusinesses(businesses.map(b => {
                                if (b.id === targetBusiness.id) {
                                  return {
                                    ...b,
                                    items: b.items.map(i => i.name === editingProduct.originalName ? editingProduct : i)
                                  };
                                }
                                return b;
                              }));
                              setEditingProduct(null);
                            } else {
                              if (newProduct.name && newProduct.price) {
                                setBusinesses(businesses.map(b => {
                                  if (b.id === targetBusiness.id) {
                                    const exists = b.items.find(i => i.name.toLowerCase() === newProduct.name.toLowerCase());
                                    if (!exists) {
                                      return { ...b, items: [...b.items, { name: newProduct.name, price: Number(newProduct.price) }] };
                                    } else {
                                      alert("Product already exists!");
                                    }
                                  }
                                  return b;
                                }));
                                setNewProduct({ name: "", price: "" });
                              }
                            }
                          }}
                        >
                          {editingProduct ? "Save Changes" : "Add Product"}
                        </button>
                        {editingProduct && (
                          <button
                            style={{ ...buttonStyle, background: "#94a3b8", marginLeft: "5px" }}
                            onClick={() => setEditingProduct(null)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead style={{ background: "#0ea5e9", color: "white" }}>
                          <tr>
                            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Product Name</th>
                            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Price (₹)</th>
                            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!targetBusiness.items || targetBusiness.items.length === 0 ? (
                            <tr>
                              <td colSpan="3" style={{ textAlign: "center", padding: "15px" }}>No Products Found</td>
                            </tr>
                          ) : (
                            targetBusiness.items.map((item, idx) => (
                              <tr key={idx} style={{ textAlign: "center" }}>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{item.name}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>₹{item.price}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                                  <button onClick={() => setEditingProduct({ ...item, originalName: item.name })}>Edit</button>
                                  <button
                                    onClick={() => {
                                      setBusinesses(businesses.map(b => {
                                        if (b.id === targetBusiness.id) {
                                          return { ...b, items: b.items.filter(i => i.name !== item.name) };
                                        }
                                        return b;
                                      }));
                                    }}
                                    style={{ marginLeft: "5px", background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px" }}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </>
                  );
                })()}
              </div>
            )}

          </div>
        )}

        {/* ================= INVOICES ================= */}
        {view === "invoices" && (
          <div>
            <div style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
            }}>
              <h3>Invoices</h3>

              {!editingBill && (
                <input
                  placeholder="Search invoices by customer, phone, business, or ID..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "10px",
                    marginBottom: "15px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    boxSizing: "border-box"
                  }}
                />
              )}

              {!editingBill ? (
                <div>
                  {Object.keys(groupedBills).length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px", background: "#f8fafc", borderRadius: "8px", marginTop: "15px" }}>No Invoices Found</div>
                  ) : (
                    Object.keys(groupedBills).sort().map(category => (
                      <div key={category} style={{ marginBottom: "30px", background: "#f8fafc", padding: "15px", borderRadius: "8px", marginTop: "15px" }}>
                        <h4 style={{
                          color: "#0f172a",
                          borderBottom: "2px solid #cbd5e1",
                          paddingBottom: "8px",
                          marginTop: "0",
                          marginBottom: "15px",
                          fontSize: "1.1rem"
                        }}>
                          {category} Invoices
                        </h4>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead style={{ background: "#0ea5e9", color: "white" }}>
                            <tr>
                              <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
                              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Customer Info</th>
                              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Shop</th>
                              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
                              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Total</th>
                              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedBills[category].map((bill) => (
                              <tr key={bill.id} style={{ textAlign: "center", background: "white" }}>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{bill.id}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                                  {bill.customerName || "N/A"}<br />
                                  <small>{bill.customerPhone}</small>
                                </td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{bill.businessName}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{bill.date}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>₹{bill.total}</td>
                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                                  <button onClick={() => setEditingBill(bill)}>Edit</button>
                                  <button
                                    onClick={() => setBills(bills.filter(b => b.id !== bill.id))}
                                    style={{ marginLeft: "5px", background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px" }}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <Billing
                  business={businesses.find(b => b.id === editingBill.businessId) || { id: editingBill.businessId, name: editingBill.businessName }}
                  closeBilling={() => setEditingBill(null)}
                  saveBill={handleSaveBill}
                  initialBill={editingBill}
                />
              )}
            </div>
          </div>
        )}

        {/* ================= CUSTOMERS ================= */}
        {view === "customers" && (
          <div>

            {/* ADD / EDIT CUSTOMER */}
            <div style={{
              background: "white",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "20px",
              boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
            }}>
              <h3>{editingCustomer ? "Edit Customer" : "Add New Customer"}</h3>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <input
                  placeholder="Customer Name"
                  value={editingCustomer ? editingCustomer.name : newCustomer.name}
                  onChange={(e) =>
                    editingCustomer
                      ? setEditingCustomer({ ...editingCustomer, name: e.target.value })
                      : setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    flex: 1
                  }}
                />

                <input
                  placeholder="Phone Number"
                  value={editingCustomer ? editingCustomer.phone : newCustomer.phone}
                  onChange={(e) =>
                    editingCustomer
                      ? setEditingCustomer({ ...editingCustomer, phone: e.target.value })
                      : setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    flex: 1
                  }}
                />

                <button
                  style={buttonStyle}
                  onClick={() => {
                    if (editingCustomer) {
                      setCustomers(
                        customers.map(c =>
                          c.id === editingCustomer.id ? editingCustomer : c
                        )
                      );
                      setEditingCustomer(null);
                    } else {
                      if (newCustomer.name && newCustomer.phone) {
                        setCustomers([
                          ...customers,
                          { ...newCustomer, id: Date.now() }
                        ]);
                        setNewCustomer({ name: "", phone: "" });
                      } else {
                        alert("Customer Name and Phone are required.");
                      }
                    }
                  }}
                >
                  {editingCustomer ? "Save Changes" : "Add Customer"}
                </button>

                {editingCustomer && (
                  <button
                    style={{ ...buttonStyle, background: "#94a3b8" }}
                    onClick={() => setEditingCustomer(null)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* CUSTOMER LIST */}
            <div style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
            }}>
              <h3>All Customers</h3>

              {/* 🔍 SEARCH BAR */}
              <input
                placeholder="Search by name or phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "10px",
                  marginBottom: "15px",
                  borderRadius: "8px",
                  border: "1px solid #ccc"
                }}
              />

              <table style={{
                width: "100%",
                borderCollapse: "collapse"
              }}>
                <thead style={{ background: "#0ea5e9", color: "white" }}>
                  <tr>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Name</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Phone</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "15px" }}>
                        No Customers Found
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr key={c.id} style={{ textAlign: "center" }}>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{c.id}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{c.name}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{c.phone}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                          <button onClick={() => setEditingCustomer(c)}>Edit</button>

                          <button
                            onClick={() =>
                              setCustomers(customers.filter(cust => cust.id !== c.id))
                            }
                            style={{
                              marginLeft: "5px",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "5px"
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;