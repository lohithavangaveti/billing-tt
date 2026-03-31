function CartItem({ item, updateQty }) {
  return (
    <tr>
      <td>{item.name}</td>
      <td>
        <input type="number" value={item.qty} min="1" onChange={e => updateQty(item.name, e.target.value)} />
      </td>
      <td>{item.price}</td>
      <td>{item.qty * item.price}</td>
    </tr>
  );
}

export default CartItem;