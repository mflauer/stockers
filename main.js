// selected timespan
var portfolioTimespan = { //TODO set default values
	startDate: '',
	increment: '' // min, day, week
}
var compareTimespan;

$( "#portfolio-timespan" ).click(function(evt) {
	var clickedTimeElem = evt.target;

	// remove 'active' class from other timespan menu items
	$('#portfolio-timespan .item').removeClass('active');

	$(clickedTimeElem).addClass('active')
	var clickedTime = $(clickedTimeElem).text();

	portfolioTimespan = {
		startDate: getStartDateString(clickedTime),
		increment: TIME_TEXT_TO_INCREMENT[clickedTime]
	}

	console.log(portfolioTimespan)

});







