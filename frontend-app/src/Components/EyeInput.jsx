import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function EyeInput({ type, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ paddingRight: "30px", padding: "10px", width: "200px" }}
      />
      <span
        style={{ position: "absolute", right: "10px", top: "8px", cursor: "pointer" }}
        onClick={() => setShow(!show)}
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
  );
}

export default EyeInput;