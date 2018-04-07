// graph start dates
var portfolioGraphDate, compareGraphDate;

// table start times
var portfolioTableDate, compareTableDate;

$('.selector>.item').click(function(e) {
  var timeRangeElement = $(e.target);

  // remove 'active' class from other time range menu items
  timeRangeElement.siblings().removeClass('active');
  timeRangeElement.addClass('active');

  var startDate = getStartDate(timeRangeElement.text())

  var section = timeRangeElement.parent().attr('id').split('-')[0];
  if (section == 'portfolio') {
    portfolioGraphDate = startDate;
  } else if (section == 'compare') {
    compareGraphDate = startDate
  }
  console.log(portfolioGraphDate);
  console.log(compareGraphDate);
});
