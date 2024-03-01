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
        console.log('thisProduct.data', thisProduct.data);
        console.log('generateHTML', generateHTML);
        
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
          price: thisProduct.priceSingle * thisProduct.amountWidget.value,
          //Callback, passing an object containing selected extras
          params: thisProduct.prepareCartProductParams(), 
        };
        return productSummary;
      }

      /*2.Preparing selected items before adding to cart*/
      prepareCartProductParams() {
        const thisProduct = this;
        console.log('id', thisProduct.data);
        /*this thing is hooked up to a form, an
        d tranfroms selected items into an object*/
        const formData = utils.serializeFormToObject(thisProduct.dom.form);
        console.log('selected extras 📋', formData);

        let selectedExtras = {

        };

       /*First we cycle throught extras 'CATEGORY', source, crust etc..*/
       /*[thisProduct.data.par..] All Objects {sauce: {…}, toppings: {…}, crust: {…}}*/
       /*[paramID] individual object names ONLY*/ 
        for (let paramId in thisProduct.data.params) {
        /*using the object name, on the object, to acess it and all it's info */
          const extrasObject = thisProduct.data.params[paramId];
          console.log('Extras Category 🔴', extrasObject);
          
          /*Cycling throught individual toppings following the logic above */
          for (let toppingId in extrasObject.options) {
          const extrasItems = extrasObject.options[toppingId];
          console.log('Extras Items 🔻', extrasItems);

          if (formData[paramId].includes(toppingId)) {
            console.log(toppingId);

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
      console.log(selectedExtras);
      /*returning created object. It will be used inside prepareCartProduct()*/
      return selectedExtras;
    }
      
      /*3.Adding elements to our'cart' CLASS*/
      addToCart() {
        const thisProduct = this; 
        /*We're triggering our Cart class + passing a refrence / instant*/
        app.cart.add(thisProduct.prepareCartProduct());   
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

      /* Responbile multiplaying the price bsed on quantity amount (widget) */
      price*= thisProduct.amountWidget.value;
      
      /*STATIC - product base price (without any extras)*/
      thisProduct.priceSingle = thisProduct.data.price;

      //update calculate price in the HTML 
      thisProduct.dom.priceElem.innerHTML = price;
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
    console.log(value);
    const newValue = parseInt(value);
    if (thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
    thisWidget.value = newValue;
    thisWidget.announce();
    }
    thisWidget.input.value = thisWidget.value;
    console.log(thisWidget.input.value)
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

    /*init dom elements */
    thisCart.getElements(element);

    thisCart.initActions();
    console.log('new card:', thisCart);
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


    };
  }

  initActions() {
    const thisCart = this;

    /*Toggling basket visiblity */
      thisCart.dom.toggleTrigger.addEventListener('click', function() {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive)
    })
  }

  add(menuProduct) {
  /* 'menuProduct' argument comes from 'addToCart()'and is giving
   us acess to product instand after add to cart is pressed*/
   
   const thisCart = this;

   /*generated HTML based on the passed object using 'cardProduct' beloning to handlebard*/
   const generatedHTML = templates.cartProduct(menuProduct);

   /*converting above HTML to DOM element */
   const generatedDOM = utils.createDOMFromHTML(generatedHTML);

   /*Adding the DOM object to our HTML website */
   thisCart.dom.productList.appendChild(generatedDOM);

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
    },

    initCart() {
      const thisApp = this; 

      /*Createting a new class */           /*Basket wrapper */
      thisApp.cart = new Cart(document.querySelector(select.containerOf.cart));
    }
   }

   app.init();
   app.initCart();
  }


