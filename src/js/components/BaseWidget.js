//!BaseWidget class is responsbile for numerical values only*/

 class BaseWidget {
    //1st argu widget wrapper, 2nd inital value
    constructor(wrapperElement, initialValue) {
        const thisWidget = this; 

        thisWidget.dom = {};
        //widget wrapper
        thisWidget.dom.wrapper = wrapperElement;
        //Inital value
        thisWidget.correctValue = initialValue; 

    }

    /*'getter' activates every attempt we make to
     read the 'value' property from class instant */
    get value() {
        const thisWidget = this;

        return thisWidget.correctValue;
    }

     /*'setter activates every time we want to change the 'value' property */
    //Respo for creating new default widget value 
    //Work is collaboratin with AmountWidget class
    set value(value) {
        const thisWidget = this;
        const newValue = thisWidget.parseInt(value); // <- returned changed info 🔹
      
        if (thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {  // <- returned info 🔸
        thisWidget.correctValue = newValue;
        thisWidget.announce(); 
        }

        thisWidget.rednerValue(); //Last step renders the new value. 
        } 
       
    setValue(value) {
        const thisWidget = this; 

        thisWidget.value = value; 
    }    
 
    //Transforms incoming value to required type / format 
    //Changes string to number and returns the info 🔹 ->
    parseInt(value) {
        return parseInt(value);
      }
  
    //Checking if the icnoming value is a number 
    isValid(value) { 
        return !isNaN(value)
        // returns the information 🔸 -> 
    }

    //Used to render current value on the screen
    rednerValue() {
    const thisWidget = this; 

    thisWidget.dom.input.value = thisWidget.value;
    }
    //FINISH

    /*our custom event listener */
    announce() {
        const thisWidget = this; 
        
        const event = new CustomEvent('updated', {
          bubbles: true
        });
        thisWidget.dom.wrapper.dispatchEvent(event);
      }
}
export default BaseWidget;