import { select, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";

class Product {
    constructor(id, data) {
      const thisProduct = this; 
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccodrion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

    }
      renderInMenu() { // Responsbile for rendeing information on our website
        const thisProduct = this; 

        /*generating HTML based on template using handlebars*/
        const generateHTML = templates.menuProduct(thisProduct.data);
        
        /* create element using utils.createElementFromHtml 'functions.js'*/
        thisProduct.element = utils.createDOMFromHTML(generateHTML);

        /* find menu container */ 
        const menuContainer = document.querySelector(select.containerOf.menu);

        /* add element to menu*/ 
        menuContainer.appendChild(thisProduct.element);
        
      }

      getElements(){
          const thisProduct = this;

          thisProduct.dom = {
          /*clicable trigger saved to global class settings '<header class="product__header">'*/
          accordionTrigger: thisProduct.element.querySelector(select.menuProduct.clickable),
          /*form */
          form: thisProduct.element.querySelector(select.menuProduct.form),
          /*form inputs*/
          formInputs: document.querySelectorAll(select.all.formInputs),
             /*cart button*/
          cartButton: thisProduct.element.querySelector(select.menuProduct.cartButton),
          /*total price */
          priceElem: thisProduct.element.querySelector(select.menuProduct.priceElem),
          /* Grabbing image warpper */
          imageWrapper: thisProduct.element.querySelector(select.menuProduct.imageWrapper),
           /*Widget element*/
          amountWidgetElem: thisProduct.element.querySelector(select.menuProduct.amountWidget),
          }
      }

      initAmountWidget() {
        const thisProduct = this; 

        /*Creating a new class instand & passing widget wrapper element*/ 
        thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
        thisProduct.dom.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
        });
      
      }
      
      initAccodrion() {
        const thisProduct = this;

        /*event Listener clickable trigger */
        thisProduct.dom.accordionTrigger.addEventListener('click', function(e) {
          e.preventDefault();
       
          /* searches for all products with 'active' class */
         const activeProducts = document.querySelectorAll('.product.active');
        
         /*Toggle 'active' class on '<article class="product"> */
        thisProduct.dom.accordionTrigger.parentElement.classList.toggle('active');
       
        /* Removes a 'active' class from the first clicked product */
        if (activeProducts[0]) {
          activeProducts[0].classList.remove('active');
        } 
        })
      }

      initOrderForm() {
        const thisProduct = this;
      /*Listening to formm */
        thisProduct.dom.form.addEventListener('submit', function(event) {
          event.preventDefault();
          thisProduct.processOrder();
        })
      /*listetning to form inputs (radios etc..) */
      for (let input of thisProduct.dom.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        })
      }
      /*Listenting to cart button */
      thisProduct.dom.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.addToCart(); /*triggering a function */
        thisProduct.processOrder();
      })
      }

      /*1.Preparing cart elem befor they are added*/
      prepareCartProduct() {
        const thisProduct = this;

        /*brief summary of entire product that contains 'only' nedded info*/ 
        const productSummary = {
          id: thisProduct.id,
          name: thisProduct.data.name,
          amount: thisProduct.amountWidget.value,
          priceSingle: thisProduct.priceSingle, 
          price: thisProduct.totalOrderPrice,
          //Callback, passing an object containing selected extras
          params: thisProduct.prepareCartProductParams(), 
        };
        return productSummary;
      }

      /*2.Preparing selected items before adding to cart*/
      prepareCartProductParams() {
        const thisProduct = this;
        /*this thing is hooked up to a form, an
        d tranfroms selected items into an object*/
        const formData = utils.serializeFormToObject(thisProduct.dom.form);
        // console.log('selected extras 📋', formData);

        let selectedExtras = {

        };

       /*First we cycle throught extras 'CATEGORY', source, crust etc..*/
       /*[thisProduct.data.par..] All Objects {sauce: {…}, toppings: {…}, crust: {…}}*/
       /*[paramID] individual object names ONLY*/ 
        for (let paramId in thisProduct.data.params) {
        /*using the object name, on the object, to acess it and all it's info */
          const extrasObject = thisProduct.data.params[paramId];
          // console.log('Extras Category 🔴', extrasObject);
          
          /*Cycling throught individual toppings following the logic above */
          for (let toppingId in extrasObject.options) {
          const extrasItems = extrasObject.options[toppingId];
          // console.log('Extras Items 🔻', extrasItems);

          if (formData[paramId].includes(toppingId)) {

            /*If stamtnet checking is Extras alredy exsist in the designated object */
            /*If they exsist - the won't get added*/
            /*If Don't - will get added */
            if (!selectedExtras[paramId]) {
              //[patamId] category extra name 'ingriditens)
              selectedExtras[paramId] = {
                  label: extrasObject.label,
                  options: {}
              };
          }
          // Category Extra             //Feta          //Feta-cheese
          selectedExtras[paramId].options[toppingId] = extrasItems.label;

            /*OPtional way of writing the code above!!!*/
            // selectedExtras[paramId].options = {
            //   ...selectedExtras[paramId].options,
            //   [toppingId]: extrasItems.label
            // };
          }
        }
      }
      /*returning created object. It will be used inside prepareCartProduct()*/
      return selectedExtras;
    }
      
      /*3.Adding elements to our'cart' CLASS*/
      addToCart() {
        const thisProduct = this; 
        
        const event = new CustomEvent('add-to-cart', {
          bubbles: true, 
          detail: {
            product: thisProduct,
          }
        });
        thisProduct.element.dispatchEvent(event);
      }

      processOrder() {
        const thisProduct = this;
        //Converting FORM to object strocture e.g {sauce: 'tomato etc]}
        const formData = utils.serializeFormToObject(thisProduct.dom.form);
  
        //set price to default amount
        let price = thisProduct.data.price

        //loops every category (param)....
        for (let paramId in thisProduct.data.params) {
          
          const param = thisProduct.data.params[paramId];
          // console.log(`Dish name: "${thisProduct.data.name}🥗"`, paramId);

        
          //loops every option in this category 
          for (let optionId in param.options) {

             /* checks if there is paramId in formData and if it includes optionsId */
             const selectedOptions = formData[paramId].includes(optionId);

             /*Checks if option is selected */
             if (selectedOptions === true) {
              /*if true, it adds the cost of each option to total amount */
             price += param.options[optionId].price;
             
             /* using the option category (paramID) & option type )optionID we're creating a class selector*/
             const className = `.${paramId}-${optionId}`;
             /* Searching for the imgs using the class selector created above*/
             thisProduct.imgDOM = document.querySelector(className);

             /* some img return as null because the selector that we created also searches for images technically doesn't exsist*/
             /* Before we can start adding & removing 'active' class, we gotta make sure that our results don't return null*/
             thisProduct.imgDOM !== null? thisProduct.imgDOM.classList.add('active') : null
             
             /*Oppostie to what it is above -if option is FALSE (not selected) */
            } else {
              const className = `.${paramId}-${optionId}`;
              thisProduct.imgDOM = document.querySelector(className);
              thisProduct.imgDOM !== null? thisProduct.imgDOM.classList.remove('active') : null;
              }
            

             /* If option is default it takes away the option cost from the to total amount */
             if (param.options[optionId].default) {
              price -= param.options[optionId].price;
             }

            }
      }
      /*Single item total price inclduing selected option / extras*/
      //multiply price by amount
    price *= thisProduct.amountWidget.value
    //Give thisProduct new property priceSingle
    thisProduct.priceSingle = thisProduct.data.price;
    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
    thisProduct.totalOrderPrice = price; 
      }
}

export default Product
