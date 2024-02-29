/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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
          /*clicable trigger saved to global class settings '<header class="product__header">'*/
          thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
         
         /*form */
          thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form)
         
         /*form inputs*/
          thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs)

         /*cart button*/
          thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
         
          /*total price */
          thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
        
          /* Grabbing image warpper */
          thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
        
          /*Widget element*/
          thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      }

      initAmountWidget() {
        const thisProduct = this; 

        /*Creating a new class instand & passing widget wrapper element*/ 
        thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
        thisProduct.amountWidgetElem.addEventListener('updated', function() {
          thisProduct.processOrder();
        });
      
      }
      
      initAccodrion() {
        const thisProduct = this;

        /*event Listener clickable trigger */
        thisProduct.accordionTrigger.addEventListener('click', function(e) {
          e.preventDefault();
       
          /* searches for all products with 'active' class */
         const activeProducts = document.querySelectorAll('.product.active');
        
         /*Toggle 'active' class on '<article class="product"> */
        thisProduct.accordionTrigger.parentElement.classList.toggle('active');
       
        /* Removes a 'active' class from the first clicked product */
        if (activeProducts[0]) {
          activeProducts[0].classList.remove('active');
        } 
        })
      }

      initOrderForm() {
        const thisProduct = this;
      /*Listening to from */
        thisProduct.form.addEventListener('submit', function(event) {
          event.preventDefault();
          thisProduct.processOrder();
        })
      /*listetning to form inputs (radios etc..) */
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        })
      }
      /*Listenting to cart button */
      thisProduct.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
      })
      }
      processOrder() {
        const thisProduct = this;
        //Converting FORM to object strocture e.g {sauce: 'tomato etc]}
        const formData = utils.serializeFormToObject(thisProduct.form);
  
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

      /* Responbile multiplaying the price bsed on quantity amount (widget) */
      console.log(thisProduct.amountWidget.value);
      price*= thisProduct.amountWidget.value;

      //update calculate price in the HTML 
      thisProduct.priceElem.innerHTML = price;
      }
}

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
    
    /*changes input value from string to num */
    const newValue = parseInt(value);

   /* TODO: Add validation */
    if(thisWidget.value !== newValue && !isNaN(newValue) && newValue > settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        thisWidget.announce();
    }
    thisWidget.input.value = thisWidget.value

  }

  initActions() {
    const thisWidget = this; 

    /*Looking for changes inside the widget input */
    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
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

    const event = new Event('updated');
    thisWidget.element.dispatchEvent(event);
  }
} 

class Cart {
  constructor(element) {
    const thisCart = this;

    /* Storing basket items */
    thisCart.products = [];

    thisCart.getElements(element);

    console.log('new card:', thisCart);
  }

  getElements(element) {
    const thisCart = this;

    /*dom refrences stored inside object */
    thisCart.dom = {};

    thisCart.dom.wrapper = element;

  }
}

  const app = {
    initMenu() {  // <-- Cycling through each 'product' inside 'dataSource'  
      const thisApp = this;
      for(let productData in thisApp.data.products) {  
        // Createting a new object based on the cycled info, 1st 'product value, 2nd, passed the 'product' object property
       new Product(productData, thisApp.data.products[productData])
      }
    }, 

    initData() {  // ---> 💾 connecting to data.js * grabbing 'dataSource' object
      const thisApp = this;
      thisApp.data = dataSource; 
    },

    init() {
      const thisApp = this; 
      thisApp.initData(); // 1st 
      thisApp.initMenu(); // 2nd 
    }
   }

   app.init();
  }


