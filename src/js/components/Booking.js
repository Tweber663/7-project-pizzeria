import { templates, select } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";

class Booking {
    constructor(element){
     const thisBooking = this;
     console.log(element.classList)
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
            //booking-wrapper dropp
            bookingWrapperDrop: element,
            //People input
            peopleAmount: element.querySelector(select.booking.peopleAmount),
            //hours input 
            hoursAmount: element.querySelector(select.booking.hoursAmount),
         }


     }

    initWidgets() {
        const thisBooking = this; 
        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        console.log(thisBooking.peopleAmount)

        thisBooking.dom.peopleAmount.addEventListener('change', function(event) {
            event.preventDefault();

        })

        thisBooking.dom.hoursAmount.addEventListener('change', function(event) {
            event.preventDefault();
        })
   }
}
export default Booking;




