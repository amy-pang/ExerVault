

/*const fakeExer [
    { name: pushup, time: "1hr"}
    { name: run, time: "1hr"}
    { name: walk, time: "1hr"}
];

function displayexer(exercises) {
    const list = document.getElementById("app");
    exercises.forEach(exercise => {
        const card = document.createElement("card")
    })
}
document.addEventListener("DOMContentLoaded") 


 
type Exercise = {
    id: string;
    name: string;
};

const cartkey = "exercises_list_cart";

localStorage.setItem(cartkey, "0");
let exercise1 = localStorage.getItem(cartkey); */

import React, { useState, useEffect } from 'react';
import { GiSatelliteCommunication } from 'react-icons/gi';

function CartPage() {
  const cartkey = "exercises_list_cart";
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("count");
    return saved ? Number(saved) : 0;
  }); //declares a "count" state w/ an initial value of 0

  const handleClick = () => {
    setCart((prev) => prev + 1);
  };

  //the side affect is updating the cart of exercises
  useEffect(() => {
    localStorage.setItem("count", String(cart));
    const storedCart = localStorage.getItem(cartkey);

    /*if (storedCart === null) {
      localStorage.setItem(cartkey, "0");
      setCart(0);
    } else {
      setCart(storedCart);
    }*/
  }, [cart]);




  return (
    <>
      <div className="header-wrapper">
        <p>Cart value: {cart}</p>
      </div>
      <button onClick={handleClick}>
        Count: {cart}
      </button>
    </>
  )
}

export default CartPage
