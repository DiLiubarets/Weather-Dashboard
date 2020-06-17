$(document).ready(function () {
  // Get time and day with moment.js
  var now = moment().format("dddd");
  var fullDate = moment().format("MMMM Do YYYY ");
  $("#weatherDashboard").append(fullDate);

  // API weather network with key2
  var queryCurrent = "https://api.openweathermap.org/data/2.5/weather?q=";
  var queryFiveday = "https://api.openweathermap.org/data/2.5/forecast?q=";
  var UV = "https://api.openweathermap.org/data/2.5/uvi?";
  var imgApi = 'https://openweathermap.org/img/w/';
  var appID = "&appid=7e882bb8ed2dcfe85cf3abf5390335b4";
  var cityList = [];
  var currentDay = $("#current-day");
  var presentCities = $("#presetCities");

  //To clear Local Storage
  //localStorage.clear()
  init();

  function init() {
    if (localStorage.getItem("cities")) {
      cityList = JSON.parse(localStorage.getItem("cities"));
      for (city of cityList) {
        showCity(city);
      }
    }
    getCurrent("Ottawa");

  }

  // Info for current day
  function getCurrent(city) {
    
    if (city !== "") {
      $.ajax({
        url: queryCurrent + city + "&units=metric" + appID,
        type: "GET",
        dataType: "jsonp",
      }).then(function (data) {
          $("#error").html("");
          currentDay.html("");
          currentDay.append("<h2>" + city + "</h2>");
          currentDay.append("<p>" + now + "<p>");
  
          var show = showData(data);
          currentDay.append(show);
          getFiveday(city)
          if (!isDuplicate(city)) {
            showCity(city);
            save(city);
          }
      }).fail(function(){
        $("#error").html("City not found!");
      });
    } else {
      $("#error").html("Field cannot be empty!");
    }
  }
  // Function show data on current day
  function showData(data) {
    UVIndex(data);
    return (
      "<h2>" + data.weather[0].main + "</h2>" +
      "<img src=" + imgApi + data.weather[0].icon + ".png alt=" + data.weather.value + ' width="50" height="50"></img>' +
      '<p class="humidity"> Humidity: ' + data.main.humidity + "%</p>" +
      '<p class="temperature">Temperature: ' +  Math.trunc(data.main.temp_max) +"&deg;C</p>" +
      '<p class="wind-speed">Wind Speed: ' + data.wind.speed + " m/s</p>"
    );
  }
  // Function for show UV index 
  function UVIndex(data) {
    $.ajax({
      url:
        UV + appID + "&lat=" + data.coord.lat + "&lon=" + data.coord.lon + "&cnt=" + 5,
        type: "GET",
    }).then(function (data) {
      var color = UVColor(data.value)

      currentDay.append('<p class="uv">UV Index: ' + data.value + "</p>");
      $(".uv").css("color", color)
    });
  }
  function UVColor(UV) {
    if (UV <= 2) {
      return "green"
    }
    else if (UV <= 5) {
      return "yellow"
    }
    else if (UV <= 7) {
      return "orange"
    }
    else if (UV <= 10) {
      return "red"
    }
    else {
      return "purple"
    }

  }

  // 5-days forecast
  function getFiveday(city) {
    if (city !== "") {
      $.ajax({
        url: queryFiveday + city + "&units=metric" + appID,
        type: "GET",
        dataType: "jsonp",
      }).then(function (data) {
        var shawFiveday = showFiveday(data);
        $("#forecast .day").append(shawFiveday);
      });
    } else {
      $("error").html("Field cannot be empty!");
    }
  }

  function showFiveday(data) {
    var cardForecast = $("#cardsForecast")
    cardForecast.html("");

    for (let i = 0; i < 5; i++) {
      var new_date = moment().add(i, "days").format("dddd");
      let forecast = function (data) {
        return (
          ' <div class="col-sm-12  col-md-6 col-lg-2">' +
          '<p class="date "></p>' + new_date +
          "<img src=" + imgApi + data.list[i * 8].weather[0].icon + ".png alt=" + data.list[i * 8].weather.description + ' width="50" height="50">' +
          '<p class="temperature">Temp: ' + Math.trunc(data.list[i * 8].main.temp_max) + "&nbsp;&deg;C</p>" +
          '<p class="humidity">Humidity: ' + data.list[i * 8].main.humidity + "%</p>" +
          "</div>"
        );
      };
      cardForecast.append(forecast(data));
    }
  }

  // Btn-search for the weather in selected cities
  $("#btn-search").click(function () {
    var city = $("#input-city").val();
    getCurrent(city);
  });

  function showCity(city) {
    presentCities.append(
      '<button type="button" class="list-group-item list-group-item-action">' +
      city +
      "</button>"
    );
  }

  function save(city) {
    cityList.push(city);
    localStorage.setItem("cities", JSON.stringify(cityList));
  }

  function isDuplicate(city) {
    for (cityName of cityList) {
      if (cityName == city) {
        return true;
      }
    }
    return false;
  }

  //  Function takes list of city and display
  presentCities.click(function (event) {
    var city = event.target.textContent;
    getCurrent(city);
  });
});
