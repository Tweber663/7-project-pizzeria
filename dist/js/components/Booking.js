import { templates, select } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
    constructor(element){
     const thisBooking = this;
     thisBooking.render(element);
     thisBooking.initWidgets();
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

         }


     }

    initWidgets() {
        const thisBooking = this; 
        //*How's AmountWidget instant connected to:
        //Creating class instant
        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        //* this ⬇
        //Attaching event listener, listenting for changes taken place inside the the AmountWidget Above 
        thisBooking.dom.peopleAmount.addEventListener('change', function(event) {
            event.preventDefault();

        })
        //* this ⬇
         //Attaching event listener to people counter widget
        thisBooking.dom.hoursAmount.addEventListener('change', function(event) {
            event.preventDefault();
        })


   }
}
export default Booking;




