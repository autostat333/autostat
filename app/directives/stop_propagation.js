//if prevent closing - set jquery special fake event
//working only to prevent JQUERY triggering
//for dropdown using, because when sropdown directive firing - li is not ready (because ng-repeat)
//this directive for every li elems firing and set fake stop-propagation event
module.exports = function StopPropagation()
	{
	return {
		link:function(scope,elem,attrs)
			{

	
			$(elem).on('click',function(e)
				{
				if (!e){e = window.event}
				e.stopPropagation();
				})

			}

		}


	}


