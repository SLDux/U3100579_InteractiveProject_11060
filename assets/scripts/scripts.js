//BEN: Let's make an array to hold the results. 
var allPlantsArray = new Array();
var filteredPlantArray = new Array();

// Load the function when the document is ready
$(document).ready(function () {

    //Geolocation
    //Variable for location 
    var newlat = '';
    var newlon = '';
    //Set default location to Canberra
    var defaultlat = '-35.28346';
    var defaultlon = '149.12807';
    //Default location for opencage API 
    var defaultRLocation = '-35.28346+149.12807';



    //Get location information from browser 
    //If there is a geolocation recorded 
    if (navigator.geolocation) {
        //Log the geolocation data 
        console.log(navigator.geolocation);

        //If you can retrieve a location 
        function success(position) {
            var crds = position.coords;
            console.log('Latitude: ' + crds.latitude);
            console.log('Longitude: ' + crds.longitude);

            //Get lat and lon for ALA API
            newlat = crds.latitude;
            newlon = crds.longitude;

            //Format location variable for opencage API
            var RLocation = crds.latitude + '+' + crds.longitude;

            //Run function to get plant occurences, sending location data
            getPlantOccur(newlat, newlon);
            //Run function to get location name, sending location data
            locationName(RLocation);
        }

        //Cannot retrieve the function location: error
        function error(err) {
            console.warn('ERROR(' + err.code + '): ' + err.message);

            //Run function to get plant occurences sending default location
            getPlantOccur(defaultlat, defaultlon);
            //Run function to get location name, sending default location
            locationName(defaultRLocation);
        }

        //Request to allow the location data from the browser 
        navigator.geolocation.getCurrentPosition(success, error);

        //Browser doesn't support geolocation: show error
    } else {
        showError();

    }

});

//Reverse geocode for location name 
function locationName(currentRLocation) {

    //API Key can callback url
    var GLKey = 'b3c6f8195444484eabbbfa78c4ab681f';
    var GLurl = 'https://api.opencagedata.com/geocode/v1/json?q=' + currentRLocation + '&key=' + GLKey;

    //Request reverse geolocation data
    $.getJSON(GLurl, function (Locationdata) {
        console.log(Locationdata);
        //Display data
        console.log(Locationdata.results[0].components.suburb);
        console.log(Locationdata.results[0].components.state_code);
        console.log(Locationdata.results[0].components.postcode);
        $('.Lsuburb').append(Locationdata.results[0].components.suburb);
        $('.Lstate').append(Locationdata.results[0].components.state_code);
        $('.Lpost').append(Locationdata.results[0].components.postcode);
    });


}

//Get plant occurances from location data function. 
function getPlantOccur(currentlat, currentlon) {
    console.log('in get plant occurence fn');
    var url = 'https://biocache-ws.ala.org.au/ws/occurrence/facets?q=kingdom:Plantae&lat=' + currentlat + '&lon=' + currentlon + '&radius=0.5&facets=taxon_name&flimit=100';

    console.log(url);

    //Make request to server using api call
    $.getJSON(url, function (data) {
        //Output request
        //Display in console
        console.log(data);

        //If there are occurences for your location
        if (data[0]) {

            //BEN: loop through field results (complicated data structure)
            for (z = 0; z < data[0].fieldResult.length; z++) {
                var item = data[0].fieldResult[z];

                //BEN: create an object (to set up our own data structure)
                var obj = {}

                //BEN: now add the plant name to it
                obj.plantName = item.label;

                //BEN: Add the object to the array
                allPlantsArray.push(obj);

            }




            //BEN: wait 1 second before executing the next function to ensure the data has loaded
            setTimeout(function () {
                getPlantTR(allPlantsArray);
            }, 1000);

            //If no occurances, show error, display no results
        } else {
            console.log('We can not find any recorded occurances for your area');
            $('.mainResults').append('<p class="err">Data incomplete: Cannot find any recorded plants for your area</p>');
        }
    });
}


//Function to get details from Trefle using species name
function getPlantTR(allPlantsArray) {
    console.log('in get plant');

    //Trefle API key and url
    var TRkey = 'Uy9Oa00yaW42ZXlwYWtaY1BEaTdjUT09';

    //BEN: basically need to change the order of how we do things

    //check array contents
    console.log('plant array length: ' + allPlantsArray.length)

    console.log(allPlantsArray);

    //BEN: change back to allPlantsArray.length
    for (i = 0; i < allPlantsArray.length; i++) {
        currentPlant = allPlantsArray[i];
        console.log(currentPlant.plantName);

        //create url with plantname from array
        var TRurl = 'https://cors-anywhere.herokuapp.com/https://trefle.io/api/plants/?&token=' + TRkey + '&scientific_name=' + currentPlant.plantName;

        $.getJSON(TRurl, function (TRdata) {

            //BEN: if there is some data, add it to the array
            if (TRdata.length != 0) {

                 if (TRdata[0].complete_data == true) {
                     
                //BEN ok, so now we want to only add the plants with data to our array,
                // to do that we'll push them into the filtteredPlantsArray
                //BEN: create an object (to set up our own data structure)
                var obj = {}

                //BEN: grab the current plant name for the first array
                //                obj.plantName = currentPlant.plantName;

                //add in the id and slug
                obj.id = TRdata[0].id;
                obj.slug = TRdata[0].slug;

                //BEN: to make it easier, let's get the rest of the data now
                var TRDurl = 'https://cors-anywhere.herokuapp.com/https://trefle.io/api/plants/' + TRdata[0].id + '?&token=' + TRkey;

                $.getJSON(TRDurl, function (TRDdata) {
                    console.log(TRDdata);


                    // Display image 
                    if (TRDdata.images.length > 0) {
                        //if there is an image then set it
                        obj.image = TRDdata.images[0].url;
                    }


                    // Display scientific name
                    obj.scientific_name = TRDdata.scientific_name;

                    // Display common name
                    obj.common_name = TRDdata.common_name;

                    // Display toxcicity
                    obj.toxicity = TRDdata.main_species.specifications.toxicity;

                     //Get other details. 
            
                    //Flowers
                    obj.flower_colour = TRDdata.main_species.flower.color;
                    //Leaves
                    obj.foliage = TRDdata.main_species.foliage.texture;
                    obj.foliage_colour = TRDdata.main_species.foliage.color;
                    //Seeds
                    obj.seeds_period = TRDdata.main_species.seed.bloom_period;
                    
                    
                    //Growing conditions
                    obj.duration = TRDdata.main_species.duration;
                    obj.drought_tolerant = TRDdata.main_species.growth.drought_tolerance;
                    obj.shade_tolerant = TRDdata.main_species.growth.shade_tolerance;
                    obj.fire_resistant = TRDdata.main_species.specifications.fire_resistance;
                    obj.grow_habit = TRDdata.main_species.specifications.growth_habit;
                    obj.grow_period = TRDdata.main_species.specifications.growth_period;
                    obj.lifespan = TRDdata.main_species.specifications.lifespan;
                    obj.height = TRDdata.main_species.specifications.mature_height.cm;
                    
                    
                    //Family common name 
                    obj.family_name = TRDdata.family_common_name;
                    
                });
                     



                //BEN: now push all the new object data to the array
                filteredPlantArray.push(obj);
                    
                 

                //just checking the content is in the array
                //console.log(filteredPlantArray);


                 } else {
                     //Data not complete. Do nothing
                    
                     
                 }
            } else {
                //no data, show error, do nothing.
            
            }

        });



    } //close loop

    //BEN:
    //Now go off and create HTML

//I had to make the wait time longer, as it was still diplaying undefined, before it loaded the data from the api's. My internet is very slow.
    setTimeout(function () {
        createHTML();
    }, 130000);


 
}


      //Display the data on the page, by creating html with jQuery.
function createHTML() {
    console.log('in create HTML function');

    console.log(filteredPlantArray);

    //For each plant in the filtered plants array
    for (i = 0; i < filteredPlantArray.length; i++) {        
        var plant = filteredPlantArray[i];
        console.log(filteredPlantArray[i]);
        
      //  if (plant.image == undefined) {
            //put an image placeholder if no image
            
       // }
        
         
        
        
        //create html elements
        var container = $('<div class="R">');

        var imageContainer = $('<div class="imgResult">');
        var infoContainer = $('<div class="infoResult">');

        imageContainer.append('<img width="300" id="'+ plant.id + '" class="TRimg" src="' + plant.image + '"></img>');

        infoContainer.append('<div class="Minfo">Scientific name: ' + plant.scientific_name + '</div>');
        infoContainer.append('<div class="Minfo">Common name: ' + plant.common_name + '</div>');
        
        //Display smily face icon with toxicity information
        switch(plant.toxicity) {
            case "None":
                infoContainer.append('<div class="Minfo">Toxicity: ' + plant.toxicity + '<div id="none"></div>');
                break;
            case "Slight":
                infoContainer.append('<div class="Minfo">Toxicity: ' + plant.toxicity + '<div id="slight"></div>');
                break;
            case "Moderate":
                infoContainer.append('<div class="Minfo">Toxicity: ' + plant.toxicity + '<div  id="moderate"></div>');
                break;
            case "Severe":
                infoContainer.append('<div class="Minfo">Toxicity: ' + plant.toxicity + '<div  id="severe"></div></div>');
                break;
            default: 
                infoContainer.append('<div class="Minfo">Toxicity: ' + plant.toxicity + '</div>');
        }

        $(container).append(imageContainer);
        $(container).append(infoContainer);
        
        $('.mainResults').append(container);
        
        
        //Details
        
        
        //Add the details information to the page as well. 
        var plantHeight = Math.round(plant.height);
        
        //Family
        infoContainer.append('<div class="Dinfo">Family: ' + plant.family_name + '</div>');
        
        //Description
        infoContainer.append('<h3>Description:</h3><div class="Dinfo">Has <em>' + plant.flower_colour + '</em> flowers. Foliage is <em>' + plant.foliage_colour + '</em> and <em>' + plant.foliage + '</em>. Seeds bloom in <em>' + plant.seeds_period + '</em>.</div>');

        
        //Growing conditions
        infoContainer.append('<h3>Growing conditions:</h3><div class="Dinfo">Has <em>' + plant.duration + '</em>, <em>' + plant.grow_habit + '</em> growth. Grows in <em>' + plant.grow_period + '</em>. Has a <em>' + plant.lifespan + '</em> lifespan, and grows to a height of <em>' + plantHeight + '</em> cm.</div>');
    
        infoContainer.append('<div class="Dinfo">Drought tolerance: ' + plant.drought_tolerant + ' </div>');
    
        infoContainer.append('<div class="Dinfo">Shade tolerance: ' + plant.shade_tolerant + ' </div>');
    
        infoContainer.append('<div class="Dinfo">Fire resistance: ' + plant.fire_resistant + ' </div>');
                    
        
        //The Extra bits for the lightbox/modal that didn't work. 
        
//        var lightboxid = "Lightbox" + plant.id;
//        var boxid = "box" + plant.id;
//        
//         //Make details lightbox
//        var detailsContainer = $('<div id="' + lightboxid + '" class="modal"><span id ="' + boxid + '" class="close" onclick="closelightbox();">&times;</span><div class="modalContent"');
//
//        var detailsImageContainer = $('<div class="imgDetail">');
//        var detailsInfoContainer = $('<div class="infoDetail">'); 
//     
//        var plantHeight = Math.round(plant.height);
//
//        detailsImageContainer.append('<img width="500" class="Dimg" src="' + plant.image + '"></img>');
//
//        detailsInfoContainer.append('<div class="Dinfo">Scientific name: ' + plant.scientific_name + '</div>');
//        detailsInfoContainer.append('<div class="Dinfo">Common name: ' + plant.common_name + '</div>');
//        detailsInfoContainer.append('<div class="Dinfo">Toxicity: ' + plant.toxicity + '</div>');
//        
//        //Family
//        detailsInfoContainer.append('<div class="Dinfo">Family: ' + plant.family_name + '</div>');
//    
//        //Description
//        detailsInfoContainer.append('<h3>Description:</h3><div class="Dinfo">Has <em>' + plant.flower_colour + '</em> flowers. Foliage is <em>' + plant.foliage_colour + '</em> and <em>' + plant.foliage + '</em>. Seeds bloom in <em>' + plant.seeds_period + '</em>.</div>');
//                     
//        
//        //Growing conditions
//        detailsInfoContainer.append('<h3>Growing conditions:</h3><div class="Dinfo">Has <em>' + plant.duration + '</em>, <em>' + plant.grow_habit + '</em> growth. Grows in <em>' + plant.grow_period + '</em>. Has a <em>' + plant.lifespan + '</em> lifespan, and grows to a height of <em>' + plantHeight + '</em> cm.</div>');
//    
//        detailsInfoContainer.append('<div class="Dinfo">Drought tolerance: ' + plant.drought_tolerant + '</div>');
//        detailsInfoContainer.append('<div class="Dinfo">Shade tolerance: ' + plant.shade_tolerant + '</div>');
//        detailsInfoContainer.append('<div class="Dinfo">Fire resistance: ' + plant.fire_resistant + '</div>')
//
//        $(detailsContainer).append(detailsImageContainer);
//        $(detailsContainer).append(detailsInfoContainer);
//        $('.mainResults').append(detailsContainer);
        
       
       

       
   
    
}
   

    //Run functions to open/close lightbox
//    openlightbox();
//    closelightbox();
      
    }

//function openlightbox() {
//        
//    $(document).ready(function (){
//   $('.TRimg').click(function(){
//        var myID = $(this).attr("id");
//       var modalid = ("Lightbox" + myID);
//       console.log(modalid);
// //This line didn't work. And I didn't have time to get it working.
//       $(modalid).show();
//   });
//});   
//}

//function closelightbox() {
//     $(document).ready(function (){
//   $('.TRimg').click(function(){
//      var mySID = $(this).attr("id");
//     $("Light" + mySID).hide();
//   });
//});
//}


                    
