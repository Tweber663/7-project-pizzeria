import { settings, select, } from "../settings.js";
import BaseWidget from "./BaseWidget.js";

class AmountWidget extends BaseWidget {
    constructor(element) {
      //We're matching the BaseWidget class arguments
      super (element, settings.amountWidget.defaultValue);
      const thisWidget = this;
  
      /*passing as argumnet widget wrapper */
      thisWidget.getElements(element);
      
       //*Widget starting value*/
      thisWidget.dom.input.value? thisWidget.setValue(thisWidget.dom.input.value) : thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions(); 
    }
  
    getElements() {
      const thisWidget = this;
      thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
      /*widget 'add' element*/
      thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
      /*widget 'subtract' element*/
      thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    }
   

    //Checking if the icnoming fits btween default Min & Max
    isValid(value) { 
      return value >= settings.amountWidget.defaultMin 
      && value <= settings.amountWidget.defaultMax;
      // returns the information 🔸 -> 
    }

    //Used to render current value on the screen
    rednerValue() {
      const thisWidget = this; 


      thisWidget.dom.input.value = thisWidget.value;

    }
    //[End]
  
  
    initActions() {
      const thisWidget = this; 
  
      /*Looking for changes inside the widget input */
      thisWidget.dom.input.addEventListener('change', function(){
        // thisWidget.setValue(thisWidget.dom.input.value);
        thisWidget.value = thisWidget.dom.input.value;
      })
  
      /* Listetning to subtract button + subtracting the value by 1*/
      thisWidget.dom.linkDecrease.addEventListener('click', function(e){
        e.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      })
  
      /* Listetning to add button + insreasing the value by 1*/
      thisWidget.dom.linkIncrease.addEventListener('click', function(e) {
        e.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
  
      })
    }
  } 
  
export default AmountWidget