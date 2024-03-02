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
      totalPriceUp: '.cart__total-price strong',
      totalPriceDown: '.cart__order-total .cart__order-price-sum strong',
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
          price: thisProduct.totalOrderPrice * thisProduct.amountWidget.value,
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
      /*Single item total price inclduing selected option / extras*/
      thisProduct.priceSingle = price;

      /* Responbile multiplaying the price bsed on quantity amount (widget) */
      price*= thisProduct.amountWidget.value;

      //update calculate price in the HTML 
      thisProduct.dom.priceElem.innerHTML = price;

      thisProduct.totalOrderPrice = price;
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
    
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
} 


class Cart {
  constructor(element) {
    const thisCart = this;
    console.log('hello')

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
  }
  
  //Reciving the info about the object from cusotm event 
  remove(cartProduct) {
    const thisCart = this; 
    console.log(cartProduct);

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
   console.log(thisCart.dom.productList);

   /*pushing the created order object to Array */
   /* + We're creating a new class instant and saving all the code it generated inside the array at the same time */
   thisCart.products.push(new CartProduct (menuProduct, generatedDOM));

   /*initilsing func*/
   thisCart.update()
  }

  /*responsbile for adding up the total cost of all the items in the cart / basket */
  update() {
    const thisCart = this; 

    const deliveryFee = settings.cart.defaultDeliveryFee;

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
    totalNumber === 0? thisCart.totalPrice = 0 : thisCart.totalPrice = subtotalPrice + deliveryFee;

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

    /*using the updated quanity and dividing it by 'priceSingle' that comes from process order Product class */
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
