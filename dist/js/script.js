/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
        console.log(formData)
  
        //set price to default amount
        let price = thisProduct.data.price

        //for every category (param)....
        for (let paramId in thisProduct.data.params) {
          
          const param = thisProduct.data.params[paramId];
          console.log(`Dish name: "${thisProduct.data.name}🥗"`, paramId);

        
          //for every option in this category 
          for (let optionId in param.options) {
            const option = param.options[optionId]; 

             /* check if there is param with the name of paramId in formData and if it includes optionId */
             const selectedOptions = formData[paramId].includes(optionId);

             /*if option is selected it adds the cost to TOTAL COST */
             if (selectedOptions === true) {
             price += param.options[optionId].price;
             }

             /* checking for default options */
             if (param.options[optionId].default) {
              price -= param.options[optionId].price;
             }

            }
      }
      console.log(price);
      //update calculate price in the HTML 
      thisProduct.priceElem.innerHTML = price;
  }
}


  const app = {
    initMenu() {  // <-- Cycling through each 'product' inside 'dataSource'  
      const thisApp = this;
      console.log('this app data', thisApp.data);
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
      console.log('***App starting***');
      console.log('thisApp:', thisApp);
      console.log('classNmaes', classNames);
      console.log('settings', settings);
      console.log('templates', templates);
      
      thisApp.initData(); // 1st 
      thisApp.initMenu(); // 2nd 
    }
   }

   app.init();
  }