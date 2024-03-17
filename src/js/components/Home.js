/* eslint-disable */
import { templates, select} from "../settings.js";
import utils from "../utils.js";

class Home {
    constructor() {
        const thisHome = this; 
        thisHome.render();
    }

    render() {
        const thisHome = this; 

        thisHome.dom = {
           homePageDrop: document.querySelector(select.home.homePageDrop),
           homePageDropWrapper: document.querySelector(select.home.homePageWrapper),
           homePagePayload:document.querySelector(select.home.homePagePayload),
           carousel: document.querySelector('.carousel')
        }

        const htmlElement = templates.homePagePayload(thisHome.dom.homePageDrop);
        const DOMelement = utils.createDOMFromHTML(htmlElement);

        thisHome.dom.homePageDropWrapper.appendChild(DOMelement);
    

        thisHome.initWidget(DOMelement.querySelector('.carousel'));
    }

    initWidget(carousel) {
        const thisHome = this;

       new Flickity( carousel, {
        // options
        cellAlign: 'left',
        contain: true,
        imagesLoaded: true,
        autoPlay: true,
        });
    }
}

export default Home