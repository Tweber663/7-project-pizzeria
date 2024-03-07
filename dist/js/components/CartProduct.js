import { select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
/*this class will be responsbile for individual items in our basket */
class CartProduct {
    /* As argument we recive the created object from cart class + DOM element */
    constructor(menuProduct, element) {
      const thisCartProduct = this;
  
      thisCartProduct.menuProduct = menuProduct;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name; 
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      
  
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }
  
    /*Argu - refrence to DOM element */
    getElements(element) {
      const thisCartProduct = this;
      
      thisCartProduct.dom = {
        wrapper: element,  /* DOM ele */
        amountWidget: element.querySelector(select.cartProduct.amountWidget), 
        price: element.querySelector(select.cartProduct.price),
        /*DOM button location <- */
        edit: element.querySelector(select.cartProduct.edit),
        /*DOM remove icon location <- */
        remove: element.querySelector(select.cartProduct.remove),
      }  
     
    }
  
    initAmountWidget() {
      const thisCartProduct = this; 
      /*Creating a new class instant responsbile for changing product quantity, and acessing the changed quantity amount*/ 
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    
      /*Listening to changes inside the cart / basket widget */
      thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
    
        /*updated quantity amount 'value' from class instant used to change value inside current class*/
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
    
        /* Calculate the new price based on the updated quantity */
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
    
        /*inside out basket we're updating the total price of individual item */
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
    
    /*2.Respinsbile for deleting individual items in our basket using custom event and bubbling */
    remove() {
      const thisCartProduct = this;
      const event = new CustomEvent('remove', {
        bubbles: true, 
        /*detials allows us to pass whatever info we wont to event handler */
        detail: {
          cartProduct: thisCartProduct, /* -> We're passing the class instance 🟣*/
        },
      });
      //Where the event will be executed
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }
  
   initActions() { //1. Evenet listeners that will trigger the remove method
      const thisCartProduct = this; 
  
      thisCartProduct.dom.edit.addEventListener('click', function(event) {
        event.preventDefault();
        /*trigger remove func*/
        thisCartProduct.remove();
      });
  
      thisCartProduct.dom.remove.addEventListener('click', function(event) {
        event.preventDefault();
      /*trigger remove func*/
      thisCartProduct.remove();
      });
      thisCartProduct.getData()
    }
  
    getData() {
      const thisCartProduct = this; 
  
      const gettingData = {
        id: thisCartProduct.id, 
        amount: thisCartProduct.amount, 
        price: thisCartProduct.price, 
        priceSingle: thisCartProduct.priceSingle, 
        name: thisCartProduct.name, 
        params: thisCartProduct.params, 
      };
  
      return gettingData;
    }
  
  }

  export default CartProduct
  
  