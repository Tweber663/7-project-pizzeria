import { settings, select, classNames } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";
import Home from "./components/Home.js";

const app = { 

  initHome() {
    new Home();
  },

 //Respo for navigating between pages
  initPages() {
    const thisApp = this;

    //this.pages saves info from query inside the 'app' obj under 'pages' name
    // We query pages wrappers where handlebars script will be placed
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    console.log(thisApp.pages);
        
    //Grabbing links responsible for changing between websites
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    //Grabbing the hash of the current page
    const idFromHash = window.location.hash.replace('#/', '');

    
    //**[Respo for displaying our website and checking for errors
    let pageMatchingHash = thisApp.pages[0].id;
  
    //if current open page (url hash) equals any of the pages 'id' the matching page will load 
    for (let page of thisApp.pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id;
        break; 
      } 
    }

    //If match won't take place, we go back to the first page in pageatchingHash

    //passing current page hash into the fucntion
    thisApp.activatePage(pageMatchingHash);
    //*/]
 
    //event listener to link buttons
    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        //Saving clicked element info inside the 'clcikedElement' const
        const clickedElement = this;

        //get page href id from the link and remove #
        const id = clickedElement.getAttribute('href').replace('#', '');

        //trigger activatePage func with the href ID  
        thisApp.activatePage(id);

        //We're adding the page id to the page url. the '/' prevents for refreshing the page. 
        window.location.hash = '#/' + id; 
      })
    }

  },
 //Respo for navigating between pages
  activatePage(pageId) { 
    const thisApp = this;

    //add class 'active' to selected PAGE, and remove 'active class from not selected PAGE 
    for (let page of thisApp.pages) {
      //Toggle class 'active' depddning on page id
      //Here we're also using a toggle function, with if stamtnet as second argument:) 
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }


    //add class 'active' to selected LINK, and remove 'active' class from not selected LINK
    for(let link of thisApp.navLinks) {
     //checking if link href is equal to page id
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId)
    }
  },

  //Respo for bookings
  initBooking() {
    //Creating 'Booking' class instant & passing the booking-wrapper
    new Booking(document.querySelector(select.containerOf.booking));
  },

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

  initCart() {
    const thisApp = this; 

    /*Createting a new class */           /*Basket wrapper */
    thisApp.cart = new Cart(document.querySelector(select.containerOf.cart));

    thisApp.productList = document.querySelector(select.containerOf.menu); 
    
    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
      console.log(app);
    })
  },

  init() { //Responsbile for triggering all the functions. 
    const thisApp = this; 
    thisApp.initData(); // 1st

    thisApp.initPages();

    thisApp.initHome();

    thisApp.initCart();

    thisApp.initBooking();

  },
}

app.init();

