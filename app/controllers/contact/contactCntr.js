module.exports = function ContactCntr($scope)
	{

	setTimeout(function()
        {
		$('#global_spinner').removeClass('on').addClass('off');
        },300)

	}

module.exports.$inject = ['$scope'];