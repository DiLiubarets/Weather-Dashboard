$(document).ready(function () {
  // Get time and day with moment.js
  var now = moment().format("dddd");
  var fullDate = moment().format("MMMM Do YYYY ");
  $("#weatherDashboard").append(fullDate);

  // API weather network with key
  var queryCurrent = "https://api.openweathermap.org/data/2.5/weather?q=";
  var queryFiveday = "https://api.openweathermap.org/data/2.5/forecast?q=";
  var UV = "https://api.openweathermap.org/data/2.5/uvi?";
  var appID = "&appid=7e882bb8ed2dcfe85cf3abf5390335b4";
  var cityList = [];

  //localStorage.clear()
  init();

  function init() {
    if (localStorage.getItem("cities")) {
      cityList = JSON.parse(localStorage.getItem("cities"));
      for (city of cityList) {
        console.log(city);
        showCity(city);
      }
    }
  }

  // Info for current day
  function getCurrent(city) {
    var currentDay = $("#current-day");
    currentDay.html("");
    currentDay.append("<h2>" + city + "</h2>");
    currentDay.append("<p>" + now + "<p>");

    if (city !== "") {
      $.ajax({
        url: queryCurrent + city + "&units=metric" + appID,
        type: "GET",
        dataType: "jsonp",
      }).then(function (data) {
        var show = showData(data);
        currentDay.append(show);
      });
    } else {
      $("error").html("Field cannot be empty!");
    }
  }
  // Function show data on current day
  function showData(data) {
    UVIndex(data);
    return (
      "<h2>" +
      data.weather[0].main +
      "</h2>" +
      "<img src=https://openweathermap.org/img/w/" +
      data.weather[0].icon +
      ".png alt=" +
      data.weather.value +
      ' width="50" height="50"></img>' +
      '<p class="humidity"> Humidity: ' +
      data.main.humidity +
      "%</p>" +
      '<p class="temperature">Temperature: ' +
      Math.trunc(data.main.temp_max) +
      "&deg;C</p>" +
      '<p class="wind-speed">Wind Speed: ' +
      data.wind.speed +
      " m/s</p>"
    );
  }
  // Function for show UV index
  function UVIndex(data) {
    $.ajax({
      url:
        UV +
        appID +
        "&lat=" +
        data.coord.lat +
        "&lon=" +
        data.coord.lon +
        "&cnt=" +
        5,
      type: "GET",
    }).then(function (data) {
      console.log(data);
      var currentDay = $("#current-day");
      currentDay.append(
        '<p class="uv">UV Index: ' + "<span>" + data.value + "</span></p>"
      );
    });
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
    $("#cardsForecast").html("");

    for (let i = 0; i <=5; i++) {
      var new_date = moment().add(i, "days").format("dddd");
      let forecast = function (data) {
        return (
          ' <div class="col-sm-12  col-md-6 col-lg-2">' +
          '<p class="date "></p>' +
          new_date +
          "<img src=https://openweathermap.org/img/w/" +
          data.list[i*8].weather[0].icon +
          ".png alt=" +
          data.list[i*8].weather.description +
          ' width="50" height="50">' +
          '<p class="temperature">Temp: ' +
          Math.trunc(data.list[i*8].main.temp_max) +
          "&nbsp;&deg;C</p>" +
          '<p class="humidity">Humidity: ' +
          data.list[i*8].main.humidity +
          "%</p>" +
          "</div>"
        );
      };
      $("#cardsForecast").append(forecast(data));
    }
  }

  // Btn-search for the weather in selected cities
  $("#btn-search").click(function () {
    var city = $("#input-city").val();
    getCurrent(city);
    getFiveday(city);
    if (!isDuplicate(city)) {
        showCity(city);
        save(city);
    }

  });

  function showCity(city) {
    $("#presetCities").append(
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
  $("#presetCities").click(function (event) {
    var city = event.target.textContent;
    getCurrent(city);
    getFiveday(city);
  });
});
