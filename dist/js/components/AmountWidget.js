import { settings, select, } from "../settings";

class AmountWidget {
    constructor(element) {
      const thisWidget = this;
  
      /*passing as argumnet widget wrapper */
      thisWidget.getElements(element);
      /*Widget starting value*/
  
      thisWidget.input.value? thisWidget.setValue(thisWidget.input.value) : thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions(); 
    }
  
    getElements(element) {
      const thisWidget = this;
      /*widget wrapper for individual product */
      thisWidget.element = element;
      /*widget 'input' element*/
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      /*widget 'add' element*/
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      /*widget 'subtract' element*/
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
  
    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);
      if (thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
      thisWidget.value = newValue;
      thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
      }
  
  
    initActions() {
      const thisWidget = this; 
  
      /*Looking for changes inside the widget input */
      thisWidget.input.addEventListener('change', function(){
        // thisWidget.setValue(thisWidget.input.value);
        thisWidget.value = thisWidget.input.value;
      })
  
      /* Listetning to subtract button + subtracting the value by 1*/
      thisWidget.linkDecrease.addEventListener('click', function(e){
        e.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      })
  
      /* Listetning to add button + insreasing the value by 1*/
      thisWidget.linkIncrease.addEventListener('click', function(e) {
        e.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
  
      })
    }
  
    /*our custom event listener */
    announce() {
      const thisWidget = this; 
      
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  } 
  
export default AmountWidget