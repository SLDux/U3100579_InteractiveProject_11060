// Load the function when the document is ready
$(document).ready(function() { 
    
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
function getPlantOccur(currentlat, currentlon){
    var url = 'https://biocache-ws.ala.org.au/ws/occurrence/facets?q=kingdom:Plantae&lat=' + currentlat + '&lon=' + currentlon + '&radius=0.5&facets=taxon_name';
    
    //Make request to server using api call
    $.getJSON(url, function(data){
        //Output request
        //Display in console
        console.log(data);
        
    //If there are occurances for your location
      if (data[0]) {
          
           //Display the name of the occurences
        var occurrenceID = data[0].fieldResult;
        
        //For each occurance display the species id and count data.
        for (var i = 0; i < occurrenceID.length; i++) {
        
            //Display the name and count data in console
            //Save species id as variable
            var TXname = occurrenceID[i].label;
            
            //Use the recorded name ID to retrieve more details
            //Run funtcion to get plant details from Trefle sending plant name
            getPlantTR(TXname);
            }
        }
          
        //If no occurances, show error, display no results
      } else {
          
          console.log('We can not find any recorded occurances for your area');
      }              
       
                        
        });                  
                    
 }

//Function to get details from Trefle using species name
function getPlantTR(Pname){
    //Trefle API key and url
    var TRkey = 'Uy9Oa00yaW42ZXlwYWtaY1BEaTdjUT09';
    var TRurl = 'https://cors-anywhere.herokuapp.com/https://trefle.io/api/plants/?&token=' + TRkey + '&scientific_name=' + Pname;
    
    //Make request to server using api call
    $.getJSON(TRurl, function(TRdata){
       
        //If Trefle has data on the plant, display data
        if (TRdata[0]) {
            //Output request
            //Display in console
            console.log(TRdata);
            
            //If Trefle data is complete then run function to get trefle details
            if (TRdata[0].complete_data == true) {
                //Save plant id as variable
                var TRid = TRdata[0].id;
                
                //Create divs to put details in
                 //Create divs to put data in
                $('<div class="R"><div class="imgResult"></div><div class="infoResult"> </div></div>').appendTo('.mainResults');         
                
                //Run funtion to get details from Trefle sending plant id
                getDetailsTR(TRid);
                //If Trefle data is not complete
            } else {
                console.log('Data is not complete');
            }            
            
        //If Trefle has no data on plant display error
        } else {
            console.log('No Trefle data avaible for this plant');
        }
    });
}

//Function to get plant details from Trefle using plant id
function getDetailsTR(plantID) {
    
    //Trefle key and details url
    var TRDkey = 'Uy9Oa00yaW42ZXlwYWtaY1BEaTdjUT09';
    var TRDurl = 'https://cors-anywhere.herokuapp.com/https://trefle.io/api/plants/' + plantID + '?&token=' + TRDkey;
    
    //Make request to server using api call
    $.getJSON(TRDurl, function(TRDdata){
        //Output request
        //Display in console
        console.log(TRDdata);
       
        
        //this is messed up. Maybe something to do with how i'm looping etc. the boxes are made right below, but then I get everything all at once in each one, not one in one. 
        
        
        //Display image 
        var TRimgLink = TRDdata.images[0].url;
       // $('.TRimg').attr('src', TRimgLink);
        $('<img class="TRimg" src="' + TRimgLink + '"></img>').prependTo('.imgResult');
        
        
        //Display scientific name
        var TRSname = TRDdata.scientific_name;
        //$('.Sn').html(TRSname);
        $('<div class="Minfo">Scientific name: ' + TRSname + '</div>').appendTo('.infoResult');
        
        
        //Display common name
        var TRCname = TRDdata.common_name;
        //$('.Cn').html(TRCname);
        $('<div class="Minfo">Common name: ' + TRCname + '</div>').appendTo('.infoResult');
        
        
        //Display toxcicity
        var tox =TRDdata.main_species.specifications.toxicity;
        //$('.Tx').html(tox);
         $('<div class="Minfo">Toxcitiy: ' + tox + '</div>').appendTo('.infoResult');
        
      
        
        
    });
    
}
                    
                    