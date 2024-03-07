import { settings, select } from "./settings";
import Product from "./components/Product";
import Cart from "./components/Cart";

const app = {
  initMenu() {  // <-- Cycling through each 'product' inside 'dataSource'  
    const thisApp = this;
    for(let productData in thisApp.data.products) {  
      // Createting a new object based on the cycled info, 1st 'product value, 2nd, passed the 'product' object property
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  }, 

  initData() {  // ---> 💾 connecting to data.js * grabbing 'dataSource' object
    const thisApp = this;
    /*placing fetched data inside this object */
    thisApp.data = {}; 
    /* link to our json-server 'http://localhost:3131/products'*/
    const url = `${settings.db.url}/${settings.db.products}`;

    /* Fetching info from our json-server which is connected to src/db/app */
    fetch(url).then((rawResponse) => {
      console.log(rawResponse)
      return rawResponse.json();     /*grabbing the data in json format */
    }).then((parsedResponse) => {    /* Auto changes to array format */ 
    /*Accsing the list of products in usable data type */

    /* save parsedResponse as thisApp.data.products */
    thisApp.data.products = parsedResponse;

    /*execute initMenu method */
    thisApp.initMenu();

    }).catch((err) => {
      console.log(err);
    }) 

  },

  init() {
    const thisApp = this; 
    thisApp.initData(); // 1st 
  },

  initCart() {
    const thisApp = this; 

    /*Createting a new class */           /*Basket wrapper */
    thisApp.cart = new Cart(document.querySelector(select.containerOf.cart));

    thisApp.productList = document.querySelector(select.containerOf.menu); 
    
    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
      console.log(app);
    })
  }
}

app.init();
app.initCart();

