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
    }
      renderInMenu() { // Responsbile for rendeing information on our website
        const thisProduct = this; 

        /*generating HTML based on template*/
        const generateHTML = templates.menuProduct(thisProduct.data);
        
        /* create element using utils.createElementFromHtml 'functions.js'*/
        thisProduct.element = utils.createDOMFromHTML(generateHTML);

        /* find menu container */ 
        const menuContainer = document.querySelector(select.containerOf.menu);

        /* add element to menu*/ 
        menuContainer.appendChild(thisProduct.element);
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