console.log(navigator);
let dimensionsSelector = document.getElementById('dimensionsSelector');
let fromField = document.getElementById('fromTextField');
let toField = document.getElementById('toTextField');
import {systems} from "./systems.js";
let dimensions = function () {
    let result = {};

    for (let dimension of Object.keys(systems['dimensions'])) {
        let units = [];
        for (let unit of Object.keys(systems['dimensions'][dimension].units)) {
            units.push(unit);
        }
        result[dimension] = units;
    }

    return result;
}();

//import {capitalizeString} from './capitalizer';

/* 
-- NEXT STEP --

DINAMICALLY GENERATE THE CONVERTING FUNCTIONS. TAKE IN CONDERATION CONVERSIONS THAT REQUIRE
ADDITIONAL COMPUTATION, THOSE INCLUDING AN OFFSET, UNCERTANTY, ETC.

A GOOD APPROACH TO START COULD BE A STATIC METHOD ON A MAIN/FATHER CLASS. WE'LL START FROM THERE
AND MOVE FORWARD DEPENDING ON OUR RESULTS.

REVIEW ELOQUETJAVASCRIPT.NET CHAPER 6 AND 7.

UPDATE: 03/30/2022 -- 

APPLICATION IS ALMOST FULLY FUNCTIONAL.

PENDING CORRECTIONS:

1. DINAMICALLY ADD THE REST OF THE DIMENSIONS.
2. REVIEW CONVERSION FUNCTION/FORMULA TO WORK WITH UNITS THAT HAVE OFFSETS.
3. ADD CSS STYLES

UPDATE: 04/04/2022 --

CONVERSTION FORMULA NOT WORKING FOR CERTAIN DIMENSIONS, CONSULT WIKIPEDIA DOCUMENTATION:
https://en.wikipedia.org/wiki/Conversion_of_units

UPDATE: 04/16/2022 --

FORMULAS TO CONVERT FROM AND TO BASE UNITS ARE NOW WORKING BETWEEN DIMENSIONS THAT IMPLEMENT OFFSETS.
AS AN ATTEMPT TO FINISH THE APP, I'LL MAKE THE FUNCTIONS WORK DIFFERNTLY DEPENDING ON THE TYPE
OF DIMENSION BEING CONVERTED, MEANING, IF I'M CONVERTING TEMPERATURE OR LENGTH, THE FUNCTION
SHOULD ACT DIFFERENTLY. I COULD COME BACK LATER TO IMPROVE THE APP AND ADD ADDITIONAL FUNCTIONALITIES,
BUT FOR THE SAKE A MOVING ON AND LEARNING NEW THINGS, I'LL CONCLUDE THIS ONE FOR NOW.

WILL ADD SOME CSS STYLES AFTER COMPLETING THE LINKEDIN LEARNING CSS COURSE.

LATER ON READING:

CONVERTJS APP: 
https://github.com/forgedsoftware/measurementjs

UPDATE: 04/17/2022 --

APPLICATION IS FULLY FUNCTION, INCLUDING TEMPERATURE DIMENSIONS. CODE IS UGLY AS FUCK, BUT IT WORKS AND I'VE
LEARNT A LOT. IMPLEMENTING PREFIXES CALCULATION AND CSS STYLES WILL REMAIN FOR ANOTHER TIME. FOR THE MOMENT
THIS APP SERVERD ITS PURPOSE.

*/

function start (event) {
    
    let lists = document.getElementsByClassName('unitsSelector');
    let option;

    if (!event) {

        option = [{ value: 'time' }];


    } else {

        option = Array.from(event.target.options)
            .filter(item => item.selected == true);

    }

        

    for (let list of Array.from(lists)) {
        list.innerHTML = '';
        fromField.value = '';
        toField.value = '';
        let node = elt('select');
        node.addEventListener('change', event => {
            fromField.value = '';
            toField.value = '';
        })
        
        for (let value of dimensions[option[0].value]) {
            
            let newValue = value.replace(/([A-Z])/g, " $1");
            let finalValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
            let node1 = elt('option', finalValue);
            node1.value = value;
            node1.setAttribute('data-unit', value);
            node.appendChild(node1);
        }
        list.appendChild(node);
    }
}

start();

function toBaseUnitConverter (initialUnitAmount, offset, multiplier) {

    return (initialUnitAmount - offset) * multiplier;

}

function fromBaseUnitConverter (initialUnitAmount, offset, multiplier) {

    return (initialUnitAmount / multiplier) + offset;

}

function toBaseUnitConverterT (initialUnitAmount, offset, multiplier) {

    return (initialUnitAmount - offset) / multiplier;

}

function fromBaseUnitConverterT (initialUnitAmount, offset, multiplier) {

    return (initialUnitAmount * multiplier) + offset;

}



function appStart () {

    let placeHolder = document.getElementById('dimensionsSelector');
    let nodeSelect = elt('select');
    nodeSelect.id = 'dimensionSelector1';

    for (let dimension of Object.keys(systems.dimensions)) {
        let str = dimension.replace(/([A-Z])/g, " $1");
        let str2 = str.charAt(0).toUpperCase() + str.slice(1);

        let nodeOption = elt('option', str2);
        nodeOption.value = dimension;
        nodeSelect.appendChild(nodeOption);
        

    }

    placeHolder.appendChild(nodeSelect);
}

appStart();

function converterCreator() {
    let converters = {};

    for (let dimension of Object.keys(dimensions)) {
        //let cDimension1 = dimension.slice(1);
        //let cDimension2 = dimension.charAt(0).toUpperCase() + cDimension1.slice(0);

        let classHolder = class {
            constructor(iUnit, amount) {
                this.iUnit = iUnit;
                this.amount = amount;
            }
        }

        for (let unit of Object.keys(systems.dimensions[`${dimension}`].units)) {

            classHolder.prototype[`${unit}`] = function (fromTextField, toTextField, toUnit) {
                let baseUnit = systems.dimensions[`${dimension}`].baseUnit;
                let offset = systems.dimensions[`${dimension}`][`units`][`${toUnit}`].offset || 0;
                let multiplier = systems.dimensions[`${dimension}`][`units`][`${toUnit}`].multiplier || 1;


                if (this.iUnit == baseUnit) {         
                    
                    if (dimension == 'temperature') {

                        return fromBaseUnitConverterT(this.amount, offset, multiplier);

                    } else {

                        return fromBaseUnitConverter(this.amount, offset, multiplier);

                    }
                
                } else if (toUnit == baseUnit) {

                    let multiplier = systems.dimensions[`${dimension}`][`units`][`${this.iUnit}`].multiplier || 1;
                    let offset = systems.dimensions[`${dimension}`][`units`][`${this.iUnit}`].offset || 0;

                    if (dimension == 'temperature') {

                        return toBaseUnitConverterT(this.amount, offset, multiplier);
                    } else {

                        return toBaseUnitConverter(this.amount, offset, multiplier);
                    }
                }
                
                else {

                    let offset = systems.dimensions[`${dimension}`][`units`][`${this.iUnit}`].offset || 0;
                    let multiplier = systems.dimensions[`${dimension}`][`units`][`${this.iUnit}`].multiplier || 1;
                    let offsetTo = systems.dimensions[`${dimension}`][`units`][`${toUnit}`].offset || 0;
                    let multiplierTo = systems.dimensions[`${dimension}`][`units`][`${toUnit}`].multiplier || 1;
                    
                    let toBaseUnit;

                    if (dimension == 'temperature') {

                        toBaseUnit = toBaseUnitConverterT(this.amount, offset, multiplier);

                    } 
                    
                    return fromBaseUnitConverterT(toBaseUnit, offsetTo, multiplierTo);

                }


            }

        }


        converters[`${dimension}`] = classHolder;
    }

    return converters;
}


function elt(type, ...children) {
    let node = document.createElement(type);

    for (let child of children) {
        if (typeof child != 'string') node.appendChild(child);
        else node.appendChild(document.createTextNode(child));
    }
    return node;
}

let converters = converterCreator();


dimensionsSelector.addEventListener('change', start);



fromField.addEventListener("input", event => {
    
    if (isNaN(event.target.value)){return};

    

    let unitFrom = document.getElementsByTagName('select')[1].value;
    let unitTo = document.getElementsByTagName('select')[2].value;
    let selectedDimension = document.getElementById('dimensionSelector1').value;
    
    
       
    let converter = converters[selectedDimension];
    
    toField.value = new converter(unitFrom, event.target.value)[unitTo](event.target.id == 'fromTextField', event.target.id == 'toTextField', unitTo);



});

toField.addEventListener("input", event => {
    if (isNaN(event.target.value)){return};

    let unitFrom = document.getElementsByTagName('select')[1].value;
    let unitTo = document.getElementsByTagName('select')[2].value;
    let selectedDimension = document.getElementById('dimensionSelector1').value;
    
       
    let converter = converters[selectedDimension];
    

    fromField.value = new converter(unitTo, event.target.value)[unitFrom](event.target.id == 'fromTextField', event.target.id == 'toTextField', unitFrom);
    
});








