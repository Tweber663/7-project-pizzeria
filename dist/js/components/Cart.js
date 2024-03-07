import { select, classNames, settings, templates } from "../settings.js";
import utils from "../utils.js";
import CartProduct from "./CartProduct.js";

class Cart {
    constructor(element) {
      const thisCart = this;
  
      /* basket items summary*/
      thisCart.products = [];
  
      /*init dom elements */
      thisCart.getElements(element);
  
      thisCart.initActions();
      thisCart.update()
    }
  
    getElements(element) {
      const thisCart = this;
  
      /*dom refrences stored inside object */
      thisCart.dom = {
      /*Basket wrapper passed from constructor*/
      wrapper: element,
      /*basket trigger element */
      toggleTrigger: element.querySelector(select.cart.toggleTrigger),
      /*basket summary wrapper*/
      productList: element.querySelector(select.cart.productList),
      /*delivery fee */ 
      deliveryFee: element.querySelector(select.cart.deliveryFee),
      /*Subtotal price (without delivery) */
      subtotalPrice: element.querySelector(select.cart.subtotalPrice),
      /*total price (+delivery) upper section*/ 
      totalPriceUp: element.querySelector(select.cart.totalPriceUp),
      /*total price (+delivery) lower section*/ 
      totalPriceDown: element.querySelector(select.cart.totalPriceDown),
      /*total number of times inside basket / cart */
      totalNumber: thisCart.products.length,
      /*Cart form */
      form: element.querySelector(select.cart.form),
  
      };
    }
  
    initActions() {
      const thisCart = this;
  
      /*Toggling basket visiblity */
        thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive)
      });
  
      /*Listen to changes inisde UL tag where individual products are added*/
        thisCart.dom.productList.addEventListener('updated', function() {
          thisCart.update();
        });
      
       /*3.Listen to changes inisde UL tag where individual products are added*/
       /* We're also reciving back info from custom event <- 🟣 */
        thisCart.dom.productList.addEventListener('remove', function() {
          thisCart.remove(event.detail.cartProduct) //Passing the recived info as argument
        });
        
        /*form, event listener */
        thisCart.dom.form.addEventListener('submit', function(event) {
          event.preventDefault();
          /*Trigger a func respo for put togather the order and send it to the server */
          const phoneNumberForm = event.target.phone.value;
          const adressFrom = event.target.address.value;
          thisCart.sendOrder(phoneNumberForm, adressFrom);
  
        })
    }
  
       /*respo for put togather the order and send it to the server */
    sendOrder(phoneNumberForm, adressFrom) {
      const thisCart = this; 
  
      /* 1st preparing the address of the endpoint we want to connect to */
      const url = `${settings.db.url}/${settings.db.orders}`;
  
      /*prepering the payload for json-server */
      const payload = {
        address: adressFrom, 
        phone: phoneNumberForm, 
        totalPrice: thisCart.dom.totalPriceDown.textContent,
        subtotalPrice: thisCart.dom.subtotalPrice.textContent, 
        totalNumber: thisCart.products.length.toString(),
        deliveryFee: thisCart.dom.deliveryFee.textContent,
        products: [],
      }
  
      //Cycling throguth getData() of CartProduct class which returns an object{
      for(let prod of thisCart.products) {
      //We inser this object inside our payload obj
        payload.products.push(prod.getData());
      }
  
      //Prepering fetch settings
      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json',}, 
        body: JSON.stringify(payload),
      };
      /*Launching our payload into SPACE!*/
      fetch(url, options).then((response) => {
        return response.json();
      }).then((convertedResponse) => console.log(convertedResponse), {
      }).catch((err) => console.log(err));
    }
  
  
    
    
    //4.Reciving the info about the object from cusotm event 
    remove(cartProduct) {
      const thisCart = this; 
  
      /*Deleting item from HTML */
      cartProduct.dom.wrapper.remove();
      
      /*Deleting item from storge Obj */
      thisCart.products.splice(thisCart.products.indexOf(cartProduct), 1);
  
      /* envoking update function to update the price */
      thisCart.update();
      
    }
  
  
    add(menuProduct) {
    /* 'menuProduct' argument comes from 'addToCart()'and is giving
     us acess to product instant after add to cart is pressed*/
     const thisCart = this;
  
     /*generated HTML based on the passed object using 'cardProduct' beloning to handlebard*/
     const generatedHTML = templates.cartProduct(menuProduct);
  
     /*converting above HTML to DOM element */
     const generatedDOM = utils.createDOMFromHTML(generatedHTML);
  
     /*[DOM] -> adding item to our HTML website */
     thisCart.dom.productList.appendChild(generatedDOM);
  
     /*pushing the created order object to Array */
     /* + We're creating a new class instant and saving all the code it generated inside the array at the same time */
     thisCart.products.push(new CartProduct (menuProduct, generatedDOM));
  
     /*initilsing func*/
     thisCart.update()
    }
  
    /*responsbile for adding up the total cost of all the items in the cart / basket */
    update() {
      const thisCart = this; 
  
      let deliveryFee = settings.cart.defaultDeliveryFee;
  
      /*Number of order inside the basket*/
      let totalNumber = 0;
  
      /*total cost amount 'excluding' delivery*/
      let subtotalPrice = 0;
  
      /* Cycling throguh each poduct inside of 'basket items summary'obj */
      for (let product of thisCart.products) {
        /*counter of itmes inside the basket*/
        totalNumber++;
        /*Counting each item cost */
        subtotalPrice += product.price;
      }
  
      /*Sumary of total coast of all the itmes + delviery cost */
      /*checking if basket has items, because it it doesn't there is no point adding delivery free*/
      if (totalNumber === 0) {
        thisCart.totalPrice = 0;
        deliveryFee = 0;
      } else {
        thisCart.totalPrice = subtotalPrice + deliveryFee;
      }
  
      /*[DOM] -> Adding total price to TOP section */
      thisCart.dom.totalPriceUp.innerHTML = thisCart.totalPrice;
      /*[DOM] -> Adding total price to BOTTOM section */
      thisCart.dom.totalPriceDown.innerHTML = thisCart.totalPrice; 
      /*[DOM] -> Adding subtotal (without delivery) */
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      /*[DOM] -> Adding delivery fee */
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    }
  }
  
  export default Cart