import { templates, select, settings, classNames } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
    constructor(element){
     const thisBooking = this;
     thisBooking.render(element);
     thisBooking.initWidgets();
     thisBooking.getData();
    }


    //Downoloads info from APIs& creating urls
    getData() {
        const thisBooking = this; 

        //Creating two const to shorten the code
        //'data_gte'= current date from from datePicker class
        const startDateParam =  `${settings.db.dateStartParamKey}=${utils.dateToStr(thisBooking.datePicker.minDate)}`;
        //'data_lte'= date two weeks from now from datePicker class
        const endDateParam =   `${settings.db.dateEndParamKey}=${utils.dateToStr(thisBooking.datePicker.maxDate)}`;

        //Url paramiters used with APIs urls
        const params = {
            booking: [     
                startDateParam,
                endDateParam 
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam
            ], 
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };

        console.log('getData params', params);
        const urls = {
            //API reservation list (//localhost:3131/bookings?params&)  
            //join() joins all parements togather using '&' coming from params array
            booking:        `${settings.db.url}/${settings.db.bookings}?${params.booking.join('&')}`,
            //API once time reservation list 
            eventsCurrent:  `${settings.db.url}/${settings.db.events}?${params.eventsCurrent.join('&')}`,
            //APi repeated reservations
            eventsRepeat:   `${settings.db.url}/${settings.db.events}?${params.eventsRepeat.join('&')}   `
        }
        console.log('bookingURL', urls);

        /* Promise.all returns single promise compiled of all
         the other promises once every single one is fulfilled */
        Promise.all([
         fetch(urls.booking),
         fetch(urls.eventsCurrent),
         fetch(urls.eventsRepeat),

        ])
         
        .then((allResponses) => {
         const bookingResponse = allResponses[0];
         const eventsCurrentResponse = allResponses[1];
         const eventsRepeatResponse = allResponses[2];
          return Promise.all([
            bookingResponse.json(),
            eventsCurrentResponse.json(),
            eventsRepeatResponse.json()
        ]);
        })
        .then(([bookings, eventsCurrent, eventsRepeat]) => {
            //Triggering a function and passing the info from the server
            thisBooking.parseData(bookings, eventsCurrent, eventsRepeat)


        }).catch((err) => console.log(err));
    }

    

    parseData(bookings, eventsCurrent, eventsRepeat) {
        const thisBooking = this; 

        //Obj with all the reservations
        thisBooking.booked = {};

        //1.Looping through made bookings (alredy made reservations )
        for (let item of bookings) {
            //triggering a function 
            thisBooking.makeBooked(item.date, item.hour, item.duration,  item.table);
        }

         //2.Looping through each onc-time reservations
         for (let item of eventsCurrent) {
            //triggering a function 
            thisBooking.makeBooked(item.date, item.hour, item.duration,  item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

          //3.Looping through each reapted event
          for (let item of eventsRepeat) {
            //We're checking weather our reapted cycles are 'daily' since this can be ajdusted later to f.e weekly
           if (item.repeat == 'daily') {
              for (let loopData = minDate; loopData <= maxDate; loopData = utils.addDays(loopData, 1)) {
                //triggering a function 
                thisBooking.makeBooked(utils.dateToStr(loopData), item.hour, item.duration,  item.table);
              }
           }
        }

        // console.log('thisBooking.booked', thisBooking.booked)
        //triggering a function
        thisBooking.updateDOM();
    } 

    makeBooked(date, hour, duration, table) {
        const thisBooking = this; 

      /*We aim here to create an obj inside a this.booking that will show
      all the booked tables based on the fetched data. But, to create such obj
      we must 1st create a empty obj inside it.
      if checks weather we have an obj with given 'date - if not new obj is created */
       if(typeof thisBooking.booked[date] == 'undefined') {
         thisBooking.booked[date] = {};
       }

       //Changes incoming hours (num) from the 'eventsCurrent' into string
       const startHour = utils.hourToNumber(hour);

       for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5) {

             // 2nd followed by createting an empty array inisde of that obj. 
             if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
             thisBooking.booked[date][hourBlock] = [];
             }

             //Pushes the fetched 'eventsCurret' into the thisBooking.booked obj thanks to setting up the code above using the two id statmnet 
             thisBooking.booked[date][hourBlock].push(table);
       } 
    } 

    //method uses thisBooking.booked
    updateDOM() {
        const thisBooking = this; 

        //saving the current value of our date & hour picker widges inside two new global variables
        thisBooking.date = thisBooking.datePicker.value; 
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value); 
        console.log(thisBooking.hour)
        //Respo for letting us know all tables are avail at selected day & time
        let allAvailable = false; 

        if ( /*if inside the '.booked' obj a certain date is undefined or
            certain date and arr is undefined, this means all the tables are free */
            typeof thisBooking.booked[thisBooking.date] == 'undefined' 
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
            ){
                //If so we change this to true
                allAvailable = true; 
            }

        //Cycles through every table on our booking webpage 
        for (let table of thisBooking.dom.tables) {
            //getting dable id
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if (!isNaN(tableId)) {
                tableId = parseInt(tableId);
            }

        if (
            !allAvailable
            &&
            thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
            table.classList.add(classNames.booking.tableBooked); }
            else {
            table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }


     render(element){
        const thisBooking = this;
        //generate HTML from templates.bookingWidget
         const generatedHTML = templates.bookingWidget();
        //create empty object thisBooking.dom
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);

        //Generating code on our website
        element.innerHTML = generatedDOM.innerHTML;
       
         thisBooking.dom = {
            //entire booking-wrapper dropp
            bookingWrapperDrop: element,
            //wrapper people People input 
            peopleAmount: element.querySelector(select.booking.peopleAmount),
            //hours input 
            hoursAmount: element.querySelector(select.booking.hoursAmount),
            //Date widget wrapper
            datePicker: element.querySelector(select.widgets.datePicker.wrapper),
            //hourPikcet (slider) wrapper
            hourPicker: element.querySelector(select.widgets.hourPicker.wrapper), 
            // our tables
            tables: document.querySelectorAll(select.booking.tables),

         }


     }

    initWidgets() {
        const thisBooking = this; 
        //Bottom widgets
        //Creating class instant / activating widgets 
        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        //Two widgets
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        //Attaching event listener, listenting for changes taken place inside the the AmountWidget Above 
        thisBooking.dom.peopleAmount.addEventListener('change', function(event) {
            event.preventDefault();

        })
         //Attaching event listener to people counter widget
        thisBooking.dom.hoursAmount.addEventListener('change', function(event) {
            event.preventDefault();
        })

        thisBooking.dom.bookingWrapperDrop.addEventListener('updated', function() {
            thisBooking.updateDOM();
        })

   }
}
export default Booking;




