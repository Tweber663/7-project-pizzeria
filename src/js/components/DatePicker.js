import BaseWidget from '../components/BaseWidget.js';
import utils from '../utils.js';
import {select, settings} from '../settings.js';

class DatePicker extends BaseWidget{
  constructor(wrapper){
    //1st argument widget wrapper, 2nd starting value is current date 
    //utlip.datetoStri transform our date into string format '2024-03-10'
    super(wrapper, utils.dateToStr(new Date())); 
    const thisWidget = this;
    //🔹 Wrapper text date field
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    // Launching function when class starts
    thisWidget.initPlugin();
  }
  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date();
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    //Flatpicker plugin function, takes two arguments
    //🔹1st Wrapper text date field, 2nd picker options
    //Flatpicker now starts by simply triggering in the constr() above
    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      locale: {
        firstDayOfWeek: 1
      },
      disable: [
        function(date) {
          return (date.getDay() === 1);
        }
      ],
      onChange: function(selectedDates, dateStr) {
        thisWidget.value = dateStr;
      },
    });
  }

  //Three method below ensure that the '2024-03-10' will work with the 'setter' in base class
  parseValue(value){
    return value;
  }

  isValid(){
    return true;
  }

  renderValue(){

  }
}

export default DatePicker;
